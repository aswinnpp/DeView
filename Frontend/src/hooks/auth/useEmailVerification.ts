import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useApi } from '../useApi';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, type OtpFormValues } from '../../utils/validation/auth/otpSchema';

const STORAGE_KEY_VERIFY = 'pendingVerificationEmail';
const STORAGE_KEY_RESET = 'pendingResetEmail';

type VerifyOtpResponse = { message?: string; valid?: boolean };
type ResendOtpResponse = { message: string; email?: string };

export function useEmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [invalidOtpMessage, setInvalidOtpMessage] = useState<string | null>(null);

  const modeParam = searchParams.get('mode');
  const mode = modeParam === 'password-reset' ? 'password-reset' : 'email-verification';

  const locationState = location.state && typeof location.state === 'object' ? (location.state as { email?: string }) : null;
  const storageKey = mode === 'password-reset' ? STORAGE_KEY_RESET : STORAGE_KEY_VERIFY;
  const userEmail = locationState?.email || localStorage.getItem(storageKey) || '';

  const { loading: verifyLoading, error: verifyError, execute: executeVerify } = useApi<VerifyOtpResponse>('/auth/verify-otp', 'POST');
  const { loading: resendLoading, error: resendError, execute: executeResend } = useApi<ResendOtpResponse>('/auth/resend-otp', 'POST');

  const isLoading = verifyLoading || resendLoading;
  const error = verifyError || resendError || invalidOtpMessage;

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
    mode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<OtpFormValues> = async ({ otpCode }) => {
    if (!userEmail) return;
    setInvalidOtpMessage(null);

    const verifyUrl = mode === 'password-reset' ? '/auth/verify-password-reset-otp' : '/auth/verify-otp';
    const result = await executeVerify({
      url: verifyUrl,
      data: { email: userEmail, otp: otpCode },
    });

    if (!result) return;

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
  };

  const handleResendOtp = async (): Promise<boolean> => {
    if (isLoading || !userEmail) return false;
    const resendUrl = mode === 'password-reset' ? '/auth/forgot-password' : '/auth/resend-otp';
    const result = await executeResend({ url: resendUrl, data: { email: userEmail } });
    return result != null;
  };

  return {
    isLoading,
    error,
    data: { form, mode, userEmail, handleResendOtp, onSubmit },
  };
}
