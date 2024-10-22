import request from '../request';

const sellerBooking = {
  getAll: (params) => request.get('dashboard/seller/user-bookings', { params }),
  getById: (id, params) => request.get(`dashboard/seller/user-bookings/${id}`, {params}),
  create: (data) => request.post('dashboard/seller/user-bookings', data),
  delete: (params) =>
    request.delete(`dashboard/seller/user-bookings/delete`, { params }),
    updateStatus: (id, params) =>
    request.post(
      `dashboard/seller/user-booking/status/${id}`,
      {},
      { params }
    ),
};

export default sellerBooking;
