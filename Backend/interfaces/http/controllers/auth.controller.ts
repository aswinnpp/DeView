import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { AppError } from "../../../shared/errors/AppError";

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
import type { IVerifyOldPasswordUseCase } from "../../../application/auth/ports/usecase/IVerifyOldPasswordUseCase";
import type { IChangePasswordUseCase } from "../../../application/auth/ports/usecase/IChangePasswordUseCase";

import {
  getCookie,
  setUserAccessTokenCookie,
  setUserRefreshTokenCookie,
  clearCookie,
  USER_COOKIE,
} from "../cookies/cookieHelper";

import type { IRegisterUserInputDTO } from "../../../application/auth/dtos/RegisterDTO.js";
import type { ILoginInputDTO } from "../../../application/auth/dtos/LoginDTO.js";
import type { IVerifyOtpInputDTO } from "../../../application/auth/dtos/VerifyOtpDTO.js";
import type { IResendOtpInputDTO } from "../../../application/auth/dtos/ResendOtpDTO.js";
import type { ResetPasswordRequest } from "../../../../Shared/contracts/auth/resetPassword";
import type { VerifyOldPasswordRequest } from "../../../../Shared/contracts/auth/changePassword";
import type { ChangePasswordRequest } from "../../../../Shared/contracts/auth/changePassword";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCasePort) private readonly _registerUserUseCase: IRegisterUserUseCase,
    @inject(TYPES.VerifyOTPUseCasePort) private readonly _verifyOTPUseCase: IVerifyOtpUseCase,
    @inject(TYPES.LoginUseCasePort) private readonly _loginUseCase: ILoginUseCase,
    @inject(TYPES.ResendOTPUseCasePort) private readonly _resendOTPUseCase: IResendOtpUseCase,
    @inject(TYPES.RefreshTokenUseCasePort) private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
    @inject(TYPES.LogoutUseCasePort) private readonly _logoutUseCase: ILogoutUseCase,
    @inject(TYPES.ForgotPasswordUseCasePort) private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject(TYPES.VerifyPasswordResetOTPUseCasePort) private readonly _verifyPasswordResetOTPUseCase: IVerifyPasswordResetOtpUseCase,
    @inject(TYPES.ResetPasswordUseCasePort) private readonly _resetPasswordUseCase: IResetPasswordUseCase,
    @inject(TYPES.VerifyOldPasswordUseCasePort) private readonly _verifyOldPasswordUseCase: IVerifyOldPasswordUseCase,
    @inject(TYPES.ChangePasswordUseCasePort) private readonly _changePasswordUseCase: IChangePasswordUseCase
  ) {}

  // ---------------- REGISTER ----------------

  register = async (
    request: FastifyRequest<{ Body: IRegisterUserInputDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this._registerUserUseCase.execute(request.body);
    reply.code(HttpStatus.CREATED).send(success(result));
  };

  // ---------------- VERIFY OTP ----------------

  verifyOTP = async (
    request: FastifyRequest<{ Body: IVerifyOtpInputDTO }>,
    reply: FastifyReply
  ) => {
    await this._verifyOTPUseCase.execute(request.body);

    reply.send(success({ success: true }));
  };

  resendOTP = async (
    request: FastifyRequest<{ Body: IResendOtpInputDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this._resendOTPUseCase.execute(request.body);
    reply.send(success(result));
  };

  // ---------------- LOGIN ----------------

  login = async (
    request: FastifyRequest<{ Body: ILoginInputDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this._loginUseCase.execute(request.body);

    if (result.user.role === 'admin') {
      throw AppError.forbidden('Administrators must use /admin/login');
    }

    setUserAccessTokenCookie(request, reply, result.accessToken);
    setUserRefreshTokenCookie(request, reply, result.refreshToken);

    reply.send(success({ user: result.user }));
  };

  // ---------------- REFRESH ----------------

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, USER_COOKIE.REFRESH);
    const result = await this._refreshTokenUseCase.execute(refreshToken,"user");

    setUserAccessTokenCookie(request, reply, result.accessToken);
    setUserRefreshTokenCookie(request, reply, result.newRefreshToken);

    reply.send(success({ success: true }));
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, USER_COOKIE.REFRESH);
    const accessToken = getCookie(request, USER_COOKIE.ACCESS);

    const result = await this._logoutUseCase.execute(refreshToken, accessToken);

    clearCookie(request, reply, USER_COOKIE.ACCESS);
    clearCookie(request, reply, USER_COOKIE.REFRESH);

    reply.send(success(result));
  };

  // ---------------- CHANGE PASSWORD ----------------
  verifyOldPassword = async (
    request: FastifyRequest<{ Body: VerifyOldPasswordRequest }>,
    reply: FastifyReply
  ) => {
    await this._verifyOldPasswordUseCase.execute(
      request.currentUser.userId,
      request.body.oldPassword
    );

    reply.send(success({ success: true }));
  };

  changePassword = async (
    request: FastifyRequest<{ Body: ChangePasswordRequest }>,
    reply: FastifyReply
  ) => {
    await this._changePasswordUseCase.execute(
      request.currentUser.userId,
      request.body.oldPassword,
      request.body.newPassword
    );

    reply.send(success({ success: true }));
  };

  // ---------------- PASSWORD RESET ----------------

  forgotPassword = async (
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply
  ) => {
    await this._forgotPasswordUseCase.execute(request.body.email);
    reply.send(success({ success: true }));
  };

  verifyPasswordResetOTP = async (
    request: FastifyRequest<{ Body: IVerifyOtpInputDTO }>,
    reply: FastifyReply
  ) => {
    await this._verifyPasswordResetOTPUseCase.execute(
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

    await this._resetPasswordUseCase.execute(email, otp, newPassword);

    reply.send(success({ success: true }));
  };
}
