import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { registerSchema } from '../schemas/register.schema.js';
import { verifyOTPSchema } from '../schemas/verify-otp.schema.js';
import { resendOTPSchema } from '../schemas/resend-otp.schema.js';
import { loginSchema } from '../schemas/login.schema.js';
import { forgotPasswordSchema } from '../schemas/forgot-password.schema.js';
import { resetPasswordSchema } from '../schemas/reset-password.schema.js';
import { verifyPasswordResetOTPSchema } from '../schemas/verify-password-reset-otp.schema.js';
import { verifyOldPasswordSchema } from '../schemas/verify-old-password.schema.js';
import { changePasswordSchema } from '../schemas/change-password.schema.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function authRoutes(
    fastify: FastifyInstance,
    controller: AuthController
): Promise<void> {
    fastify.post('/register', {
        schema: registerSchema,
        handler: controller.register,
    });

    fastify.post('/verify-otp', {
        schema: verifyOTPSchema,
        handler: controller.verifyOTP,
    });

    fastify.post('/resend-otp', {
        schema: resendOTPSchema,
        handler: controller.resendOTP,
    });

    fastify.post('/login', {
        schema: loginSchema,
        handler: controller.login,
    });

    fastify.post('/refresh', {
        handler: controller.refresh,
    });

    fastify.post('/logout', {
        handler: controller.logout,
    });

    fastify.post('/verify-old-password', {
        schema: verifyOldPasswordSchema,
        preHandler: requireAuth,
        handler: controller.verifyOldPassword,
    });

    fastify.post('/change-password', {
        schema: changePasswordSchema,
        preHandler: requireAuth,
        handler: controller.changePassword,
    });

    fastify.post('/forgot-password', {
        schema: forgotPasswordSchema,
        handler: controller.forgotPassword,
    });

    fastify.post('/verify-password-reset-otp', {
        schema: verifyPasswordResetOTPSchema,
        handler: controller.verifyPasswordResetOTP,
    });

    fastify.post('/reset-password', {
        schema: resetPasswordSchema,
        handler: controller.resetPassword,
    });

    fastify.log.info('Auth routes registered');
}
