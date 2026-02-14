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

import { CheckCompanyStatusUseCase } from '../../application/company/use-cases/CheckCompanyStatusUseCase';
import { SubmitCompanyApprovalUseCase } from '../../application/company/use-cases/SubmitCompanyApprovalUseCase';

import { GetMyCompanyApprovalUseCase } from "../../application/company/use-cases/GetMyCompanyApprovalUseCase";
import { GoogleOAuthUseCase } from "../../application/auth/use-cases/GoogleOAuthUseCase";

import { GetPendingCompaniesUseCase } from '../../application/admin/use-cases/GetPendingCompaniesUseCase';
import { ApproveCompanyUseCase } from '../../application/admin/use-cases/ApproveCompanyUseCase';
import { RejectCompanyUseCase } from '../../application/admin/use-cases/RejectCompanyUseCase';
import { MarkDocumentUseCase } from '../../application/admin/use-cases/MarkDocumentUseCase';
import { GetApprovedCompaniesUseCase } from '../../application/admin/use-cases/GetApprovedCompaniesUseCase';
import { ToggleCompanyActiveUseCase } from '../../application/admin/use-cases/ToggleCompanyActiveUseCase';
import { UploadFileUseCase } from '../../application/upload/use-cases/UploadFileUseCase';
import { CreateTeamMemberUseCase } from '../../application/company/use-cases/CreateTeamMemberUseCase';
import { ListTeamMembersUseCase } from '../../application/company/use-cases/ListTeamMembersUseCase';
import { CreateCandidateProfileUseCase } from '../../application/candidate/use-cases/CreateCandidateProfileUseCase';
import { GetCandidateProfileUseCase } from '../../application/candidate/use-cases/GetCandidateProfileUseCase';
import { UpdateCandidateProfileUseCase } from '../../application/candidate/use-cases/UpdateCandidateProfileUseCase';
import { UploadCandidateResumeUseCase } from '../../application/candidate/use-cases/UploadCandidateResumeUseCase';
import { ToggleTeamMemberStatusUseCase } from '../../application/company/use-cases/ToggleTeamMemberStatusUseCase';

export interface UseCases {
  registerUserUseCase: RegisterUserUseCase;
  verifyOTPUseCase: VerifyOTPUseCase;
  loginUseCase: LoginUseCase;
  resendOTPUseCase: ResendOTPUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  forgotPasswordUseCase: ForgotPasswordUseCase;
  verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;

  checkCompanyStatusUseCase: CheckCompanyStatusUseCase;
  submitCompanyApprovalUseCase: SubmitCompanyApprovalUseCase;
  getMyApprovalUseCase: GetMyCompanyApprovalUseCase;
  googleOAuthUseCase: GoogleOAuthUseCase;
  getPendingCompaniesUseCase: GetPendingCompaniesUseCase;
  approveCompanyUseCase: ApproveCompanyUseCase;
  rejectCompanyUseCase: RejectCompanyUseCase;
  markDocumentUseCase: MarkDocumentUseCase;
  getApprovedCompaniesUseCase: GetApprovedCompaniesUseCase;
  toggleCompanyActiveUseCase: ToggleCompanyActiveUseCase;
  uploadFileUseCase: UploadFileUseCase;
  createTeamMemberUseCase: CreateTeamMemberUseCase;
  listTeamMembersUseCase: ListTeamMembersUseCase;
  toggleTeamMemberStatusUseCase: ToggleTeamMemberStatusUseCase;
  createCandidateProfileUseCase: CreateCandidateProfileUseCase;
  getCandidateProfileUseCase: GetCandidateProfileUseCase;
  updateCandidateProfileUseCase: UpdateCandidateProfileUseCase;
  uploadCandidateResumeUseCase: UploadCandidateResumeUseCase;
}


export function createUseCases(repositories: Repositories, services: Services): UseCases {
  const { userRepository, otpRepository, companyApprovalRepository, candidateProfileRepository, oauthSessionRepository } = repositories;
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
    googleOAuthUseCase: new GoogleOAuthUseCase(userRepository, tokenService, oauthSessionRepository),

    checkCompanyStatusUseCase: new CheckCompanyStatusUseCase(companyApprovalRepository),
    submitCompanyApprovalUseCase: new SubmitCompanyApprovalUseCase(companyApprovalRepository, userRepository),
    getMyApprovalUseCase: new GetMyCompanyApprovalUseCase(companyApprovalRepository),

    getPendingCompaniesUseCase: new GetPendingCompaniesUseCase(companyApprovalRepository),
    approveCompanyUseCase: new ApproveCompanyUseCase(companyApprovalRepository, userRepository),
    rejectCompanyUseCase: new RejectCompanyUseCase(companyApprovalRepository),
    markDocumentUseCase: new MarkDocumentUseCase(companyApprovalRepository),
    getApprovedCompaniesUseCase: new GetApprovedCompaniesUseCase(companyApprovalRepository),
    toggleCompanyActiveUseCase: new ToggleCompanyActiveUseCase(companyApprovalRepository),

    uploadFileUseCase: new UploadFileUseCase(services.fileStorageService),

    createTeamMemberUseCase: new CreateTeamMemberUseCase(userRepository, passwordHasher, emailService),
    listTeamMembersUseCase: new ListTeamMembersUseCase(userRepository),
    toggleTeamMemberStatusUseCase: new ToggleTeamMemberStatusUseCase(userRepository),

    createCandidateProfileUseCase: new CreateCandidateProfileUseCase(candidateProfileRepository),
    getCandidateProfileUseCase: new GetCandidateProfileUseCase(candidateProfileRepository),
    updateCandidateProfileUseCase: new UpdateCandidateProfileUseCase(candidateProfileRepository),
    uploadCandidateResumeUseCase: new UploadCandidateResumeUseCase(candidateProfileRepository, services.fileStorageService),
  };

}
