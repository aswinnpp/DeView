import axios from 'axios';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import store from '../context/store';
import { logout } from '../context/authSlice';
import { API_ROUTES, APP_ROUTES } from '../constants/routes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// ─── Silent-refresh interceptor ─────────────────────────────────

let isRefreshing = false;

let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(undefined);
        }
    });
    failedQueue = [];
};

type ApiEnvelope<T> = { success: boolean; data?: T };

api.interceptors.response.use(
    (response) => {
        const body = response.data as ApiEnvelope<unknown> | undefined;
        
       
        
        if (body && body.success === true && 'data' in body) {
            if (body.data !== undefined && body.data !== null) {
                
                response.data = body.data;
            } 
            
        }
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        const isForbidden = error.response?.status === 403;
        const message = extractApiError(error);
        const isBlocked = isForbidden && (
            message.toLowerCase().includes("deactivated") ||
            message.toLowerCase().includes("blocked")
        );
        const isLoginRequest = originalRequest?.url?.includes(API_ROUTES.AUTH.LOGIN);
        if (isBlocked && !isLoginRequest) {
            store.dispatch(logout());
            api.post(API_ROUTES.AUTH.LOGOUT).catch(() => {});
            window.location.replace(APP_ROUTES.LOGIN);
            return Promise.reject(error);
        }

        const isUnauthorized = error.response?.status === 401;
        const alreadyRetried = originalRequest?._retry;
        const isRefreshRoute = originalRequest?.url?.includes(API_ROUTES.AUTH.REFRESH);
        const isLoginRoute = originalRequest?.url?.includes(API_ROUTES.AUTH.LOGIN);
        const isLogoutRoute = originalRequest?.url?.includes(API_ROUTES.AUTH.LOGOUT);

        if (!isUnauthorized || alreadyRetried || isRefreshRoute || isLoginRoute || isLogoutRoute) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await api.post(API_ROUTES.AUTH.REFRESH);

            processQueue(null);

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            store.dispatch(logout());

            // Ensure server-side session/cookie is cleared as well
            api.post(API_ROUTES.AUTH.LOGOUT).catch(() => {});

            window.location.replace(APP_ROUTES.LOGIN);

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);


export const extractApiError = (err: unknown): string => {
  if (!axios.isAxiosError(err)) {
    if (err instanceof Error) {
      return err.message;
    }

    return "Something went wrong.";
  }

  const data = err.response?.data ;

  if (data && typeof data.message === "string") {
    return data.message;
  }

  if (data && typeof data.error === "string") {
    return data.error;
  }

  if (data && Array.isArray(data.errors)) {
    if (data.errors.length > 0 && typeof data.errors[0].message === "string") {
      return data.errors[0].message;
    }
  }

  if (typeof err.message === "string") {
    return err.message;
  }

  return "Something went wrong.";
};

export { api };
