import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { authService } from '../../services/auth.service';
import { extractApiError } from '../../api/axios';

import {
  verifyOldPasswordRequestSchema,
  changePasswordRequestSchema,
  type VerifyOldPasswordRequest,
} from '@shared/contracts/auth/changePassword';

const changePasswordStep2Schema = z
  .object({
    newPassword: changePasswordRequestSchema.shape.newPassword,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type ChangePasswordStep2Values = z.infer<typeof changePasswordStep2Schema>;

export function useChangePassword() {
  const [error, setError] = useState<string | null>(null);
  const [isStep1Loading, setIsStep1Loading] = useState(false);
  const [isStep2Loading, setIsStep2Loading] = useState(false);

  const [isOldPasswordVerified, setIsOldPasswordVerified] = useState(false);
  const [verifiedOldPassword, setVerifiedOldPassword] = useState('');

  const step1Form = useForm<VerifyOldPasswordRequest>({
    resolver: zodResolver(verifyOldPasswordRequestSchema),
    defaultValues: { oldPassword: '' },
    mode: 'onSubmit',
  });

  const step2Form = useForm<ChangePasswordStep2Values>({
    resolver: zodResolver(changePasswordStep2Schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const verifyOldPassword = async ({ oldPassword }: VerifyOldPasswordRequest) => {
    setError(null);
    setIsStep1Loading(true);

    try {
      await authService.verifyOldPassword({ oldPassword });
      setIsOldPasswordVerified(true);
      setVerifiedOldPassword(oldPassword);
      return true;
    } catch (err) {
      setError(extractApiError(err));
      setIsOldPasswordVerified(false);
      setVerifiedOldPassword('');
      return false;
    } finally {
      setIsStep1Loading(false);
    }
  };

  const changePassword = async ({ newPassword }: ChangePasswordStep2Values) => {
    setError(null);
    setIsStep2Loading(true);

    try {
      await authService.changePassword({
        oldPassword: verifiedOldPassword,
        newPassword,
      });
      return true;
    } catch (err) {
      setError(extractApiError(err));
      return false;
    } finally {
      setIsStep2Loading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setIsStep1Loading(false);
    setIsStep2Loading(false);
    setIsOldPasswordVerified(false);
    setVerifiedOldPassword('');
    step1Form.reset();
    step2Form.reset();
  }, [step1Form, step2Form]);

  return {
    error,
    isStep1Loading,
    isStep2Loading,
    isOldPasswordVerified,
    reset,
    step1: {
      form: step1Form,
      onSubmit: verifyOldPassword,
    },
    step2: {
      form: step2Form,
      onSubmit: changePassword,
    },
  };
}

