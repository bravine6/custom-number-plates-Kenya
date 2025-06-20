const express = require('express');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow order creation without authentication in development/testing
const orderCreateMiddleware = process.env.NODE_ENV === 'production' 
  ? [protect, createOrder] 
  : [createOrder];

router.route('/')
  .post(orderCreateMiddleware)
  .get(protect, getMyOrders);

router.get('/admin', protect, admin, getOrders);

// Allow public access to order details for order success page in development/testing
const orderGetMiddleware = process.env.NODE_ENV === 'production' 
  ? [protect, getOrderById] 
  : [getOrderById];

router.route('/:id')
  .get(orderGetMiddleware);

router.put('/:id/pay', protect, updateOrderToPaid);

router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;