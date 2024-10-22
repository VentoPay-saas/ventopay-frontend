import request from './request';

const subscriptionService = {
  getAll: (params) => request.get('dashboard/admin/subscriptions', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/subscriptions/${id}`, { params }),
  update: (id, data) =>
    request.put(`dashboard/admin/subscriptions/${id}`, data),
  addOption: (data) =>
    request.post(`dashboard/admin/subscription-option`, data),
  getOptions: (params) =>
    request.get(`dashboard/admin/subscription-option`, { params }),
  deleteOption: (params) =>
    request.delete(`dashboard/admin/subscription-option/delete`, { params }),
  getOptionById: (id, params) =>
    request.get(`dashboard/admin/subscription-option/${id}`, { params }),
  updateOption: (id, data) =>
    request.put(`dashboard/admin/subscription-option/${id}`, data),
};

export default subscriptionService;
