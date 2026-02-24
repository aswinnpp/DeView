import { Container } from 'inversify';
import { TYPES } from './types.js';

// Auth use cases
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.usecase.js';
import { VerifyOTPUseCase } from '../../application/auth/use-cases/verify-otp.usecase.js';
import { LoginUseCase } from '../../application/auth/use-cases/login.usecase.js';
import { ResendOTPUseCase } from '../../application/auth/use-cases/resend-otp.usecase.js';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/refresh-token.usecase.js';
import { LogoutUseCase } from '../../application/auth/use-cases/logout.usecase.js';
import { ForgotPasswordUseCase } from '../../application/auth/use-cases/forgot-password.usecase.js';
import { VerifyPasswordResetOTPUseCase } from '../../application/auth/use-cases/verify-password-reset-otp.usecase.js';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/reset-password.usecase.js';
import { GoogleOAuthUseCase } from '../../application/auth/use-cases/google-oauth.usecase.js';

// Company use cases
import { ResolveCompanyForUserUseCase } from '../../application/company/use-cases/resolve-company-for-user.usecase.js';
import { CheckCompanyStatusUseCase } from '../../application/company/use-cases/check-company-status.usecase.js';
import { SubmitCompanyApprovalUseCase } from '../../application/company/use-cases/submit-company-approval.usecase.js';
import { GetMyCompanyApprovalUseCase } from '../../application/company/use-cases/get-my-company-approval.usecase.js';
import { GetCompanyProfileUseCase } from '../../application/company/use-cases/get-company-profile.usecase.js';
import { UpdateCompanyProfileUseCase } from '../../application/company/use-cases/update-company-profile.usecase.js';
import { CreateTeamMemberUseCase } from '../../application/company/use-cases/create-team-member.usecase.js';
import { ListTeamMembersUseCase } from '../../application/company/use-cases/list-team-members.usecase.js';
import { ToggleTeamMemberStatusUseCase } from '../../application/company/use-cases/toggle-team-member-status.usecase.js';

// Admin use cases
import { GetPendingCompaniesUseCase } from '../../application/admin/use-cases/get-pending-companies.usecase.js';
import { ApproveCompanyUseCase } from '../../application/admin/use-cases/approve-company.usecase.js';
import { RejectCompanyUseCase } from '../../application/admin/use-cases/reject-company.usecase.js';
import { MarkDocumentUseCase } from '../../application/admin/use-cases/mark-document.usecase.js';
import { GetApprovedCompaniesUseCase } from '../../application/admin/use-cases/get-approved-companies.usecase.js';
import { AdminToggleActivityUseCase } from '../../application/admin/use-cases/admin-toggle-activity.usecase.js';

// Candidate use cases
import { CreateCandidateProfileUseCase } from '../../application/candidate/use-cases/create-candidate-profile.usecase.js';
import { GetCandidateProfileUseCase } from '../../application/candidate/use-cases/get-candidate-profile.usecase.js';
import { UpdateCandidateProfileUseCase } from '../../application/candidate/use-cases/update-candidate-profile.usecase.js';
import { GetAllCandidatesUseCase } from '../../application/candidate/use-cases/get-all-candidates.usecase.js';
import { ToggleCandidateStatusUseCase } from '../../application/candidate/use-cases/toggle-candidate-status.usecase.js';

// Upload use cases
import { GenerateUploadSignatureUseCase } from '../../application/upload/use-cases/generate-upload-signature.usecase.js';

/**
 * Binds all use case dependencies to the container.
 * Controllers inject ports (abstractions); ports are bound to concrete use cases.
 */
export function bindUseCases(container: Container): void {
  // Internal use cases (injected by other use cases, not controllers)
  container.bind(ResolveCompanyForUserUseCase).toSelf();

  // Auth use cases - bind port to implementation
  container.bind(TYPES.RegisterUserUseCasePort).to(RegisterUserUseCase);
  container.bind(TYPES.VerifyOTPUseCasePort).to(VerifyOTPUseCase);
  container.bind(TYPES.LoginUseCasePort).to(LoginUseCase);
  container.bind(TYPES.ResendOTPUseCasePort).to(ResendOTPUseCase);
  container.bind(TYPES.RefreshTokenUseCasePort).to(RefreshTokenUseCase);
  container.bind(TYPES.LogoutUseCasePort).to(LogoutUseCase);
  container.bind(TYPES.ForgotPasswordUseCasePort).to(ForgotPasswordUseCase);
  container.bind(TYPES.VerifyPasswordResetOTPUseCasePort).to(VerifyPasswordResetOTPUseCase);
  container.bind(TYPES.ResetPasswordUseCasePort).to(ResetPasswordUseCase);
  container.bind(TYPES.GoogleOAuthUseCasePort).to(GoogleOAuthUseCase);

  // Company use cases
  container.bind(TYPES.CheckCompanyStatusUseCasePort).to(CheckCompanyStatusUseCase);
  container.bind(TYPES.SubmitCompanyApprovalUseCasePort).to(SubmitCompanyApprovalUseCase);
  container.bind(TYPES.GetMyCompanyApprovalUseCasePort).to(GetMyCompanyApprovalUseCase);
  container.bind(TYPES.GetCompanyProfileUseCasePort).to(GetCompanyProfileUseCase);
  container.bind(TYPES.UpdateCompanyProfileUseCasePort).to(UpdateCompanyProfileUseCase);
  container.bind(TYPES.CreateTeamMemberUseCasePort).to(CreateTeamMemberUseCase);
  container.bind(TYPES.ListTeamMembersUseCasePort).to(ListTeamMembersUseCase);
  container.bind(TYPES.ToggleTeamMemberStatusUseCasePort).to(ToggleTeamMemberStatusUseCase);

  // Admin use cases
  container.bind(TYPES.GetPendingCompaniesUseCasePort).to(GetPendingCompaniesUseCase);
  container.bind(TYPES.GetApprovedCompaniesUseCasePort).to(GetApprovedCompaniesUseCase);
  container.bind(TYPES.ApproveCompanyUseCasePort).to(ApproveCompanyUseCase);
  container.bind(TYPES.RejectCompanyUseCasePort).to(RejectCompanyUseCase);
  container.bind(TYPES.MarkDocumentUseCasePort).to(MarkDocumentUseCase);
  container.bind(TYPES.ToggleCompanyActiveUseCasePort).to(AdminToggleActivityUseCase);

  // Candidate use cases
  container.bind(TYPES.CreateCandidateProfileUseCasePort).to(CreateCandidateProfileUseCase);
  container.bind(TYPES.GetCandidateProfileUseCasePort).to(GetCandidateProfileUseCase);
  container.bind(TYPES.UpdateCandidateProfileUseCasePort).to(UpdateCandidateProfileUseCase);
  container.bind(TYPES.GetAllCandidatesUseCasePort).to(GetAllCandidatesUseCase);
  container.bind(TYPES.ToggleCandidateStatusUseCasePort).to(ToggleCandidateStatusUseCase);

  // Upload use cases
  container.bind(TYPES.GenerateUploadSignatureUseCasePort).to(GenerateUploadSignatureUseCase);
}
