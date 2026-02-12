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


type CompanyStatusResponse = {
  exists: boolean;
  status: 'not_found' | 'pending' | 'approved' | 'rejected';
  companyName?: string;
  rejectionReason?: string;
};

export function useGoogleAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const { loading: isLoading, execute } = useApi<TokenExchangeResponse>('/auth/google/exchange', 'GET');
    const { execute: checkCompanyApproval } = useApi<CompanyStatusResponse>('/company/check-status', 'POST');
  

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


     const navigateCompanyUser = async (userId: string): Promise<void> => {
    const result = await checkCompanyApproval({ data: { userId } });
    if (!result) {
      navigate('/company/approval-form');
      return;
    }

    switch (result.status) {
      case 'approved':
        navigate('/company/dashboard');
        break;
      case 'pending':
      case 'rejected':
        navigate('/company/approval-pending');
        break;
      default:
        navigate('/company/approval-form');
    }
  };


    dispatch(setUser(result.user));
     const { role, id: userId } = result.user;

      if (role === 'candidate') {
      navigate('/candidate/profile');
    } else if (role === 'company') {

      await navigateCompanyUser(userId);
    } else if (role === 'hr') {
      navigate('/hr/dashboard');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }

    return true;
  }, [searchParams, execute, navigate, dispatch]);

  return { isLoading, error, data: { initiateGoogleAuth, handleCallback } };
}
