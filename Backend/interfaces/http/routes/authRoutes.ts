import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { registerSchema } from '../schemas/registerSchema.js';
import { verifyOTPSchema } from '../schemas/verifyOTPSchema.js';
import { resendOTPSchema } from '../schemas/resendOTPSchema.js';
import { loginSchema } from '../schemas/loginSchema.js';
import { forgotPasswordSchema } from '../schemas/forgotPasswordSchema.js';
import { resetPasswordSchema } from '../schemas/resetPasswordSchema.js';
import { verifyPasswordResetOTPSchema } from '../schemas/verifyPasswordResetOTPSchema.js';

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

    console.log('✅ Auth routes registered');
}
