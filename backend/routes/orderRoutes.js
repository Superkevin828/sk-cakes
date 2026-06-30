const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public checkout
router.post('/', orderController.createOrder);
router.post('/:id/pay-pesapal', orderController.createPesapalPayment);
router.post('/:id/complete-simulated-payment', orderController.completeSimulatedPayment);

// Admin operations
router.get('/', protect, adminOnly, orderController.getAllOrders);
router.get('/:id', protect, adminOnly, orderController.getOrderById);
router.patch('/:id/status', protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;
