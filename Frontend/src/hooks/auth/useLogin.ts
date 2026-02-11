import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';
import { loginSchema, type LoginFormValues } from '../../utils/validation/auth/loginSchema';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';

// API response shape - user and tokens
type LoginResponse = {
  user: { id: string; fullName: string; email: string; role: string };
};

type CompanyStatusResponse = {
  exists: boolean;
  status: 'not_found' | 'pending' | 'approved' | 'rejected';
  companyName?: string;
  rejectionReason?: string;
};

export type { LoginFormValues };

export function useLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loading: isLoading, execute, error: serverError } = useApi<LoginResponse>('/auth/login', 'POST');
  const { execute: checkCompanyApproval } = useApi<CompanyStatusResponse>('/company/check-status', 'POST');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (serverError) setError(serverError);
  }, [serverError]);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  // Navigate company user based on approval status
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

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setError(null);
    const result = await execute({
      data: { email: values.email, password: values.password },
    });

    if (!result) return;

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
  };

  return {
    isLoading,
    error: error ?? serverError,
    data: { form, showPassword, togglePasswordVisibility, onSubmit },
  };
}
