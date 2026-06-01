import axios from "axios";

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(
    error: any,
    public errorCode?: string,
  ) {
    super();

    this.status = error?.response?.status;
    this.data = error?.response?.data;

    this.message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";
  }
}

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://meridian-liart-eight.vercel.app/api/v1",
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const isUnauthorized =
      error.response.status === 401 &&
      error.response.data?.errorCode === "AUTH_UNAUTHORIZED_ACCESS";

    if (isUnauthorized && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        return API(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default API;
