import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../utils/validation/auth/forgotPasswordSchema';

const STORAGE_KEY_PENDING_RESET = 'pendingResetEmail';

type ForgotPasswordResponse = { message: string };

export function useForgotPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { loading: isLoading, execute, error: serverError } = useApi<ForgotPasswordResponse>('/auth/forgot-password', 'POST');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (serverError) setError(serverError);
  }, [serverError]);

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async ({ email }) => {
    setError(null);
    const result = await execute({ data: { email } });

    if (result) {
      localStorage.setItem(STORAGE_KEY_PENDING_RESET, email);
      navigate('/verify-email?mode=password-reset', { state: { email } });
    }
  };

  return {
    isLoading,
    error: error ?? serverError,
    data: { form, onSubmit },
  };
}
