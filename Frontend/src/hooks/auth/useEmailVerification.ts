import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { otpSchema, type OtpFormValues } from '../../utils/validation/auth/otpSchema';
import { extractApiError } from '../../api/axios';

const STORAGE_KEY_VERIFY = 'pendingVerificationEmail';
const STORAGE_KEY_RESET = 'pendingResetEmail';

export function useEmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [invalidOtpMessage, setInvalidOtpMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeParam = searchParams.get('mode');
  const mode = modeParam === 'password-reset' ? 'password-reset' : 'email-verification';

  const locationState = location.state && typeof location.state === 'object' ? (location.state as { email?: string }) : null;
  const storageKey = mode === 'password-reset' ? STORAGE_KEY_RESET : STORAGE_KEY_VERIFY;
  const userEmail = locationState?.email || localStorage.getItem(storageKey) || '';

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
    mode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<OtpFormValues> = async ({ otpCode }) => {
    if (!userEmail) return;
    setInvalidOtpMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const verifyUrl = mode === 'password-reset' ? '/auth/verify-password-reset-otp' : '/auth/verify-otp';
      const { data: result } = await authService.verifyOtp(verifyUrl, { email: userEmail, otp: otpCode });

      if (mode === 'password-reset') {
        const valid = 'valid' in result && result.valid === true;
        if (!valid) {
          setInvalidOtpMessage('Incorrect OTP. Please try again.');
          return;
        }
        localStorage.removeItem(STORAGE_KEY_RESET);
        form.reset();
        navigate('/reset-password', { state: { email: userEmail, otp: otpCode, verified: true } });
      } else {
        localStorage.removeItem(STORAGE_KEY_VERIFY);
        form.reset();
        navigate('/login', { state: { message: 'Email verified! You can now login.' } });
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<boolean> => {
    if (isLoading || !userEmail) return false;
    setError(null);
    setIsLoading(true);

    try {
      const resendUrl = mode === 'password-reset' ? '/auth/forgot-password' : '/auth/resend-otp';
      await authService.resendOtp(resendUrl, { email: userEmail });
      return true;
    } catch (err) {
      setError(extractApiError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error: error || invalidOtpMessage,
    data: { form, mode, userEmail, handleResendOtp, onSubmit },
  };
}
