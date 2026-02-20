import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";

import { TYPES } from "../../../infrastructure/di/types";
import type { RegisterUserUseCasePort } from "../../../application/auth/ports/usecase/RegisterUserUseCasePort";
import type { VerifyOTPUseCasePort } from "../../../application/auth/ports/usecase/VerifyOTPUseCasePort";
import type { LoginUseCasePort } from "../../../application/auth/ports/usecase/LoginUseCasePort";
import type { ResendOTPUseCasePort } from "../../../application/auth/ports/usecase/ResendOTPUseCasePort";
import type { RefreshTokenUseCasePort } from "../../../application/auth/ports/usecase/RefreshTokenUseCasePort";
import type { LogoutUseCasePort } from "../../../application/auth/ports/usecase/LogoutUseCasePort";
import type { ForgotPasswordUseCasePort } from "../../../application/auth/ports/usecase/ForgotPasswordUseCasePort";
import type { VerifyPasswordResetOTPUseCasePort } from "../../../application/auth/ports/usecase/VerifyPasswordResetOTPUseCasePort";
import type { ResetPasswordUseCasePort } from "../../../application/auth/ports/usecase/ResetPasswordUseCasePort";

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

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCasePort) private readonly registerUserUseCase: RegisterUserUseCasePort,
    @inject(TYPES.VerifyOTPUseCasePort) private readonly verifyOTPUseCase: VerifyOTPUseCasePort,
    @inject(TYPES.LoginUseCasePort) private readonly loginUseCase: LoginUseCasePort,
    @inject(TYPES.ResendOTPUseCasePort) private readonly resendOTPUseCase: ResendOTPUseCasePort,
    @inject(TYPES.RefreshTokenUseCasePort) private readonly refreshTokenUseCase: RefreshTokenUseCasePort,
    @inject(TYPES.LogoutUseCasePort) private readonly logoutUseCase: LogoutUseCasePort,
    @inject(TYPES.ForgotPasswordUseCasePort) private readonly forgotPasswordUseCase: ForgotPasswordUseCasePort,
    @inject(TYPES.VerifyPasswordResetOTPUseCasePort) private readonly verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCasePort,
    @inject(TYPES.ResetPasswordUseCasePort) private readonly resetPasswordUseCase: ResetPasswordUseCasePort
  ) {}

  // ---------------- REGISTER ----------------

  register = async (
    request: FastifyRequest<{ Body: RegisterUserRequestDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.code(HttpStatus.CREATED).send(success(result));
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

    reply.send(success({ success: true }));
  };

  resendOTP = async (
    request: FastifyRequest<{ Body: EmailBody }>,
    reply: FastifyReply
  ) => {
    const result = await this.resendOTPUseCase.execute(request.body);
    reply.send(success(result));
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

    reply.send(success({ user: result.user }));
  };

  // ---------------- REFRESH ----------------

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, "refreshToken");
    const result = await this.refreshTokenUseCase.execute(refreshToken);

    setAccessTokenCookie(reply, result.accessToken);
    setRefreshTokenCookie(reply, result.newRefreshToken);

    reply.send(success({ success: true }));
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, "refreshToken");
    const accessToken = getCookie(request, "accessToken");

    const result = await this.logoutUseCase.execute(refreshToken, accessToken);

    clearCookie(reply, "accessToken");
    clearCookie(reply, "refreshToken");

    reply.send(success(result));
  };

  // ---------------- PASSWORD RESET ----------------

  forgotPassword = async (
    request: FastifyRequest<{ Body: EmailBody }>,
    reply: FastifyReply
  ) => {
    await this.forgotPasswordUseCase.execute(request.body.email);
    reply.send(success({ success: true }));
  };

  verifyPasswordResetOTP = async (
    request: FastifyRequest<{ Body: VerifyOTPBody }>,
    reply: FastifyReply
  ) => {
    await this.verifyPasswordResetOTPUseCase.execute(
      request.body.email,
      request.body.otp
    );

    reply.send(success({ success: true }));
  };

  resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordRequest }>,
    reply: FastifyReply
  ) => {
    const { email, otp, newPassword } = request.body;

    await this.resetPasswordUseCase.execute(email, otp, newPassword);

    reply.send(success({ success: true }));
  };
}
