import { useState, useCallback } from 'react';
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with credentials (cookies sent automatically)
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send HTTP-only cookies with every request
});

interface ApiResponse<T> {
    data: T;
    message?: string;
}

interface ApiError {
    error: string;
    message?: string;
}

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (config?: AxiosRequestConfig) => Promise<T | null>;
    reset: () => void;
}

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        if (axiosError.response?.status === 401) {
            return 'Session expired. Please login again.';
        }
        if (axiosError.response?.status === 403) {
            return 'You do not have permission to perform this action.';
        }
        if (axiosError.response?.status === 404) {
            return 'Resource not found.';
        }
        if (axiosError.response?.status === 500) {
            return 'Server error. Please try again later.';
        }

        if (axiosError.message === 'Network Error') {
            return 'Unable to connect to server. Please check your internet connection.';
        }
    }

    return 'Something went wrong. Please try again.';
};


export function useApi<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
): UseApiReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (config?: AxiosRequestConfig): Promise<T | null> => {
        try {
            setLoading(true);
            setError(null);

            // No Authorization header needed - cookies sent automatically!
            const response = await api.request<ApiResponse<T> | T>({
                url: endpoint,
                method,
                ...config,
            });

            const responseData = (response.data as ApiResponse<T>).data ?? response.data as T;

            setData(responseData);
            return responseData;

        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [endpoint, method]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
}

export { api };
