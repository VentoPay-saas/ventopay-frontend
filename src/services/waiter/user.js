import request from '../request';

const userService = {
  getAll: (params) =>
    request.get('dashboard/waiter/users/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/waiter/users/${id}`, { params }),
  create: (data) => request.post('dashboard/waiter/users', data),
  shopUsers: (params) =>
    request.get('dashboard/waiter/shop/users/paginate', { params }),
  shopUserById: (uuid, params) =>
    request.get(`dashboard/waiter/shop/users/${uuid}`, { params }),
  profileFirebaseToken: (data) =>
    request.post(`dashboard/user/profile/firebase/token/update`, data),
  changeActiveStatus: (uuid) =>
    request.post(`dashboard/waiter/users/${uuid}/change/status`),
  addUserAddress: (uuid, data) =>
    request.post(`dashboard/waiter/users/${uuid}/address`, data),
};

export default userService;
