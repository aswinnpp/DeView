import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";

import { TYPES } from "../../../infrastructure/di/types";
import type { IRegisterUserUseCase } from "../../../application/auth/ports/usecase/IRegisterUserUseCase";
import type { IVerifyOtpUseCase } from "../../../application/auth/ports/usecase/IVerifyOtpUseCase";
import type { ILoginUseCase } from "../../../application/auth/ports/usecase/ILoginUseCase";
import type { IResendOtpUseCase } from "../../../application/auth/ports/usecase/IResendOtpUseCase";
import type { IRefreshTokenUseCase } from "../../../application/auth/ports/usecase/IRefreshTokenUseCase";
import type { ILogoutUseCase } from "../../../application/auth/ports/usecase/ILogoutUseCase";
import type { IForgotPasswordUseCase } from "../../../application/auth/ports/usecase/IForgotPasswordUseCase";
import type { IVerifyPasswordResetOtpUseCase } from "../../../application/auth/ports/usecase/IVerifyPasswordResetOtpUseCase";
import type { IResetPasswordUseCase } from "../../../application/auth/ports/usecase/IResetPasswordUseCase";

import {
  getCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearCookie,
} from "../cookies/cookieHelper";

import type { IRegisterUserRequestDTO } from "../../../application/auth/dtos/RegisterUserRequestDTO";
import type { ILoginRequestDTO } from "../../../application/auth/dtos/LoginRequestDTO";
import type { ResetPasswordRequest } from "../../../../Shared/contracts/auth/resetPassword";

interface IVerifyOtpBody {
  email: string;
  otp: string;
}

interface IEmailBody {
  email: string;
}

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCasePort) private readonly registerUserUseCase: IRegisterUserUseCase,
    @inject(TYPES.VerifyOTPUseCasePort) private readonly verifyOTPUseCase: IVerifyOtpUseCase,
    @inject(TYPES.LoginUseCasePort) private readonly loginUseCase: ILoginUseCase,
    @inject(TYPES.ResendOTPUseCasePort) private readonly resendOTPUseCase: IResendOtpUseCase,
    @inject(TYPES.RefreshTokenUseCasePort) private readonly refreshTokenUseCase: IRefreshTokenUseCase,
    @inject(TYPES.LogoutUseCasePort) private readonly logoutUseCase: ILogoutUseCase,
    @inject(TYPES.ForgotPasswordUseCasePort) private readonly forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject(TYPES.VerifyPasswordResetOTPUseCasePort) private readonly verifyPasswordResetOTPUseCase: IVerifyPasswordResetOtpUseCase,
    @inject(TYPES.ResetPasswordUseCasePort) private readonly resetPasswordUseCase: IResetPasswordUseCase
  ) {}

  // ---------------- REGISTER ----------------

  register = async (
    request: FastifyRequest<{ Body: IRegisterUserRequestDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.registerUserUseCase.execute(request.body);
    reply.code(HttpStatus.CREATED).send(success(result));
  };

  // ---------------- VERIFY OTP ----------------

  verifyOTP = async (
    request: FastifyRequest<{ Body: IVerifyOtpBody }>,
    reply: FastifyReply
  ) => {
    await this.verifyOTPUseCase.execute(
      request.body.email,
      request.body.otp
    );

    reply.send(success({ success: true }));
  };

  resendOTP = async (
    request: FastifyRequest<{ Body: IEmailBody }>,
    reply: FastifyReply
  ) => {
    const result = await this.resendOTPUseCase.execute(request.body);
    reply.send(success(result));
  };

  // ---------------- LOGIN ----------------

  login = async (
    request: FastifyRequest<{ Body: ILoginRequestDTO }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body;
    const result = await this.loginUseCase.execute(email, password);

    setAccessTokenCookie(request, reply, result.accessToken);
    setRefreshTokenCookie(request, reply, result.refreshToken);

    reply.send(success({ user: result.user }));
  };

  // ---------------- REFRESH ----------------

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, "refreshToken");
    const result = await this.refreshTokenUseCase.execute(refreshToken);

    setAccessTokenCookie(request, reply, result.accessToken);
    setRefreshTokenCookie(request, reply, result.newRefreshToken);

    reply.send(success({ success: true }));
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, "refreshToken");
    const accessToken = getCookie(request, "accessToken");

    const result = await this.logoutUseCase.execute(refreshToken, accessToken);

    clearCookie(request, reply, "accessToken");
    clearCookie(request, reply, "refreshToken");

    reply.send(success(result));
  };

  // ---------------- PASSWORD RESET ----------------

  forgotPassword = async (
    request: FastifyRequest<{ Body: IEmailBody }>,
    reply: FastifyReply
  ) => {
    await this.forgotPasswordUseCase.execute(request.body.email);
    reply.send(success({ success: true }));
  };

  verifyPasswordResetOTP = async (
    request: FastifyRequest<{ Body: IVerifyOtpBody }>,
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
