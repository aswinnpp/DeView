import axios from 'axios';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import store from '../context/store';
import { API_ROUTES, APP_ROUTES } from '../constants/routes';
import { logoutAdmin, logoutUser } from '../context/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// ─── Silent-refresh interceptor ─────────────────────────────────

let adminRefreshing = false;
let userRefreshing = false;

const adminQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const userQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];



const processQueue = (
  queue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }>,
  error: unknown
) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });

  queue.length = 0;
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
        const isLoginRequest =
            originalRequest?.url?.includes(API_ROUTES.AUTH.LOGIN) ||
            originalRequest?.url?.includes(API_ROUTES.ADMIN.LOGIN);

            const isAdminRoute = originalRequest?.url?.startsWith('/admin/');
                    const currentQueue = isAdminRoute
            ? adminQueue
            : userQueue;

            const isCurrentlyRefreshing = isAdminRoute
            ? adminRefreshing
            : userRefreshing;
            
        if (isBlocked && !isLoginRequest) {
            
           
            const logoutRoute = isAdminRoute ? API_ROUTES.ADMIN.LOGOUT : API_ROUTES.AUTH.LOGOUT;
            void api.post(logoutRoute).catch(() => {});
            if (isAdminRoute) {
                store.dispatch(logoutAdmin());
              } else {
                store.dispatch(logoutUser());
              }            window.location.replace(APP_ROUTES.LOGIN);
            return Promise.reject(error);
        }

        const isUnauthorized = error.response?.status === 401;
        const alreadyRetried = originalRequest?._retry;
        
        const refreshRoute = isAdminRoute ? API_ROUTES.ADMIN.REFRESH : API_ROUTES.AUTH.REFRESH;
        const logoutRoute = isAdminRoute ? API_ROUTES.ADMIN.LOGOUT : API_ROUTES.AUTH.LOGOUT;
        const isRefreshRoute = originalRequest?.url?.includes(refreshRoute);
        const isLoginRoute =
            originalRequest?.url?.includes(API_ROUTES.AUTH.LOGIN) ||
            originalRequest?.url?.includes(API_ROUTES.ADMIN.LOGIN);
        const isLogoutRoute =
            originalRequest?.url?.includes(API_ROUTES.AUTH.LOGOUT) ||
            originalRequest?.url?.includes(API_ROUTES.ADMIN.LOGOUT);

        if (!isUnauthorized || alreadyRetried || isRefreshRoute || isLoginRoute || isLogoutRoute) {
            return Promise.reject(error);
        }

        if (isCurrentlyRefreshing) {
  return new Promise((resolve, reject) => {
    currentQueue.push({ resolve, reject });
  }).then(() => api(originalRequest));
}

        originalRequest._retry = true;
        if (isAdminRoute) {
  adminRefreshing = true;
} else {
  userRefreshing = true;
}

        try {
            await api.post(refreshRoute);

processQueue(currentQueue, null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(currentQueue, refreshError);

            void api.post(logoutRoute).catch(() => {});

            if (isAdminRoute) {
                store.dispatch(logoutAdmin());
              } else {
                store.dispatch(logoutUser());
              }
            window.location.replace(APP_ROUTES.LOGIN);

            return Promise.reject(refreshError);
        } finally {
            if (isAdminRoute) {
                adminRefreshing = false;
            } else {
                userRefreshing = false;
            }
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
