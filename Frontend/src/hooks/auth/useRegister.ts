import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { registerSchema, type RegisterFormValues } from '../../utils/validation/auth/registerSchema';
import { extractApiError } from '../../api/axios';

const STORAGE_KEY_PENDING_EMAIL = 'pendingVerificationEmail';

export type { RegisterFormValues };

export function useRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'candidate' },
    mode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      await authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      localStorage.setItem(STORAGE_KEY_PENDING_EMAIL, values.email);
      navigate('/verify-email', { state: { email: values.email } });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data: { form, onSubmit },
  };
}
