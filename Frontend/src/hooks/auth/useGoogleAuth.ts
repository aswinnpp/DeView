import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useApi } from '../useApi';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type TokenExchangeResponse = {
  user: { id: string; fullName: string; email: string; role: string };
  role: string;
};

export function useGoogleAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const { loading: isLoading, execute } = useApi<TokenExchangeResponse>('/auth/google/exchange', 'GET');

  const initiateGoogleAuth = useCallback((role = 'candidate') => {
    window.location.href = `${API_BASE_URL}/auth/google?role=${role}`;
  }, []);

  const handleCallback = useCallback(async (): Promise<boolean> => {
    setError(null);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      setError('Invalid callback. No session ID found.');
      return false;
    }

    const result = await execute({ params: { sessionId } });

    if (!result) {
      setError('Failed to complete Google sign in. Please try again.');
      return false;
    }

    dispatch(setUser(result.user));
    const role = result.role;

    if (role === 'candidate') {
      navigate('/candidate/profile');
    } else if (role === 'company') {
      navigate('/company/dashboard');
    } else if (role === 'hr') {
      navigate('/hr/dashboard');
    } else {
      navigate('/');
    }

    return true;
  }, [searchParams, execute, navigate, dispatch]);

  return { isLoading, error, data: { initiateGoogleAuth, handleCallback } };
}
