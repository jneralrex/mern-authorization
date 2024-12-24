import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_PRODUCTION_API_URL || import.meta.env.VITE_DEVELOPMENT_API_URL,
    withCredentials: true,
  });
  

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
  
    failedQueue = [];
  };
  
API.defaults.timeout = 10000; // 10 seconds timeout for requests

// Add an Axios interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const logError = (error) => {
        console.error('Token Refresh Error:', error);
        // Optionally log to an external monitoring service like Sentry
      };

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_DEVELOPMENT_API_URL || import.meta.env.VITE_DEVELOPMENT_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.token;

        // Update the headers with the new token
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        isRefreshing = false;

        return API(originalRequest);
      } catch (err) {
        logError(err);
        processQueue(err, null);
        isRefreshing = false;

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
