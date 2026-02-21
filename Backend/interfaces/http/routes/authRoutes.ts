import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { registerSchema, registerBodyParser } from '../schemas/registerSchema.js';
import { verifyOTPSchema, verifyOTPBodyParser } from '../schemas/verifyOTPSchema.js';
import { resendOTPSchema, resendOTPBodyParser } from '../schemas/resendOTPSchema.js';
import { loginSchema, loginBodyParser } from '../schemas/loginSchema.js';
import { forgotPasswordSchema, forgotPasswordBodyParser } from '../schemas/forgotPasswordSchema.js';
import { resetPasswordSchema, resetPasswordBodyParser } from '../schemas/resetPasswordSchema.js';
import { verifyPasswordResetOTPSchema, verifyPasswordResetOTPBodyParser } from '../schemas/verifyPasswordResetOTPSchema.js';

export async function authRoutes(
    fastify: FastifyInstance,
    controller: AuthController
): Promise<void> {
    fastify.post('/register', {
        schema: registerSchema,
        preHandler: [registerBodyParser],
        handler: controller.register,
    });

    fastify.post('/verify-otp', {
        schema: verifyOTPSchema,
        preHandler: [verifyOTPBodyParser],
        handler: controller.verifyOTP,
    });

    fastify.post('/resend-otp', {
        schema: resendOTPSchema,
        preHandler: [resendOTPBodyParser],
        handler: controller.resendOTP,
    });

    fastify.post('/login', {
        schema: loginSchema,
        preHandler: [loginBodyParser],
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
        preHandler: [forgotPasswordBodyParser],
        handler: controller.forgotPassword,
    });

    fastify.post('/verify-password-reset-otp', {
        schema: verifyPasswordResetOTPSchema,
        preHandler: [verifyPasswordResetOTPBodyParser],
        handler: controller.verifyPasswordResetOTP,
    });

    fastify.post('/reset-password', {
        schema: resetPasswordSchema,
        preHandler: [resetPasswordBodyParser],
        handler: controller.resetPassword,
    });

    console.log(' Auth routes registered');
}
