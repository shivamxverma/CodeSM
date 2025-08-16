import axios from 'axios';
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true                   
});

api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await api.post('/users/refresh-token');
        return api(original);
      } catch {
        window.location.href = '/login';
      }
    }
    throw err;
  }
);

export default api;