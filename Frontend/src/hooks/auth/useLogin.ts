import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { loginSchema, type LoginFormValues } from '../../utils/validation/auth/loginSchema';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';
import { extractApiError } from '../../api/axios';

export type { LoginFormValues };

export function useLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const navigateCompanyUser = async (userId: string): Promise<void> => {
    try {
      const { data: result } = await authService.checkCompanyStatus({ userId });
      console.log("resul", result.status);

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
    } catch {
      navigate('/company/approval-form');
    }
  };

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
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
    data: { form, showPassword, togglePasswordVisibility, onSubmit },
  };
}
