import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher.js';
import { SecureJwtTokenService } from '../security/SecureJwtTokenService.js';
import { NodemailerEmailService } from '../email/NodemailerEmailService.js';
import { GoogleAuthService } from '../auth/GoogleAuthService.js';
import { CloudinaryFileStorageService } from '../storage/CloudinaryFileStorageService.js';
import { FileStoragePort } from '../../application/upload/ports/FileStoragePort.js';
import { env } from '../config/env.js';
import { redisClient } from '../cache/RedisClient.js';
import { RedisAccessTokenRepository } from '../persistence/redis/RedisAccessTokenRepository.js';
import { RedisRefreshTokenRepository } from '../persistence/redis/RedisRefreshTokenRepository.js';
import { Repositories } from './repositories.js';

export interface Services {
  passwordHasher: BcryptPasswordHasher;
  tokenService: SecureJwtTokenService;
  emailService: NodemailerEmailService;
  googleAuthService: GoogleAuthService;
  fileStorageService: FileStoragePort;
}

export function createServices(_: any, __: Repositories): Services {
  const refreshRepo = new RedisRefreshTokenRepository(redisClient);
  const accessRepo = new RedisAccessTokenRepository(redisClient);

  return {
    passwordHasher: new BcryptPasswordHasher(),

    tokenService: new SecureJwtTokenService(
      refreshRepo,
      accessRepo,
      env.JWT_ACCESS_SECRET

    ),

    emailService: new NodemailerEmailService(),

    googleAuthService: new GoogleAuthService(
      env.GOOGLE_CLIENT_ID || "",
      env.GOOGLE_CLIENT_SECRET || "",
      env.GOOGLE_CALLBACK_URL || ""
    ),

    fileStorageService: new CloudinaryFileStorageService(),
  };
}
