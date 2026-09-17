import axiosClient from './axiosClient';

export const getBranches = () => axiosClient.get('/branches').then((r) => r.data);
export const getProducts = () => axiosClient.get('/products').then((r) => r.data);
