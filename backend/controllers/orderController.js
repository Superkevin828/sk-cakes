const Order = require('../models/Order');
const Product = require('../models/Product');
const pesapalService = require('../services/pesapalService');

/**
 * @desc    Submit a new order (Public checkout)
 * @route   POST /api/orders
 * @access  Public
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, deliveryAddress, items, notes } = req.body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone number, and selected items list are required to submit an order.'
      });
    }

    let computedTotal = 0;
    const validatedItems = [];

    // Verify and calculate active prices against the official product database
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} was not found in our catalog.`
        });
      }

      // Decrement stock if relevant
      if (product.stock > 0) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }

      const itemTotal = product.price * item.quantity;
      computedTotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Save final order document
    const newOrder = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items: validatedItems,
      totalAmount: computedTotal,
      notes,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: req.body.paymentMethod || 'cash'
    });

    res.status(201).json({
      success: true,
      message: 'Your order has been submitted successfully!',
      id: newOrder._id,
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a Pesapal payment session for the order
 * @route   POST /api/orders/:id/pay-pesapal
 * @access  Public
 */
exports.createPesapalPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order has already been paid.' });
    }

    // No real Pesapal credentials configured -> local dev simulator only.
    if (!pesapalService.isConfigured()) {
      const trackingId = `SIM-${order._id.toString().slice(-8)}-${Date.now()}`;
      order.pesapalTrackingId = trackingId;
      order.paymentMethod = 'pesapal';
      await order.save();

      return res.status(200).json({
        success: true,
        simulation: true,
        order_tracking_id: trackingId,
        redirect_url: null,
        message: 'Pesapal simulation mode active (no PESAPAL_CONSUMER_KEY/SECRET set). Complete payment using the simulator.'
      });
    }

    // Real Pesapal v3 flow: auth -> register IPN (cached) -> submit order -> get hosted checkout url.
    const pesapalResponse = await pesapalService.submitOrderRequest(order);

    if (!pesapalResponse.redirect_url) {
      throw new Error(pesapalResponse.error?.message || 'Pesapal did not return a redirect_url.');
    }

    order.pesapalTrackingId = pesapalResponse.order_tracking_id;
    order.paymentMethod = 'pesapal';
    await order.save();

    return res.status(200).json({
      success: true,
      simulation: false,
      redirect_url: pesapalResponse.redirect_url,
      order_tracking_id: pesapalResponse.order_tracking_id
    });
  } catch (error) {
    console.error('Pesapal payment initiation failed:', error.message);
    return res.status(502).json({
      success: false,
      message: `Could not start Pesapal payment: ${error.message}`
    });
  }
};

/**
 * Map a Pesapal status_code to our internal paymentStatus, and apply it to the order.
 */
async function applyPesapalStatusToOrder(order, statusData) {
  // status_code: 0 = INVALID, 1 = COMPLETED, 2 = FAILED, 3 = REVERSED
  const code = statusData.status_code;

  if (code === 1) {
    order.paymentStatus = 'paid';
    if (order.orderStatus === 'pending') order.orderStatus = 'preparing';
  } else if (code === 2 || code === 3) {
    order.paymentStatus = 'failed';
  }
  // code 0 / pending -> leave paymentStatus as-is (still 'pending')

  await order.save();
  return order;
}

/**
 * @desc    Pesapal IPN callback -- Pesapal calls this URL server-to-server
 *          whenever a transaction's status changes.
 * @route   GET/POST /api/orders/pesapal-ipn
 * @access  Public (called by Pesapal, not the browser)
 */
exports.handlePesapalIPN = async (req, res, next) => {
  const params = { ...req.query, ...req.body };
  const orderTrackingId = params.OrderTrackingId || params.orderTrackingId;
  const merchantReference = params.OrderMerchantReference || params.orderMerchantReference;

  try {
    if (!orderTrackingId || !merchantReference) {
      return res.status(400).json({ success: false, message: 'Missing OrderTrackingId/OrderMerchantReference.' });
    }

    const order = await Order.findById(merchantReference);
    if (!order) {
      // Still acknowledge so Pesapal doesn't keep retrying for an order we don't have.
      return res.status(200).json({
        orderNotificationType: params.OrderNotificationType || 'IPNCHANGE',
        orderTrackingId,
        orderMerchantReference: merchantReference,
        status: 200
      });
    }

    const statusData = await pesapalService.getTransactionStatus(orderTrackingId);
    await applyPesapalStatusToOrder(order, statusData);

    // Pesapal expects exactly this acknowledgement shape.
    return res.status(200).json({
      orderNotificationType: params.OrderNotificationType || 'IPNCHANGE',
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200
    });
  } catch (error) {
    console.error('Pesapal IPN handling failed:', error.message);
    // Acknowledge anyway -- Pesapal retries on non-200, and we don't want a
    // transient error on our side to trigger a retry storm.
    return res.status(200).json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId: orderTrackingId || '',
      orderMerchantReference: merchantReference || '',
      status: 500
    });
  }
};

/**
 * @desc    Let the frontend actively re-check payment status after the user
 *          is redirected back from Pesapal's hosted checkout page. Useful
 *          because IPN delivery can lag (or be unreachable in local dev).
 * @route   GET /api/orders/:id/pesapal-status
 * @access  Public
 */
exports.checkPesapalStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid' || !order.pesapalTrackingId || !pesapalService.isConfigured()) {
      return res.status(200).json({ success: true, order });
    }

    const statusData = await pesapalService.getTransactionStatus(order.pesapalTrackingId);
    await applyPesapalStatusToOrder(order, statusData);

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete a SIMULATED Pesapal payment (local dev only).
 * @route   POST /api/orders/:id/complete-simulated-payment
 * @access  Public
 */
exports.completeSimulatedPayment = async (req, res, next) => {
  try {
    // Guardrail: never let this endpoint mark a real order "paid" for free
    // once real Pesapal credentials are configured.
    if (pesapalService.isConfigured()) {
      return res.status(403).json({
        success: false,
        message: 'Simulated payment completion is disabled because live Pesapal credentials are configured.'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'paid';
    if (order.orderStatus === 'pending') {
      order.orderStatus = 'preparing';
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Simulated Pesapal payment completed successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name category imageUrl')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order details
 * @route   GET /api/orders/:id
 * @access  Private/Admin
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name category imageUrl');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order preparation/delivery/payment status
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order milestones updated successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};
