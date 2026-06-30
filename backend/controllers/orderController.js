const Order = require('../models/Order');
const Product = require('../models/Product');

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

    const trackingId = `PESAPAL-${order._id.toString().slice(-8)}-${Date.now()}`;
    order.pesapalTrackingId = trackingId;
    order.paymentMethod = 'pesapal';
    await order.save();

    const isSandbox = !process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET || process.env.PESAPAL_SIMULATOR === 'true';

    if (isSandbox) {
      return res.status(200).json({
        success: true,
        simulation: true,
        order_tracking_id: trackingId,
        redirect_url: null,
        message: 'Pesapal simulation mode activated. Complete payment using the simulator.'
      });
    }

    const redirectUrl = `https://www.pesapal.com/checkout?orderId=${order._id}&trackingId=${trackingId}`;
    return res.status(200).json({
      success: true,
      simulation: false,
      redirect_url: redirectUrl,
      order_tracking_id: trackingId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete a simulated Pesapal payment and update the order
 * @route   POST /api/orders/:id/complete-simulated-payment
 * @access  Public
 */
exports.completeSimulatedPayment = async (req, res, next) => {
  try {
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
