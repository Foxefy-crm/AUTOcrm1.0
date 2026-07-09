import dataProviderSimpleRest, { axiosInstance } from '@refinedev/simple-rest';

export const API_URL = 'http://localhost:8001';
export { axiosInstance };

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider = dataProviderSimpleRest(API_URL, axiosInstance);
