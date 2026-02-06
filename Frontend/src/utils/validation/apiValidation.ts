import axios from 'axios';
import type { AxiosError } from 'axios';

// Status code to user-friendly message mapping
const STATUS_MESSAGES: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Session expired. Please login again.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    409: 'This resource already exists.',
    422: 'Invalid data provided.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
};

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

/**
 * Extract user-friendly error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
    // Not an axios error
    if (!axios.isAxiosError(error)) {
        return 'Something went wrong. Please try again.';
    }

    const { response, message } = error as AxiosError<ApiErrorResponse>;

    // Backend provided error message
    if (response?.data?.error) return response.data.error;
    if (response?.data?.message) return response.data.message;

    // HTTP status code message
    if (response?.status && STATUS_MESSAGES[response.status]) {
        return STATUS_MESSAGES[response.status];
    }

    // Network error
    if (message === 'Network Error') {
        return 'Unable to connect to server. Please check your internet connection.';
    }

    // Timeout
    if (message?.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }

    return 'Something went wrong. Please try again.';
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    return error.response?.status === 401;
};

/**
 * Check if error is a permission error (403)
 */
export const isPermissionError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    return error.response?.status === 403;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    return error.message === 'Network Error';
};
