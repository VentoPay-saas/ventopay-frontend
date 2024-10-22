import request from './request';

const kitchenService = {
  getAll: (params) => request.get('dashboard/admin/kitchen', { params }),
  // getById: (id, params) =>
  //   request.get(`dashboard/admin/ads-packages/${id}`, { params }),
  // create: (data) =>
  //   request.post(`dashboard/admin/ads-packages`, data ),
  // update: (id, data) =>
  //   request.put(`dashboard/admin/ads-packages/${id}`, data),
  // delete: (params) =>
  //   request.delete(`dashboard/admin/ads-packages/delete`, { params }),
  // setActive: (id) => request.get(`dashboard/admin/ads-package/${id}/active`),
};

export default kitchenService;
