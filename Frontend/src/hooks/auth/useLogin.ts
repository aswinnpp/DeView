import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/auth.service';
import { candidateService } from '../../services/candidate.service';

import { loginRequestSchema, type LoginRequest } from '@shared/contracts/auth/login';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';
import { extractApiError } from '../../api/axios';
import { APP_ROUTES } from '../../constants/routes';

export type { LoginRequest };

export function useLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();


  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });



  const navigateCompanyUser = async (): Promise<void> => {
    try {
      const { data: result } = await authService.checkCompanyStatus();




      switch (result.status) {
        case 'approved':
          navigate(APP_ROUTES.COMPANY_DASHBOARD);
          break;
        case 'pending':
        case 'rejected':
          navigate(APP_ROUTES.COMPANY_APPROVAL_PENDING);
          break;
        default:
          navigate(APP_ROUTES.COMPANY_APPROVAL_FORM);
      }
    } catch {
      navigate(APP_ROUTES.ROOT);
    }
  };

  const onSubmit: SubmitHandler<LoginRequest> = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });



      const result = response.data;



      const user = result.user;
      dispatch(setUser(user));
      const { role } = user;


      if (role === 'candidate') {
        const {data} = await candidateService.getProfile()
        
        if (data.profile) {
          navigate(APP_ROUTES.CANDIDATE_INTERVIEWS)
        } else {
          navigate(APP_ROUTES.CANDIDATE_PROFILE);
        }     
      } else if (role === 'company') {
        await navigateCompanyUser();
      } else if (role === 'hr') {
        navigate(APP_ROUTES.HR_DASHBOARD);
      } else if (role === 'admin') {
        navigate(APP_ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(APP_ROUTES.ROOT);
      }
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
