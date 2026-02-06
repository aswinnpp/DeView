import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useApi } from '../useApi';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';

// ===========================================
// TYPES
// ===========================================

interface TokenExchangeRequest {
    sessionId: string;
}

interface TokenExchangeResponse {
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
    role: string;
    // No tokens in response - they're in HTTP-only cookies
}

interface UseGoogleAuthReturn {
    initiateGoogleAuth: (role?: string) => void;
    handleCallback: () => Promise<boolean>;
    loading: boolean;
    error: string | null;
}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useGoogleAuth(): UseGoogleAuthReturn {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    const { loading, execute } = useApi<TokenExchangeResponse>('/auth/google/exchange', 'GET');

    // Start Google authentication
    const initiateGoogleAuth = useCallback((role: string = 'candidate') => {
        // Redirect to backend Google auth endpoint
        window.location.href = `${API_BASE_URL}/auth/google?role=${role}`;
    }, []);

    // Handle the callback after Google redirects back
    const handleCallback = useCallback(async (): Promise<boolean> => {
        setError(null);

        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            setError('Invalid callback. No session ID found.');
            return false;
        }

        // Exchange session ID for user info (tokens set as cookies by backend)
        const result = await execute({
            params: { sessionId } as TokenExchangeRequest,
        });

        if (result) {
            // Store only user info in Redux (tokens are in HTTP-only cookies!)
            dispatch(setUser(result.user));

            // Redirect based on role
            const role = result.role;
            if (role === 'candidate') {
                navigate('/');
            } else if (role === 'company') {
                navigate('/company/dashboard');
            } else if (role === 'hr') {
                navigate('/hr/dashboard');
            } else {
                navigate('/');
            }

            return true;
        }

        setError('Failed to complete Google sign in. Please try again.');
        return false;
    }, [searchParams, execute, navigate, dispatch]);

    return { initiateGoogleAuth, handleCallback, loading, error };
}
