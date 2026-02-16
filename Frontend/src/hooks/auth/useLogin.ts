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
      navigate('/');
    }
  };

  const onSubmit: SubmitHandler<LoginRequest> = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      const { data: result } = await authService.login({
        email: values.email,
        password: values.password,
      });

      dispatch(setUser(result.user));
      const { role, id: userId } = result.user;
      console.log("role", role);

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
