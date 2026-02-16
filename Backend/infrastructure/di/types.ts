/**
 * Dependency injection types/symbols.
 * Kept minimal - only for ports/interfaces that need abstraction.
 */
export const TYPES = {
  // Infrastructure dependencies
  Db: Symbol('Db'),
  Redis: Symbol('Redis'),

  // Repository ports (interfaces)
  UserRepository: Symbol('UserRepository'),
  OTPRepository: Symbol('OTPRepository'),
  CompanyApprovalRepository: Symbol('CompanyApprovalRepository'),
  CandidateProfileRepository: Symbol('CandidateProfileRepository'),
  OAuthSessionPort: Symbol('OAuthSessionPort'),

  // Service ports (interfaces)
  PasswordHasherPort: Symbol('PasswordHasherPort'),
  TokenServicePort: Symbol('TokenServicePort'),
  EmailServicePort: Symbol('EmailServicePort'),
  GoogleAuthPort: Symbol('GoogleAuthPort'),
  FileStoragePort: Symbol('FileStoragePort'),
  CryptoRandomPort: Symbol('CryptoRandomPort'),
} as const;
