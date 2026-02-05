import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../useApi';
import { setAuthToken } from '../../utils/auth';

// ===========================================
// TYPES
// ===========================================

interface TokenExchangeRequest {
    sessionId: string;
}

interface TokenExchangeResponse {
    token: string;
    role: string;
}

interface UseGoogleAuthReturn {
    initiateGoogleAuth: (role?: string) => void;
    handleCallback: () => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

// ===========================================
// CONFIGURATION
// ===========================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ===========================================
// HOOK
// ===========================================

/**
 * useGoogleAuth - Hook to handle Google OAuth authentication
 * 
 * Usage:
 * const { initiateGoogleAuth, handleCallback, loading, error } = useGoogleAuth();
 * 
 * // Start Google auth
 * initiateGoogleAuth('candidate');
 * 
 * // In callback page
 * await handleCallback();
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
    const navigate = useNavigate();
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

        // Exchange session ID for token
        const result = await execute({
            params: { sessionId } as TokenExchangeRequest,
        });

        if (result) {
            // Save the token
            setAuthToken(result.token);

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
    }, [searchParams, execute, navigate]);

    return { initiateGoogleAuth, handleCallback, loading, error };
}
