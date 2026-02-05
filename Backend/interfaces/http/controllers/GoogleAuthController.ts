import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { GoogleAuthService } from '../../../infrastructure/auth/GoogleAuthService.js';
import { SecureJwtTokenService } from '../../../infrastructure/security/SecureJwtTokenService.js';
import { MongoUserRepository } from '../../../infrastructure/persistence/mongodb/repositories/MongoUserRepository.js';
import { User } from '../../../domain/user/entities/User.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { Role } from '../../../domain/user/value-objects/Role.js';
import { sessionCache } from '../../../infrastructure/cache/SessionCache.js';

export class GoogleAuthController {
    constructor(
        private googleAuthService: GoogleAuthService,
        private tokenService: SecureJwtTokenService,
        private userRepository: MongoUserRepository
    ) { }

    initiateAuth = async (
        request: FastifyRequest<{ Querystring: { role?: string; mode?: string } }>,
        reply: FastifyReply
    ) => {
        const { role, mode } = request.query;
        const authUrl = this.googleAuthService.getAuthUrl(role, mode);
        reply.redirect(authUrl);
    };

    handleCallback = async (
        request: FastifyRequest<{ Querystring: { code: string; state?: string } }>,
        reply: FastifyReply
    ) => {
        const { code, state } = request.query;

        // Parse state to get role and mode
        let role = 'candidate';

        if (state) {
            try {
                const parsed = JSON.parse(state);
                role = parsed.role || 'candidate';
            } catch {
                // Default values already set
            }
        }

        // Verify Google token and get user info
        const googleUser = await this.googleAuthService.verifyToken(code);

        // Check if user exists
        const email = new Email(googleUser.email);
        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            // Create new user
            user = User.create({
                fullName: googleUser.name,
                email,
                passwordHash: '', // No password for Google auth
                role: new Role(role),
                authProvider: 'google',
            });
            user.markEmailAsVerified();
            await this.userRepository.create(user);

            // Fetch the created user to get the ID
            user = await this.userRepository.findByEmail(email);
        }

        if (!user) {
            throw new Error('Failed to create or find user');
        }

        // Generate JWT token
        const token = this.tokenService.signAccessToken({
            userId: user.id!,
            role: user.role.getValue(),
        });

        // Create session ID for frontend to exchange for token
        const sessionId = crypto.randomUUID();
        await sessionCache.setex(
            `oauth:session:${sessionId}`,
            300, // 5 minutes TTL
            JSON.stringify({ token, role: user.role.getValue() })
        );

        // Redirect to frontend with session ID
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        reply.redirect(`${frontendUrl}/auth/callback?sessionId=${sessionId}`);
    };

    exchangeToken = async (
        request: FastifyRequest<{ Querystring: { sessionId: string } }>,
        reply: FastifyReply
    ) => {
        const { sessionId } = request.query;

        const sessionData = await sessionCache.get(`oauth:session:${sessionId}`);

        if (!sessionData) {
            reply.status(400).send({ error: 'Session expired or invalid' });
            return;
        }

        // Delete session (one-time use)
        await sessionCache.del(`oauth:session:${sessionId}`);

        const { token, role } = JSON.parse(sessionData);
        reply.send({ token, role });
    };
}
