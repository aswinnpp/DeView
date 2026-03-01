

export const TYPES = {
  Db: Symbol('Db'),
  Redis: Symbol('Redis'),

  UserRepositoryPort: Symbol('UserRepositoryPort'),
  OTPRepositoryPort: Symbol('OTPRepositoryPort'),
  CompanyProfileRepositoryPort: Symbol('CompanyProfileRepositoryPort'),
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
  GetCompanyProfileUseCasePort: Symbol('GetCompanyProfileUseCasePort'),
  UpdateCompanyProfileUseCasePort: Symbol('UpdateCompanyProfileUseCasePort'),
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
  GetAllCandidatesUseCasePort: Symbol('GetAllCandidatesUseCasePort'),
  ToggleCandidateStatusUseCasePort: Symbol('ToggleCandidateStatusUseCasePort'),

  GenerateUploadSignatureUseCasePort: Symbol('GenerateUploadSignatureUseCasePort'),
  CreateSubscriptionUsecasePort: Symbol("CreateSubscriptionUsecasePort"),
  ListSubscriptionsUsecasePort: Symbol("ListSubscriptionsUsecasePort"),
  ToggleSubscriptionStatusUsecasePort: Symbol("ToggleSubscriptionStatusUsecasePort"),
  UpdateSubscriptionUsecasePort: Symbol("UpdateSubscriptionUsecasePort"),
  SubscriptionRepositoryPort: Symbol("SubscriptionRepositoryPort"),
  PaymentRepositoryPort: Symbol("PaymentRepositoryPort"),
  JobRepositoryPort: Symbol('JobRepositoryPort'),

  CreatePaymentIntentUseCasePort: Symbol("CreatePaymentIntentUseCasePort"),
  HandlePaymentWebhookUseCasePort: Symbol("HandlePaymentWebhookUseCasePort"),
  ActivatePendingSubscriptionNowUseCasePort: Symbol("ActivatePendingSubscriptionNowUseCasePort"),
  CreateJobUseCasePort: Symbol('CreateJobUseCasePort'),
  UpdateJobUseCasePort: Symbol('UpdateJobUseCasePort'),
  ListJobsUseCasePort: Symbol('ListJobsUseCasePort'),
  ListAllJobsForCandidatesUseCasePort: Symbol('ListAllJobsForCandidatesUseCasePort'),
  ToggleJobStatusUseCasePort: Symbol('ToggleJobStatusUseCasePort'),
  ApplyForJobUseCasePort: Symbol('ApplyForJobUseCasePort'),
  JobApplicationRepositoryPort: Symbol('JobApplicationRepositoryPort'),

  // Application (company/HR) - independent entity like Job
  ApplicationRepositoryPort: Symbol('ApplicationRepositoryPort'),
  ListPendingApplicationsForJobUseCasePort: Symbol('ListPendingApplicationsForJobUseCasePort'),
} as const;
