import axios from "axios";
import config from "../config/app";
import {
  getAuthUserData,
  checkTokenExpire,
  setAuthUserData,
  removeAuthUserData
} from "./auth";

export const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

export const initAuthInterceptor = (store, errorAction) => {
  axiosInstance.interceptors.response.use(null, async error => {
    const httpCode = 401;
    const originalRequest = error.config;

    if (error.response.status === httpCode && !originalRequest._retry) {
      originalRequest._retry = true;

      const userAuth = getAuthUserData();
      if (userAuth) {
        const refreshToken = userAuth.refreshToken;
        const accessToken = userAuth.accessToken;

        if (!checkTokenExpire(refreshToken)) {
          store.dispatch(errorAction());
          removeAuthUserData();
        }

        if (!checkTokenExpire(accessToken)) {
          try {
            const response = await axiosInstance.post("auth/refresh-tokens", {
              refreshToken
            });

            setAuthUserData({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              user: userAuth.user
            });

            return axiosInstance(originalRequest);
          } catch (e) {
            store.dispatch(errorAction());
            removeAuthUserData();
            console.log("Refresh token error: " + e.message);
          }
        }
      }
    }

    return Promise.reject(error);
  });
};

export const api = (requestType, url, payload) => {
  return new Promise((resolve, reject) => {
    axiosInstance[requestType](url, payload)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
};
