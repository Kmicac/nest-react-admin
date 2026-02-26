import axios from 'axios';

import authService from './AuthService';

const axiosInstance = axios.create({
  withCredentials: true,
});

/* Auto refreshes the token if expired */
axiosInstance.interceptors.response.use(
  (response) => response,
  async function (error) {
    const originalRequest = error?.config;

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { token } = await authService.refresh();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
