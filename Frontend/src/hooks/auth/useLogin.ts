import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { loginRequestSchema, type LoginRequest } from '@shared/contracts/auth/login';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';
import { extractApiError } from '../../api/axios';
import { APP_ROUTES } from '../../constants/routes';

export type { LoginRequest };

export function useLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();


  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });



  const navigateCompanyUser = async (userId: string): Promise<void> => {
    try {
      const { data: result } = await authService.checkCompanyStatus({ userId });
     

        

      switch (result.status) {
        case 'approved':
          navigate(APP_ROUTES.COMPANY_DASHBOARD);
          break;
        case 'pending':
        case 'rejected':
          navigate(APP_ROUTES.COMPANY_APPROVAL_PENDING);
          break;
        default:
          navigate(APP_ROUTES.COMPANY_APPROVAL_FORM);
      }
    } catch {
      navigate(APP_ROUTES.ROOT);
    }
  };

  const onSubmit: SubmitHandler<LoginRequest> = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      
      console.log('Raw axios response:', response);
      console.log('Response data after interceptor:', response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = response.data;
      
      if (!result || typeof result !== 'object') {
        console.error('Invalid response format:', result);
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (Object.keys(result).length === 0) {
        console.error('Empty response object received. Full response:', response);
        setError('Server returned empty response. This may indicate a backend issue. Please contact support.');
        return;
      }

      const user = result.user;
      if (!user || typeof user !== 'object') {
        console.error('User data missing or invalid. Response structure:', result);
        setError('User data missing in server response. Please try again or contact support.');
        return;
      }

      if (typeof user.id !== 'string' || typeof user.role !== 'string') {
        console.error('User data incomplete:', { id: user.id, role: user.role, fullUser: user });
        setError('Invalid user data format received from server. Please try again.');
        return;
      }

      dispatch(setUser(user));
      const { role, id: userId } = user;
      console.log("role", role);

      if (role === 'candidate') {
        navigate(APP_ROUTES.CANDIDATE_PROFILE);
      } else if (role === 'company') {
        await navigateCompanyUser(userId);
      } else if (role === 'hr') {
        navigate(APP_ROUTES.HR_DASHBOARD);
      } else if (role === 'admin') {
        navigate(APP_ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(APP_ROUTES.ROOT);
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data: { form,onSubmit },
  };
}
