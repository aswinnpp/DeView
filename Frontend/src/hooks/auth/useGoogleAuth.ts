import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../../services/auth.service';
import { setAdminUser, setNormalUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';
import { extractApiError } from '../../api/axios';
import { API_ROUTES, APP_ROUTES } from '../../constants/routes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const OAUTH_SESSION_TYPE_KEY = 'oauthSessionType';

export type OAuthSessionType = 'admin' | 'user';

export function useGoogleAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initiateGoogleAuth = useCallback(
    (role = 'candidate', sessionType: OAuthSessionType = 'user') => {
      sessionStorage.setItem(OAUTH_SESSION_TYPE_KEY, sessionType);
      window.location.replace(
        `${API_BASE_URL}${API_ROUTES.AUTH.GOOGLE_BASE}?role=${role}`
      );
    },
    []
  );

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

      if (!result) {
        setError('Invalid response from server. Please try again.');
        return false;
      }

      const user = result.user;
      if (!user) {
        setError('User data missing in server response. Please try again.');
        return false;
      }

      if (typeof user.id !== 'string' || typeof user.role !== 'string') {
        setError('Invalid user data format received from server. Please try again.');
        return false;
      }

      const storedSessionType = sessionStorage.getItem(
        OAUTH_SESSION_TYPE_KEY
      ) as OAuthSessionType | null;

      const sessionType =
        storedSessionType ??
        (user.role === 'admin' ? 'admin' : 'user');

      const navigateCompanyUser = async (): Promise<void> => {
        try {
          const { data: statusResult } = await authService.checkCompanyStatus();
          if (!statusResult) {
            navigate(APP_ROUTES.COMPANY_APPROVAL_FORM, { replace: true });
            return;
          }

          switch (statusResult.status) {
            case 'approved':
              navigate(APP_ROUTES.COMPANY_DASHBOARD, { replace: true });
              break;
            case 'pending':
            case 'rejected':
              navigate(APP_ROUTES.COMPANY_APPROVAL_PENDING, { replace: true });
              break;
            default:
              navigate(APP_ROUTES.COMPANY_APPROVAL_FORM, { replace: true });
          }
        } catch {
          navigate(APP_ROUTES.COMPANY_APPROVAL_FORM, { replace: true });
        }
      };

      if (sessionType === 'admin') {
        if (user.role !== 'admin') {
          setError('This account is not an administrator.');
          return false;
        }

        dispatch(setAdminUser(user));
        sessionStorage.removeItem(OAUTH_SESSION_TYPE_KEY);
        navigate(APP_ROUTES.ADMIN_DASHBOARD, { replace: true });
        return true;
      }

      if (user.role === 'admin') {
        setError('Administrators must sign in at /admin/login.');
        return false;
      }

      dispatch(setNormalUser(user));
      sessionStorage.removeItem(OAUTH_SESSION_TYPE_KEY);
      const role = (user.role ?? '').toLowerCase();

      if (role === 'candidate') {
        navigate(APP_ROUTES.CANDIDATE_INTERVIEWS, { replace: true });
      } else if (role === 'company') {
        await navigateCompanyUser();
      } else if (role === 'hr') {
        navigate(APP_ROUTES.HR_DASHBOARD, { replace: true });
      } else if (role === 'interviewer') {
        navigate(APP_ROUTES.INTERVIEWER_ASSIGNMENTS, { replace: true });
      } else {
        navigate(APP_ROUTES.ROOT, { replace: true });
      }

      return true;
    } catch (err) {
      setError(
        extractApiError(err) ||
          'Failed to complete Google sign in. Please try again.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, navigate, dispatch]);

  return { isLoading, error, data: { initiateGoogleAuth, handleCallback } };
}
