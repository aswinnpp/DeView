import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { resetPasswordRequestSchema } from '@shared/contracts/auth/resetPassword';
import { extractApiError } from '../../api/axios';

// UI schema — extends shared contract with confirmPassword
const resetPasswordSchema = z
  .object({
    newPassword: resetPasswordRequestSchema.shape.newPassword,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const STORAGE_KEY_PENDING_RESET = 'pendingResetEmail';
const SESSION_EXPIRED_MESSAGE = 'Reset session expired. Please request a new password reset.';

export function useResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const passedEmail = location.state?.email || '';
  const storedEmail = localStorage.getItem(STORAGE_KEY_PENDING_RESET);
  const email = passedEmail || storedEmail || '';
  const otp = location.state?.otp || '';
  const invalidSession = !email || !otp;

  const error = invalidSession ? SESSION_EXPIRED_MESSAGE : serverError;

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const toggleNewPasswordVisibility = useCallback(() => setShowNewPassword(prev => !prev), []);
  const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword(prev => !prev), []);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async ({ newPassword }) => {
    if (invalidSession) return;
    setServerError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword({ email, otp, newPassword });

      localStorage.removeItem(STORAGE_KEY_PENDING_RESET);
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data: {
      showNewPassword,
      showConfirmPassword,
      invalidSession,
      form,
      onSubmit,
      toggleNewPasswordVisibility,
      toggleConfirmPasswordVisibility,
    },
  };
}
