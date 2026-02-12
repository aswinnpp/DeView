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
  ) {}

  register = async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.code(201).send(result);
  };

  verifyOTP = async (
    request: FastifyRequest<{ Body: VerifyOTPBody }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = request.body;

    await this.verifyOTPUseCase.execute(email, otp);

    reply.code(200).send({ success: true });
  };

  resendOTP = async (
    request: FastifyRequest<{ Body: ResendOTPBody }>,
    reply: FastifyReply
  ) => {
    const result = await this.resendOTPUseCase.execute(request.body);
    reply.code(200).send(result);
  };

  login = async (
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) => {

    const {email ,password} =request.body
    const result = await this.loginUseCase.execute(email, password);

    this.setAccessTokenCookie(reply, result.accessToken);
    this.setRefreshTokenCookie(reply, result.refreshToken);

    reply.code(200).send({ user: result.user,});
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = this.getCookie(request, 'refreshToken');

   if (!refreshToken) {
  reply.code(401).send({ error: "No refresh token" });
  return;
}

const result = await this.refreshTokenUseCase.execute(refreshToken);


    this.setAccessTokenCookie(reply, result.accessToken);
    this.setRefreshTokenCookie(reply, result.newRefreshToken);

    reply.code(200).send({
      message: 'Token refreshed successfully',
      
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = this.getCookie(request, 'refreshToken');
    const accessToken = this.getCookie(request, 'accessToken');

    if (refreshToken) await this.tokenService.revokeRefreshToken(refreshToken);
    if (accessToken) await this.tokenService.revokeAccessToken(accessToken);

    this.clearCookie(reply, 'accessToken');
    this.clearCookie(reply, 'refreshToken');

    reply.code(200).send({ message: 'Logged out successfully' });
  };

  forgotPassword = async (
    request: FastifyRequest<{ Body: ForgotPasswordBody }>,
    reply: FastifyReply
  ) => {
    await this.forgotPasswordUseCase.execute(request.body.email);
    reply.code(200).send({ message: 'OTP has been sent to your email.' });
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

  // ================= Helpers =================

  private getCookie(request: FastifyRequest, name: string): string | null {
    const cookies = request.headers.cookie || '';
    const match = cookies.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  }

  private setAccessTokenCookie(reply: FastifyReply, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    reply.header(
      'Set-Cookie',
      [
        `accessToken=${token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=900',
        isProduction ? 'Secure' : '',
      ].filter(Boolean).join('; ')
    );
  }

  private setRefreshTokenCookie(reply: FastifyReply, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookie = [
      `refreshToken=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=604800',
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    const existing = reply.getHeader('Set-Cookie');
    reply.header('Set-Cookie', existing ? [existing as string, cookie] : cookie);
  }

  private clearCookie(reply: FastifyReply, name: string): void {
    const cookie = `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
    const existing = reply.getHeader('Set-Cookie');
    reply.header('Set-Cookie', existing ? [existing as string, cookie] : cookie);
  }
}
