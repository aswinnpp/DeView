import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';
import { registerSchema, type RegisterFormValues } from '../../utils/validation/auth/registerSchema';

const STORAGE_KEY_PENDING_EMAIL = 'pendingVerificationEmail';

type RegisterResponse = { message: string; userId?: string };

export type { RegisterFormValues };

export function useRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { loading: isLoading, execute, error: serverError } = useApi<RegisterResponse>('/auth/register', 'POST');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'candidate' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (serverError) setError(serverError);
  }, [serverError]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setError(null);
    const result = await execute({
      data: {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      },
    });

    if (result) {
      localStorage.setItem(STORAGE_KEY_PENDING_EMAIL, values.email);
      navigate('/verify-email', { state: { email: values.email } });
    }
  };

  return {
    isLoading,
    error: error ?? serverError,
    data: { form, onSubmit },
  };
}
