
export const TYPES = {
  Db: Symbol('Db'),
  Redis: Symbol('Redis'),

  UserRepository: Symbol('UserRepository'),
  OTPRepository: Symbol('OTPRepository'),
  CompanyApprovalRepository: Symbol('CompanyApprovalRepository'),
  CandidateProfileRepository: Symbol('CandidateProfileRepository'),
  OAuthSessionPort: Symbol('OAuthSessionPort'),

  PasswordHasherPort: Symbol('PasswordHasherPort'),
  TokenServicePort: Symbol('TokenServicePort'),
  EmailServicePort: Symbol('EmailServicePort'),
  GoogleAuthPort: Symbol('GoogleAuthPort'),
  FileStoragePort: Symbol('FileStoragePort'),
  CryptoRandomPort: Symbol('CryptoRandomPort'),
} as const;
