import { Container } from 'inversify';

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
import { CreateTeamMemberUseCase } from '../../application/company/use-cases/CreateTeamMemberUseCase.js';
import { ListTeamMembersUseCase } from '../../application/company/use-cases/ListTeamMembersUseCase.js';
import { ToggleTeamMemberStatusUseCase } from '../../application/company/use-cases/ToggleTeamMemberStatusUseCase.js';

// Admin use cases
import { GetPendingCompaniesUseCase } from '../../application/admin/use-cases/GetPendingCompaniesUseCase.js';
import { ApproveCompanyUseCase } from '../../application/admin/use-cases/ApproveCompanyUseCase.js';
import { RejectCompanyUseCase } from '../../application/admin/use-cases/RejectCompanyUseCase.js';
import { MarkDocumentUseCase } from '../../application/admin/use-cases/MarkDocumentUseCase.js';
import { GetApprovedCompaniesUseCase } from '../../application/admin/use-cases/GetApprovedCompaniesUseCase.js';
import { ToggleCompanyActiveUseCase } from '../../application/admin/use-cases/ToggleCompanyActiveUseCase.js';

// Candidate use cases
import { CreateCandidateProfileUseCase } from '../../application/candidate/use-cases/CreateCandidateProfileUseCase.js';
import { GetCandidateProfileUseCase } from '../../application/candidate/use-cases/GetCandidateProfileUseCase.js';
import { UpdateCandidateProfileUseCase } from '../../application/candidate/use-cases/UpdateCandidateProfileUseCase.js';

// Upload use cases
import { GenerateUploadSignatureUseCase } from '../../application/upload/use-cases/GenerateUploadSignatureUseCase.js';

/**
 * Binds all use case dependencies to the container
 */
export function bindUseCases(container: Container): void {
  // Auth use cases
  container.bind(RegisterUserUseCase).toSelf();
  container.bind(VerifyOTPUseCase).toSelf();
  container.bind(LoginUseCase).toSelf();
  container.bind(ResendOTPUseCase).toSelf();
  container.bind(RefreshTokenUseCase).toSelf();
  container.bind(LogoutUseCase).toSelf();
  container.bind(ForgotPasswordUseCase).toSelf();
  container.bind(VerifyPasswordResetOTPUseCase).toSelf();
  container.bind(ResetPasswordUseCase).toSelf();
  container.bind(GoogleOAuthUseCase).toSelf();

  // Company use cases
  container.bind(ResolveCompanyForUserUseCase).toSelf();
  container.bind(CheckCompanyStatusUseCase).toSelf();
  container.bind(SubmitCompanyApprovalUseCase).toSelf();
  container.bind(GetMyCompanyApprovalUseCase).toSelf();
  container.bind(CreateTeamMemberUseCase).toSelf();
  container.bind(ListTeamMembersUseCase).toSelf();
  container.bind(ToggleTeamMemberStatusUseCase).toSelf();

  // Admin use cases
  container.bind(GetPendingCompaniesUseCase).toSelf();
  container.bind(ApproveCompanyUseCase).toSelf();
  container.bind(RejectCompanyUseCase).toSelf();
  container.bind(MarkDocumentUseCase).toSelf();
  container.bind(GetApprovedCompaniesUseCase).toSelf();
  container.bind(ToggleCompanyActiveUseCase).toSelf();

  // Candidate use cases
  container.bind(CreateCandidateProfileUseCase).toSelf();
  container.bind(GetCandidateProfileUseCase).toSelf();
  container.bind(UpdateCandidateProfileUseCase).toSelf();

  // Upload use cases
  container.bind(GenerateUploadSignatureUseCase).toSelf();
}
