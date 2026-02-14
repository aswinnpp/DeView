import { FastifyRequest, FastifyReply } from "fastify";

import { RegisterUserUseCase } from "../../../application/auth/use-cases/RegisterUserUseCase";
import { VerifyOTPUseCase } from "../../../application/auth/use-cases/VerifyOTPUseCase";
import { LoginUseCase } from "../../../application/auth/use-cases/LoginUseCase";
import { ResendOTPUseCase } from "../../../application/auth/use-cases/ResendOTPUseCase";
import { RefreshTokenUseCase } from "../../../application/auth/use-cases/RefreshTokenUseCase";
import { ForgotPasswordUseCase } from "../../../application/auth/use-cases/ForgotPasswordUseCase";
import { VerifyPasswordResetOTPUseCase } from "../../../application/auth/use-cases/VerifyPasswordResetOTPUseCase";
import { ResetPasswordUseCase } from "../../../application/auth/use-cases/ResetPasswordUseCase";
import { SecureJwtTokenService } from "../../../infrastructure/security/SecureJwtTokenService";

import {
  getCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearCookie,
} from "../cookies/cookieHelper";

import type { RegisterUserRequestDTO } from "../../../application/auth/dtos/RegisterUserRequestDTO";
import type { LoginRequestDTO } from "../../../application/auth/dtos/LoginRequestDTO";
import type { ResetPasswordRequest } from "../../../../Shared/contracts/auth/resetPassword";

interface VerifyOTPBody {
  email: string;
  otp: string;
}

interface EmailBody {
  email: string;
}

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

  // ---------------- REGISTER ----------------

  register = async (
    request: FastifyRequest<{ Body: RegisterUserRequestDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.code(201).send(result);
  };

  // ---------------- VERIFY OTP ----------------

  verifyOTP = async (
    request: FastifyRequest<{ Body: VerifyOTPBody }>,
    reply: FastifyReply
  ) => {
    await this.verifyOTPUseCase.execute(
      request.body.email,
      request.body.otp
    );

    reply.send({ success: true });
  };

  resendOTP = async (
    request: FastifyRequest<{ Body: EmailBody }>,
    reply: FastifyReply
  ) => {
    const result = await this.resendOTPUseCase.execute(request.body);
    reply.send(result);
  };

  // ---------------- LOGIN ----------------

  login = async (
    request: FastifyRequest<{ Body: LoginRequestDTO }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body;

    const result = await this.loginUseCase.execute(email, password);

    setAccessTokenCookie(reply, result.accessToken);
    setRefreshTokenCookie(reply, result.refreshToken);

    reply.send({ user: result.user });
  };

  // ---------------- REFRESH ----------------

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, "refreshToken");

    if (!refreshToken) {
      reply.code(401).send({ error: "No refresh token" });
      return;
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    setAccessTokenCookie(reply, result.accessToken);
    setRefreshTokenCookie(reply, result.newRefreshToken);

    reply.send({ success: true });
  };

  // ---------------- LOGOUT ----------------

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, "refreshToken");
    const accessToken = getCookie(request, "accessToken");

    if (refreshToken) await this.tokenService.revokeRefreshToken(refreshToken);
    if (accessToken) await this.tokenService.revokeAccessToken(accessToken);

    clearCookie(reply, "accessToken");
    clearCookie(reply, "refreshToken");

    reply.send({ success: true });
  };

  // ---------------- PASSWORD RESET ----------------

  forgotPassword = async (
    request: FastifyRequest<{ Body: EmailBody }>,
    reply: FastifyReply
  ) => {
    await this.forgotPasswordUseCase.execute(request.body.email);
    reply.send({ success: true });
  };

  verifyPasswordResetOTP = async (
    request: FastifyRequest<{ Body: VerifyOTPBody }>,
    reply: FastifyReply
  ) => {
    await this.verifyPasswordResetOTPUseCase.execute(
      request.body.email,
      request.body.otp
    );

    reply.send({ success: true });
  };

  resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordRequest }>,
    reply: FastifyReply
  ) => {
    const { email, otp, newPassword } = request.body;

    await this.resetPasswordUseCase.execute(email, otp, newPassword);

    reply.send({ success: true });
  };
}
