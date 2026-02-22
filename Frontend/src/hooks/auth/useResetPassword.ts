import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { resetPasswordRequestSchema } from '@shared/contracts/auth/resetPassword';
import { extractApiError } from '../../api/axios';

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


export function useResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  

  const passedEmail = location.state?.email || '';
  const storedEmail = localStorage.getItem(STORAGE_KEY_PENDING_RESET);
  const email = passedEmail || storedEmail || '';
  const otp = location.state?.otp || '';


  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

 

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async ({ newPassword }) => {
  
    setIsLoading(true);

    try {
      await authService.resetPassword({ email, otp, newPassword });

      localStorage.removeItem(STORAGE_KEY_PENDING_RESET);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data: { 
      form,
      onSubmit,
     
    },
  };
}
