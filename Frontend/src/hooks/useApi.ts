import { useState, useCallback } from 'react';
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { getAuthToken } from '../utils/auth';

// ===========================================
// CONFIGURATION
// ===========================================

// Base URL for all API calls (from environment variable)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default settings
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===========================================
// TYPES
// ===========================================

// Response type from API
interface ApiResponse<T> {
    data: T;
    message?: string;
}

// Error type from API
interface ApiError {
    error: string;
    message?: string;
}

// Hook return type
interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (config?: AxiosRequestConfig) => Promise<T | null>;
    reset: () => void;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get headers with authentication token
 */
const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

/**
 * Extract error message from API error response
 */
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        // Get error from response body
        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        // Handle common HTTP errors
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

        // Network error
        if (axiosError.message === 'Network Error') {
            return 'Unable to connect to server. Please check your internet connection.';
        }
    }

    return 'Something went wrong. Please try again.';
};

// ===========================================
// MAIN HOOK
// ===========================================

/**
 * useApi - A simple hook to make API calls
 * 
 * Usage:
 * const { data, loading, error, execute } = useApi<UserType>('/auth/login', 'POST');
 * 
 * // Call the API
 * const result = await execute({ data: { email, password } });
 */
export function useApi<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
): UseApiReturn<T> {
    // State to store data, loading status, and error
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to execute the API call
    const execute = useCallback(async (config?: AxiosRequestConfig): Promise<T | null> => {
        try {
            // Start loading
            setLoading(true);
            setError(null);

            // Make the API call
            const response = await api.request<ApiResponse<T> | T>({
                url: endpoint,
                method,
                headers: {
                    ...getAuthHeaders(),
                    ...config?.headers,
                },
                ...config,
            });

            // Extract data from response
            // Handle both { data: T } and direct T responses
            const responseData = (response.data as ApiResponse<T>).data ?? response.data as T;

            setData(responseData);
            return responseData;

        } catch (err) {
            // Handle error
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            return null;
        } finally {
            // Stop loading
            setLoading(false);
        }
    }, [endpoint, method]);

    // Function to reset the state
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
}

// ===========================================
// SIMPLE API FUNCTIONS (without hooks)
// ===========================================

/**
 * Simple API call function for one-time use
 * 
 * Usage:
 * const user = await apiCall<UserType>('/auth/me', 'GET');
 */
export async function apiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> {
    const response = await api.request<ApiResponse<T> | T>({
        url: endpoint,
        method,
        data,
        headers: {
            ...getAuthHeaders(),
            ...config?.headers,
        },
        ...config,
    });

    // Extract data from response
    return (response.data as ApiResponse<T>).data ?? response.data as T;
}

// Export the axios instance for direct use if needed
export { api };
