import axiosClient from './axiosClient';

export const login = (email, password) =>
  axiosClient.post('/auth/login', { email, password }).then((r) => r.data);

export const register = (email, password, fullName) =>
  axiosClient.post('/auth/register', { email, password, fullName }).then((r) => r.data);

export const me = () => axiosClient.get('/auth/me').then((r) => r.data);
