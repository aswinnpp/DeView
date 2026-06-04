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
import { GoogleGenAiScoringService } from '../ai/GoogleGenAiScoringService.js';
import { SocketIoNotificationPublisher } from "../notifications/SocketIoNotificationPublisher.js";
import { DocuSignOfferEnvelopeService } from '../docusign/DocuSignOfferEnvelopeService.js';

export function bindServices(container: Container): void {

  container.bind(TYPES.PasswordHasherPort).to(BcryptPasswordHasher);
  container.bind(TYPES.EmailServicePort).to(NodemailerEmailService);
  container.bind(TYPES.FileStoragePort).to(S3FileStorageService);
  container.bind(TYPES.CryptoRandomPort).to(NodeCryptoRandomService);
  container.bind(TYPES.AiScoringServicePort).to(GoogleGenAiScoringService);
  container.bind(TYPES.NotificationPublisherPort).to(SocketIoNotificationPublisher);

  container
    .bind(DocuSignOfferEnvelopeService)
    .toConstantValue(new DocuSignOfferEnvelopeService(env));

  container.bind(TYPES.GoogleAuthPort).toConstantValue(
    new GoogleAuthService(
      env.GOOGLE_CLIENT_ID || '',
      env.GOOGLE_CLIENT_SECRET || '',
      env.GOOGLE_CALLBACK_URL || ''
    )
  );

  container.bind(TYPES.TokenServicePort).toDynamicValue(() => {
    const redis = container.get<RedisClientType>(TYPES.Redis);

    // Repos receive TTL seconds derived from env — single source of truth
    const refreshRepo = new RedisRefreshTokenRepository(redis, env.REFRESH_TOKEN_TTL_SECONDS);
    const accessRepo = new RedisAccessTokenRepository(redis, env.ACCESS_TOKEN_TTL_SECONDS);

    return new SecureJwtTokenService(
      refreshRepo,
      accessRepo,
      env.JWT_ACCESS_SECRET,
      env.JWT_REFRESH_SECRET,
      env.ACCESS_TOKEN_TTL,
      env.REFRESH_TOKEN_TTL,
      env.REFRESH_TOKEN_TTL_SECONDS * 1000   // ms for expiresAt calculation
    );
  });
}
