import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { GoogleAuthService } from '../../../infrastructure/auth/GoogleAuthService.js';
import { SecureJwtTokenService } from '../../../infrastructure/security/SecureJwtTokenService.js';
import { MongoUserRepository } from '../../../infrastructure/persistence/mongodb/repositories/MongoUserRepository.js';
import { User } from '../../../domain/user/entities/User.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { Role } from '../../../domain/user/value-objects/Role.js';
import { redisClient } from '../../../infrastructure/cache/RedisClient.js';


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

        // Generate tokens
        const accessToken = this.tokenService.signAccessToken({
            userId: user.id!,
            role: user.role.getValue(),
        });
        const refreshTokenData = await this.tokenService.generateRefreshToken(user.id!);

        // Create session ID for frontend to exchange for user info
        const sessionId = crypto.randomUUID();
        await redisClient.setex(
            `oauth:session:${sessionId}`,
            300, // 5 minutes TTL
            JSON.stringify({
                accessToken,
                refreshToken: refreshTokenData.token,
                user: {
                    id: user.id!,
                    fullName: user.fullName,
                    email: user.email.getValue(),
                    role: user.role.getValue(),
                },
                role: user.role.getValue()
            })
        );

        // Redirect to frontend with session ID
        const frontendUrl = process.env.FRONTEND_URL;
        reply.redirect(`${frontendUrl}/auth/callback?sessionId=${sessionId}`);
    };

    exchangeToken = async (
        request: FastifyRequest<{ Querystring: { sessionId: string } }>,
        reply: FastifyReply
    ) => {
        const { sessionId } = request.query;

        const sessionData = await redisClient.get(`oauth:session:${sessionId}`);

        if (!sessionData) {
            reply.status(400).send({ error: 'Session expired or invalid' });
            return;
        }

        // Delete session (one-time use)
        await redisClient.del(`oauth:session:${sessionId}`);

        const { accessToken, refreshToken, user, role } = JSON.parse(sessionData);

        // Set tokens as HTTP-only cookies
        this.setAccessTokenCookie(reply, accessToken);
        this.setRefreshTokenCookie(reply, refreshToken);

        // Return only user info (no tokens in response body!)
        reply.send({ user, role });
    };

    // =====================
    // HELPER METHODS
    // =====================

    private setAccessTokenCookie(reply: FastifyReply, token: string): void {
        const isProduction = process.env.NODE_ENV === 'production';
        const options = [
            `accessToken=${token}`,
            'Path=/',
            'HttpOnly',
            'SameSite=Strict',
            'Max-Age=900',
            isProduction ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        reply.header('Set-Cookie', options);
    }

    private setRefreshTokenCookie(reply: FastifyReply, token: string): void {
        const isProduction = process.env.NODE_ENV === 'production';
        const options = [
            `refreshToken=${token}`,
            'Path=/',
            'HttpOnly',
            'SameSite=Strict',
            'Max-Age=604800',
            isProduction ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        const existingCookie = reply.getHeader('Set-Cookie');
        if (existingCookie) {
            reply.header('Set-Cookie', [existingCookie as string, options]);
        } else {
            reply.header('Set-Cookie', options);
        }
    }
}
