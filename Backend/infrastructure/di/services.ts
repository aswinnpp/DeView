import { FastifyInstance } from 'fastify';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher.js';
import { SecureJwtTokenService } from '../security/SecureJwtTokenService.js';
import { NodemailerEmailService } from '../email/NodemailerEmailService.js';
import { GoogleAuthService } from '../auth/GoogleAuthService.js';
import { env } from '../config/env.js';
import { Repositories } from './repositories.js';

export interface Services {
    passwordHasher: BcryptPasswordHasher;
    tokenService: SecureJwtTokenService;
    emailService: NodemailerEmailService;
    googleAuthService: GoogleAuthService;
}

export function createServices(fastify: FastifyInstance, repositories: Repositories): Services {
    return {
        passwordHasher: new BcryptPasswordHasher(),
        tokenService: new SecureJwtTokenService(fastify, repositories.refreshTokenRepository),
        emailService: new NodemailerEmailService(),
        googleAuthService: new GoogleAuthService(
            env.GOOGLE_CLIENT_ID || '',
            env.GOOGLE_CLIENT_SECRET || '',
            env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/auth/google/callback'
        ),
    };
}
