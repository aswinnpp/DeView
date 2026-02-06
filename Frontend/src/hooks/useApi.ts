import { useState, useCallback } from 'react';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { getErrorMessage } from '../utils/validation/apiValidation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with credentials (cookies sent automatically)
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (config?: AxiosRequestConfig) => Promise<T | null>;
    reset: () => void;
}

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

            const response = await api.request<T>({
                url: endpoint,
                method,
                ...config,
            });

            setData(response.data);
            return response.data;

        } catch (err) {
            setError(getErrorMessage(err));
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
