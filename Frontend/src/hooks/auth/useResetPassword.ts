import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../utils/validation/auth/resetPasswordSchema';

const STORAGE_KEY_PENDING_RESET = 'pendingResetEmail';
const SESSION_EXPIRED_MESSAGE = 'Reset session expired. Please request a new password reset.';

type ResetPasswordResponse = { message: string };

export function useResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passedEmail = location.state.email;
  const storedEmail = localStorage.getItem(STORAGE_KEY_PENDING_RESET);
  const email = passedEmail || storedEmail || '';
  const otp = location.state.email.otp || '';
  const invalidSession = !email || !otp;

  const { loading: isLoading, execute, error: serverError } = useApi<ResetPasswordResponse>('/auth/reset-password', 'POST');
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

    const result = await execute({
      data: { email, otp, newPassword },
    });

    if (result) {
      localStorage.removeItem(STORAGE_KEY_PENDING_RESET);
      navigate('/login', { replace: true });
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
