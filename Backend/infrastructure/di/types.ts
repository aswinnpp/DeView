
export const TYPES = {
  Db: Symbol('Db'),
  Redis: Symbol('Redis'),

  UserRepositoryPort: Symbol('UserRepositoryPort'),
  OTPRepositoryPort: Symbol('OTPRepositoryPort'),
  CompanyApprovalRepositoryPort: Symbol('CompanyApprovalRepositoryPort'),
  CandidateProfileRepositoryPort: Symbol('CandidateProfileRepositoryPort'),
  OAuthSessionPort: Symbol('OAuthSessionPort'),

  PasswordHasherPort: Symbol('PasswordHasherPort'),
  TokenServicePort: Symbol('TokenServicePort'),
  EmailServicePort: Symbol('EmailServicePort'),
  GoogleAuthPort: Symbol('GoogleAuthPort'),
  FileStoragePort: Symbol('FileStoragePort'),
  CryptoRandomPort: Symbol('CryptoRandomPort'),

  // Use case ports (controllers depend on these, not concrete use cases)
  RegisterUserUseCasePort: Symbol('RegisterUserUseCasePort'),
  VerifyOTPUseCasePort: Symbol('VerifyOTPUseCasePort'),
  LoginUseCasePort: Symbol('LoginUseCasePort'),
  ResendOTPUseCasePort: Symbol('ResendOTPUseCasePort'),
  RefreshTokenUseCasePort: Symbol('RefreshTokenUseCasePort'),
  LogoutUseCasePort: Symbol('LogoutUseCasePort'),
  ForgotPasswordUseCasePort: Symbol('ForgotPasswordUseCasePort'),
  VerifyPasswordResetOTPUseCasePort: Symbol('VerifyPasswordResetOTPUseCasePort'),
  ResetPasswordUseCasePort: Symbol('ResetPasswordUseCasePort'),
  GoogleOAuthUseCasePort: Symbol('GoogleOAuthUseCasePort'),

  CheckCompanyStatusUseCasePort: Symbol('CheckCompanyStatusUseCasePort'),
  SubmitCompanyApprovalUseCasePort: Symbol('SubmitCompanyApprovalUseCasePort'),
  GetMyCompanyApprovalUseCasePort: Symbol('GetMyCompanyApprovalUseCasePort'),
  CreateTeamMemberUseCasePort: Symbol('CreateTeamMemberUseCasePort'),
  ListTeamMembersUseCasePort: Symbol('ListTeamMembersUseCasePort'),
  ToggleTeamMemberStatusUseCasePort: Symbol('ToggleTeamMemberStatusUseCasePort'),

  GetPendingCompaniesUseCasePort: Symbol('GetPendingCompaniesUseCasePort'),
  GetApprovedCompaniesUseCasePort: Symbol('GetApprovedCompaniesUseCasePort'),
  ApproveCompanyUseCasePort: Symbol('ApproveCompanyUseCasePort'),
  RejectCompanyUseCasePort: Symbol('RejectCompanyUseCasePort'),
  MarkDocumentUseCasePort: Symbol('MarkDocumentUseCasePort'),
  ToggleCompanyActiveUseCasePort: Symbol('ToggleCompanyActiveUseCasePort'),

  CreateCandidateProfileUseCasePort: Symbol('CreateCandidateProfileUseCasePort'),
  GetCandidateProfileUseCasePort: Symbol('GetCandidateProfileUseCasePort'),
  UpdateCandidateProfileUseCasePort: Symbol('UpdateCandidateProfileUseCasePort'),

  GenerateUploadSignatureUseCasePort: Symbol('GenerateUploadSignatureUseCasePort'),
} as const;
