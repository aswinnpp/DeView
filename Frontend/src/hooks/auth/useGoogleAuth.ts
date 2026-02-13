import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../../services/auth.service';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';
import { extractApiError } from '../../api/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useGoogleAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      const { data: result } = await authService.googleExchange(sessionId);

      const navigateCompanyUser = async (userId: string): Promise<void> => {
        try {
          const { data: statusResult } = await authService.checkCompanyStatus({ userId });
          if (!statusResult) {
            navigate('/company/approval-form');
            return;
          }

          switch (statusResult.status) {
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
        } catch {
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
    } catch (err) {
      setError(extractApiError(err) || 'Failed to complete Google sign in. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, navigate, dispatch]);

  return { isLoading, error, data: { initiateGoogleAuth, handleCallback } };
}
