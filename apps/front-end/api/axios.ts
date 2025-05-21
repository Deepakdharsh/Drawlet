import axios from "axios"

export const api=axios.create({
    baseURL:"http://localhost:3000/api/v1",
    withCredentials:true
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const response = await api.post('/auth/refresh');
          const token = response.data.token;
          
          localStorage.setItem('token', token);
          originalRequest.headers.token=token
          return api(originalRequest);
        } catch (refreshError) {
          console.log('Refresh token failed', refreshError);
          localStorage.removeItem('token');
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
);