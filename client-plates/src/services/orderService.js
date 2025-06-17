import api from './api';

/**
 * Create a new order
 * @param {object} orderData - Order data with items, shipping method, etc.
 * @returns {Promise} - API response
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} - API response
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Get user's orders
 * @returns {Promise} - API response with user orders
 */
export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Update order to paid status
 * @param {string} orderId - Order ID
 * @param {object} paymentResult - Payment result data
 * @returns {Promise} - API response
 */
export const updateOrderToPaid = async (orderId, paymentResult) => {
  const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
  return response.data;
};