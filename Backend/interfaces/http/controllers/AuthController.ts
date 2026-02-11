import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/RegisterUserUseCase.js';
import { VerifyOTPUseCase } from '../../../application/auth/use-cases/VerifyOTPUseCase.js';
import { LoginUseCase } from '../../../application/auth/use-cases/LoginUseCase.js';
import { ResendOTPUseCase } from '../../../application/auth/use-cases/ResendOTPUseCase.js';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/RefreshTokenUseCase.js';
import { ForgotPasswordUseCase } from '../../../application/auth/use-cases/ForgotPasswordUseCase.js';
import { ResetPasswordUseCase } from '../../../application/auth/use-cases/ResetPasswordUseCase.js';
import { VerifyPasswordResetOTPUseCase } from '../../../application/auth/use-cases/VerifyPasswordResetOTPUseCase.js';
import { SecureJwtTokenService } from '../../../infrastructure/security/SecureJwtTokenService.js';
import type { RegisterUserRequestDTO } from '../../../application/auth/dtos/RegisterUserRequestDTO.js';
import type { LoginRequestDTO } from '../../../application/auth/dtos/LoginRequestDTO.js';
import type { ResetPasswordRequest } from '../../../../Shared/contracts/auth/resetPassword.js';

type RegisterBody = RegisterUserRequestDTO;
type LoginBody = LoginRequestDTO;

interface VerifyOTPBody {
  email: string;
  otp: string;
}

interface ResendOTPBody {
  email: string;
}

interface ForgotPasswordBody {
  email: string;
}

type ResetPasswordBody = ResetPasswordRequest;

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly verifyOTPUseCase: VerifyOTPUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly resendOTPUseCase: ResendOTPUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly tokenService: SecureJwtTokenService
  ) { }

  register = async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) => {
    const { fullName, email, password, role, companyName } = request.body;

    const result = await this.registerUserUseCase.execute({
      fullName,
      email,
      password,
      role,
      companyName,
    });

    reply.code(201).send({
      message: result.message,
      email: result.email,
    });
  };

  verifyOTP = async (
    request: FastifyRequest<{ Body: VerifyOTPBody }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = request.body;

    const result = await this.verifyOTPUseCase.execute({ email, otp });

    reply.code(200).send(result);
  };

  resendOTP = async (
    request: FastifyRequest<{ Body: ResendOTPBody }>,
    reply: FastifyReply
  ) => {
    const { email } = request.body;

    const result = await this.resendOTPUseCase.execute({ email });

    reply.code(200).send(result);
  };

  login = async (
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body;

    const result = await this.loginUseCase.execute({ email, password });

    // Set BOTH tokens as HTTP-only cookies
    this.setAccessTokenCookie(reply, result.accessToken);
    this.setRefreshTokenCookie(reply, result.refreshToken);

    // Only send user info (no tokens in response body!)
    reply.code(200).send({
      user: result.user,
    });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = this.getCookie(request, 'refreshToken');

    const result = await this.refreshTokenUseCase.execute({
      refreshToken: refreshToken || '',
    });

    // Set new tokens as cookies
    this.setAccessTokenCookie(reply, result.accessToken);
    this.setRefreshTokenCookie(reply, result.newRefreshToken);

    reply.code(200).send({
      message: 'Token refreshed successfully',
      role: result.role,
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = this.getCookie(request, 'refreshToken');

    // Revoke token in Redis
    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }

    // Clear both cookies
    this.clearCookie(reply, 'accessToken');
    this.clearCookie(reply, 'refreshToken');

    reply.code(200).send({ message: 'Logged out successfully' });
  };

  forgotPassword = async (
    request: FastifyRequest<{ Body: ForgotPasswordBody }>,
    reply: FastifyReply
  ) => {
    const { email } = request.body;

    // Let the error propagate if email doesn't exist
    await this.forgotPasswordUseCase.execute(email);

    reply.code(200).send({
      message: 'OTP has been sent to your email.',
    });
  };

  verifyPasswordResetOTP = async (
    request: FastifyRequest<{ Body: VerifyOTPBody }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = request.body;

    const result = await this.verifyPasswordResetOTPUseCase.execute(email, otp);

    reply.code(200).send(result);
  };

  resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordBody }>,
    reply: FastifyReply
  ) => {
    const { email, otp, newPassword } = request.body;

    await this.resetPasswordUseCase.execute(email, otp, newPassword);

    reply.code(200).send({ message: 'Password reset successfully' });
  };

  // =====================
  // HELPER METHODS
  // =====================

  private getCookie(request: FastifyRequest, name: string): string | null {
    const cookies = request.headers.cookie || '';
    const match = cookies.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  }

  private setAccessTokenCookie(reply: FastifyReply, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const options = [
      `accessToken=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Max-Age=900', // 15 minutes
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
      'Max-Age=604800', // 7 days
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    // Append to existing cookies
    const existingCookie = reply.getHeader('Set-Cookie');
    if (existingCookie) {
      reply.header('Set-Cookie', [existingCookie as string, options]);
    } else {
      reply.header('Set-Cookie', options);
    }
  }

  private clearCookie(reply: FastifyReply, name: string): void {
    const cookie = `${name}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
    const existingCookie = reply.getHeader('Set-Cookie');
    if (existingCookie) {
      reply.header('Set-Cookie', [existingCookie as string, cookie]);
    } else {
      reply.header('Set-Cookie', cookie);
    }
  }
}
