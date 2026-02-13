import { UseCases } from './useCases';
import { Services } from './services';
import { Repositories } from './repositories';

import { AuthController } from '../../interfaces/http/controllers/AuthController';
import { GoogleAuthController } from '../../interfaces/http/controllers/GoogleAuthController';
import { CompanyApprovalController } from '../../interfaces/http/controllers/CompanyApprovalController';
import { AdminCompanyApprovalController } from '../../interfaces/http/controllers/AdminCompanyApprovalController';
import { UploadController } from '../../interfaces/http/controllers/UploadController';

export interface Controllers {
  authController: AuthController;
  googleAuthController: GoogleAuthController;
  companyApprovalController: CompanyApprovalController;
  adminCompanyApprovalController: AdminCompanyApprovalController;
  uploadController: UploadController;
}

export function createControllers(
  useCases: UseCases,
  services: Services,
  repositories: Repositories
): Controllers {
  return {
    authController: new AuthController(
      useCases.registerUserUseCase,
      useCases.verifyOTPUseCase,
      useCases.loginUseCase,
      useCases.resendOTPUseCase,
      useCases.refreshTokenUseCase,
      useCases.forgotPasswordUseCase,
      useCases.verifyPasswordResetOTPUseCase,
      useCases.resetPasswordUseCase,
      services.tokenService
    ),

    googleAuthController: new GoogleAuthController(
      useCases.googleOAuthUseCase,
      services.googleAuthService
    ),


    companyApprovalController: new CompanyApprovalController(
      useCases.checkCompanyStatusUseCase,
      useCases.submitCompanyApprovalUseCase,
      useCases.getMyApprovalUseCase
    ),

    adminCompanyApprovalController: new AdminCompanyApprovalController(
      useCases.getPendingCompaniesUseCase,
      useCases.approveCompanyUseCase,
      useCases.rejectCompanyUseCase,
      useCases.markDocumentUseCase
    ),

    uploadController: new UploadController(
      useCases.uploadFileUseCase
    ),
  };
}
