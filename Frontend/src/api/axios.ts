import axios from 'axios';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import store from '../context/store';
import { logout } from '../context/authSlice';

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

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        const isUnauthorized = error.response?.status === 401;
        const alreadyRetried = originalRequest?._retry;
        const isRefreshRoute = originalRequest?.url?.includes('/auth/refresh');
        const isLoginRoute = originalRequest?.url?.includes('/auth/login');

        if (!isUnauthorized || alreadyRetried || isRefreshRoute || isLoginRoute) {
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
            await api.post('/auth/refresh');

            processQueue(null);

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            store.dispatch(logout());

            window.location.href = '/login';

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);


export const extractApiError = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as Record<string, unknown> | undefined;
        const message =
            (typeof data?.message === 'string' && data.message) ||
            (typeof data?.error === 'string' && data.error) ||
            (Array.isArray(data?.errors) && data.errors[0] && typeof (data.errors[0] as { message?: string }).message === 'string' && (data.errors[0] as { message: string }).message) ||
            err.message ||
            'Something went wrong.';
        return message;
    }
    return err instanceof Error ? err.message : 'Something went wrong.';
};

export { api };
