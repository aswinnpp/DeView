import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { forgotPasswordRequestSchema, type ForgotPasswordRequest } from '@shared/contracts/auth/forgotPassword';
import { extractApiError } from '../../api/axios';

const STORAGE_KEY_PENDING_RESET = 'pendingResetEmail';

export function useForgotPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<ForgotPasswordRequest> = async ({ email }) => {
    setError(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });

      localStorage.setItem(STORAGE_KEY_PENDING_RESET, email);
      navigate('/verify-email?mode=password-reset', { state: { email } });
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
