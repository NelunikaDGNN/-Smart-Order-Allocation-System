import axiosClient from './axiosClient';

export const createOrder = (payload) =>
  axiosClient.post('/orders', payload).then((r) => r.data);

export const getMyOrders = () =>
  axiosClient.get('/orders/mine').then((r) => r.data);

export const cancelOrder = (orderId) =>
  axiosClient.post(`/orders/${orderId}/cancel`).then((r) => r.data);

// Admin
export const getAdminOrders = (params) =>
  axiosClient.get('/admin/orders', { params }).then((r) => r.data);

export const updateOrderStatus = (orderId, status) =>
  axiosClient.patch(`/admin/orders/${orderId}/status`, { status }).then((r) => r.data);

export const getBranchWorkload = () =>
  axiosClient.get('/admin/branches/workload').then((r) => r.data);

export const getStockOverview = () =>
  axiosClient.get('/admin/stock').then((r) => r.data);

export const deleteOrder = (orderId) =>
  axiosClient.delete(`/orders/${orderId}`).then((r) => r.data);

export const createSupportTicket = (orderId, message) =>
  axiosClient.post(`/orders/${orderId}/support`, { message }).then((r) => r.data);

export const getMySupportTickets = () =>
  axiosClient.get('/support/mine').then((r) => r.data);

export const getAdminSupportTickets = (params) =>
  axiosClient.get('/admin/support', { params }).then((r) => r.data);

export const updateSupportTicketStatus = (ticketId, status) =>
  axiosClient.patch(`/admin/support/${ticketId}/status`, { status }).then((r) => r.data);


