import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/RegisterUserUseCase.js';
import { VerifyOTPUseCase } from '../../../application/auth/use-cases/VerifyOTPUseCase.js';
import { LoginUseCase } from '../../../application/auth/use-cases/LoginUseCase.js';
import { ResendOTPUseCase } from '../../../application/auth/use-cases/ResendOTPUseCase.js';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../../../application/auth/use-cases/LogoutUseCase.js';
import { ForgotPasswordUseCase } from '../../../application/auth/use-cases/ForgotPasswordUseCase.js';
import { ResetPasswordUseCase } from '../../../application/auth/use-cases/ResetPasswordUseCase.js';
import { VerifyPasswordResetOTPUseCase } from '../../../application/auth/use-cases/VerifyPasswordResetOTPUseCase.js';
import { TokenHasher } from '../../../infrastructure/security/TokenHasher.js';
import {
  RegisterBody,
  VerifyOTPBody,
  LoginBody,
  ResendOTPBody,
  ForgotPasswordBody,
  ResetPasswordBody
} from '../types/requestTypes.js';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly verifyOTPUseCase: VerifyOTPUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly resendOTPUseCase: ResendOTPUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase
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
    const deviceInfo = this.getDeviceInfo(request);

    const result = await this.loginUseCase.execute({ email, password }, deviceInfo);

    this.setRefreshTokenCookie(reply, result.refreshToken);

    reply.code(200).send({
      accessToken: result.accessToken,
      user: result.user,
    });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = this.getRefreshTokenFromCookie(request);
    const tokenHash = refreshToken ? TokenHasher.hash(refreshToken) : '';
    const deviceInfo = this.getDeviceInfo(request);

    const result = await this.refreshTokenUseCase.execute({
      refreshTokenHash: tokenHash,
      deviceInfo,
    });

    this.setRefreshTokenCookie(reply, result.newRefreshToken);

    reply.code(200).send({
      accessToken: result.accessToken,
      role: result.role,
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = this.getRefreshTokenFromCookie(request);

    if (refreshToken) {
      const tokenHash = TokenHasher.hash(refreshToken);
      await this.logoutUseCase.execute({ refreshTokenHash: tokenHash });
    }

    this.clearRefreshTokenCookie(reply);

    reply.code(200).send({ message: 'Logged out successfully' });
  };

  forgotPassword = async (
    request: FastifyRequest<{ Body: ForgotPasswordBody }>,
    reply: FastifyReply
  ) => {
    const { email } = request.body;

    // Always return success to prevent user enumeration
    try {
      await this.forgotPasswordUseCase.execute(email);
    } catch {
      // Intentionally silent
    }

    reply.code(200).send({
      message: 'If an account with that email exists, an OTP has been sent.',
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

  private getDeviceInfo(request: FastifyRequest): string {
    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip || 'unknown';
    return `${userAgent}|${ip}`;
  }

  private getRefreshTokenFromCookie(request: FastifyRequest): string | null {
    const cookies = request.headers.cookie || '';
    const match = cookies.match(/refreshToken=([^;]+)/);
    return match ? match[1] : null;
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

    reply.header('Set-Cookie', options);
  }

  private clearRefreshTokenCookie(reply: FastifyReply): void {
    reply.header('Set-Cookie', 'refreshToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  }
}
