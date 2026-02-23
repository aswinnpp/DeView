import { Container } from 'inversify';
import { TYPES } from './types.js';

// Auth use cases
import { RegisterUserUseCase } from '../../application/auth/use-cases/RegisterUserUseCase.js';
import { VerifyOTPUseCase } from '../../application/auth/use-cases/VerifyOTPUseCase.js';
import { LoginUseCase } from '../../application/auth/use-cases/LoginUseCase.js';
import { ResendOTPUseCase } from '../../application/auth/use-cases/ResendOTPUseCase.js';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../../application/auth/use-cases/LogoutUseCase.js';
import { ForgotPasswordUseCase } from '../../application/auth/use-cases/ForgotPasswordUseCase.js';
import { VerifyPasswordResetOTPUseCase } from '../../application/auth/use-cases/VerifyPasswordResetOTPUseCase.js';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/ResetPasswordUseCase.js';
import { GoogleOAuthUseCase } from '../../application/auth/use-cases/GoogleOAuthUseCase.js';

// Company use cases
import { ResolveCompanyForUserUseCase } from '../../application/company/use-cases/ResolveCompanyForUserUseCase.js';
import { CheckCompanyStatusUseCase } from '../../application/company/use-cases/CheckCompanyStatusUseCase.js';
import { SubmitCompanyApprovalUseCase } from '../../application/company/use-cases/SubmitCompanyApprovalUseCase.js';
import { GetMyCompanyApprovalUseCase } from '../../application/company/use-cases/GetMyCompanyApprovalUseCase.js';
import { GetCompanyProfileUseCase } from '../../application/company/use-cases/GetCompanyProfileUseCase.js';
import { UpdateCompanyProfileUseCase } from '../../application/company/use-cases/UpdateCompanyProfileUseCase.js';
import { CreateTeamMemberUseCase } from '../../application/company/use-cases/CreateTeamMemberUseCase.js';
import { ListTeamMembersUseCase } from '../../application/company/use-cases/ListTeamMembersUseCase.js';
import { ToggleTeamMemberStatusUseCase } from '../../application/company/use-cases/ToggleTeamMemberStatusUseCase.js';

// Admin use cases
import { GetPendingCompaniesUseCase } from '../../application/admin/use-cases/GetPendingCompaniesUseCase.js';
import { ApproveCompanyUseCase } from '../../application/admin/use-cases/ApproveCompanyUseCase.js';
import { RejectCompanyUseCase } from '../../application/admin/use-cases/RejectCompanyUseCase.js';
import { MarkDocumentUseCase } from '../../application/admin/use-cases/MarkDocumentUseCase.js';
import { GetApprovedCompaniesUseCase } from '../../application/admin/use-cases/GetApprovedCompaniesUseCase.js';
import { AdminToggleActivityUseCase } from '../../application/admin/use-cases/AdminToggleActivityUseCase.js';

// Candidate use cases
import { CreateCandidateProfileUseCase } from '../../application/candidate/use-cases/CreateCandidateProfileUseCase.js';
import { GetCandidateProfileUseCase } from '../../application/candidate/use-cases/GetCandidateProfileUseCase.js';
import { UpdateCandidateProfileUseCase } from '../../application/candidate/use-cases/UpdateCandidateProfileUseCase.js';
import { GetAllCandidatesUseCase } from '../../application/candidate/use-cases/GetAllCandidatesUseCase.js';
import { ToggleCandidateStatusUseCase } from '../../application/candidate/use-cases/ToggleCandidateStatusUseCase.js';

// Upload use cases
import { GenerateUploadSignatureUseCase } from '../../application/upload/use-cases/GenerateUploadSignatureUseCase.js';

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
