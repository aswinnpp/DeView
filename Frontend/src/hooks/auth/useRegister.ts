import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { registerRequestSchema } from '@shared/contracts/auth/register';
import { extractApiError } from '../../api/axios';

const STORAGE_KEY_PENDING_EMAIL = 'pendingVerificationEmail';

const registerSchema = z
  .object({
    ...registerRequestSchema.shape,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

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
        ...(values.companyId && { companyId: values.companyId }),
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
