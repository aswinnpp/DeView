import { Repositories } from './repositories';
import { Services } from './services';

import { RegisterUserUseCase } from '../../application/auth/use-cases/RegisterUserUseCase';
import { VerifyOTPUseCase } from '../../application/auth/use-cases/VerifyOTPUseCase';
import { LoginUseCase } from '../../application/auth/use-cases/LoginUseCase';
import { ResendOTPUseCase } from '../../application/auth/use-cases/ResendOTPUseCase';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/RefreshTokenUseCase';
import { ForgotPasswordUseCase } from '../../application/auth/use-cases/ForgotPasswordUseCase';
import { VerifyPasswordResetOTPUseCase } from '../../application/auth/use-cases/VerifyPasswordResetOTPUseCase';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/ResetPasswordUseCase';
import { GoogleTokenExchangeUseCase } from '../../application/auth/use-cases/GoogleTokenExchangeUseCase';
import { CheckCompanyStatusUseCase } from '../../application/company/use-cases/CheckCompanyStatusUseCase';
import { SubmitCompanyApprovalUseCase } from '../../application/company/use-cases/SubmitCompanyApprovalUseCase';

import { GetMyCompanyApprovalUseCase } from "../../application/company/use-cases/GetMyCompanyApprovalUseCase";

import { GetPendingCompaniesUseCase } from '../../application/admin/use-cases/GetPendingCompaniesUseCase';
import { ApproveCompanyUseCase } from '../../application/admin/use-cases/ApproveCompanyUseCase';
import { RejectCompanyUseCase } from '../../application/admin/use-cases/RejectCompanyUseCase';

export interface UseCases {
  registerUserUseCase: RegisterUserUseCase;
  verifyOTPUseCase: VerifyOTPUseCase;
  loginUseCase: LoginUseCase;
  resendOTPUseCase: ResendOTPUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  forgotPasswordUseCase: ForgotPasswordUseCase;
  verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  googleTokenExchangeUseCase: GoogleTokenExchangeUseCase;

  checkCompanyStatusUseCase: CheckCompanyStatusUseCase;
  submitCompanyApprovalUseCase: SubmitCompanyApprovalUseCase;
  getMyApprovalUseCase: GetMyCompanyApprovalUseCase;

  getPendingCompaniesUseCase: GetPendingCompaniesUseCase;
  approveCompanyUseCase: ApproveCompanyUseCase;
  rejectCompanyUseCase: RejectCompanyUseCase;
}


export function createUseCases(repositories: Repositories, services: Services): UseCases {
  const { userRepository, otpRepository, companyApprovalRepository } = repositories;
  const { passwordHasher, tokenService, emailService } = services;

 return {
  registerUserUseCase: new RegisterUserUseCase(userRepository, otpRepository, passwordHasher, emailService),
  verifyOTPUseCase: new VerifyOTPUseCase(userRepository, otpRepository),
  loginUseCase: new LoginUseCase(userRepository, passwordHasher, tokenService),
  resendOTPUseCase: new ResendOTPUseCase(userRepository, otpRepository, emailService),
  refreshTokenUseCase: new RefreshTokenUseCase(tokenService, userRepository),
  forgotPasswordUseCase: new ForgotPasswordUseCase(userRepository, otpRepository, emailService),
  verifyPasswordResetOTPUseCase: new VerifyPasswordResetOTPUseCase(otpRepository),
  resetPasswordUseCase: new ResetPasswordUseCase(userRepository, otpRepository, passwordHasher, tokenService),
  googleTokenExchangeUseCase: new GoogleTokenExchangeUseCase(),

  checkCompanyStatusUseCase: new CheckCompanyStatusUseCase(companyApprovalRepository),
  submitCompanyApprovalUseCase: new SubmitCompanyApprovalUseCase(companyApprovalRepository),
  getMyApprovalUseCase: new GetMyCompanyApprovalUseCase(companyApprovalRepository),

  getPendingCompaniesUseCase: new GetPendingCompaniesUseCase(companyApprovalRepository),
  approveCompanyUseCase: new ApproveCompanyUseCase(companyApprovalRepository),
  rejectCompanyUseCase: new RejectCompanyUseCase(companyApprovalRepository),
};

}
