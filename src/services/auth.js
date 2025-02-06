import request from './request';

const authService = {
  login: (data) => request.post('dashboard/admin/auth/login', data),
  logout: (data) => request.post('dashboard/admin/auth/logout', data),
};

export default authService;
