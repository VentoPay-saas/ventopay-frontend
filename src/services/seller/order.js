import request from '../request';

const orderService = {
  getAll: (params) =>
    request.get('dashboard/seller/orders/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/orders/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/orders', data),
  update: (id, data) => request.put(`dashboard/seller/orders/${id}`, data),
  calculate: (params) => request.get(`rest/order/products/calculate${params}`),
  updateStatus: (id, data) =>
    request.post(`dashboard/seller/order/${id}/status`, data),
  delete: (params) =>
    request.delete(`dashboard/seller/orders/delete`, { params }),
  updateTransactionStatus: (id, data, params) =>
    request.put(`payments/order/${id}/transactions`, data, { params }),
};

export default orderService;
