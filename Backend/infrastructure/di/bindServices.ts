import { Container } from 'inversify';
import type { RedisClientType } from 'redis';

import { TYPES } from './types.js';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher.js';
import { SecureJwtTokenService } from '../security/SecureJwtTokenService.js';
import { NodemailerEmailService } from '../email/NodemailerEmailService.js';
import { GoogleAuthService } from '../auth/GoogleAuthService.js';
import { S3FileStorageService } from '../storage/S3FileStorageService.js';
import { NodeCryptoRandomService } from '../security/NodeCryptoRandomService.js';
import { RedisAccessTokenRepository } from '../persistence/redis/RedisAccessTokenRepository.js';
import { RedisRefreshTokenRepository } from '../persistence/redis/RedisRefreshTokenRepository.js';
import { env } from '../config/env.js';


export function bindServices(container: Container): void {

  container.bind(TYPES.PasswordHasherPort).to(BcryptPasswordHasher);
  container.bind(TYPES.EmailServicePort).to(NodemailerEmailService);
  container.bind(TYPES.FileStoragePort).to(S3FileStorageService);
  container.bind(TYPES.CryptoRandomPort).to(NodeCryptoRandomService);

  container.bind(TYPES.GoogleAuthPort).toConstantValue(
    new GoogleAuthService(
      env.GOOGLE_CLIENT_ID || '',
      env.GOOGLE_CLIENT_SECRET || '',
      env.GOOGLE_CALLBACK_URL || ''
    )
  );

  container.bind(TYPES.TokenServicePort).toDynamicValue(() => {
    const redis = container.get<RedisClientType>(TYPES.Redis);
    return new SecureJwtTokenService(
      new RedisRefreshTokenRepository(redis),
      new RedisAccessTokenRepository(redis),
      env.JWT_ACCESS_SECRET,
      env.JWT_REFRESH_SECRET
    );
  });
}
