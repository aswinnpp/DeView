import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";

import { RegisterUserUseCase } from "../../../application/auth/use-cases/RegisterUserUseCase";
import { VerifyOTPUseCase } from "../../../application/auth/use-cases/VerifyOTPUseCase";
import { LoginUseCase } from "../../../application/auth/use-cases/LoginUseCase";
import { ResendOTPUseCase } from "../../../application/auth/use-cases/ResendOTPUseCase";
import { RefreshTokenUseCase } from "../../../application/auth/use-cases/RefreshTokenUseCase";
import { ForgotPasswordUseCase } from "../../../application/auth/use-cases/ForgotPasswordUseCase";
import { VerifyPasswordResetOTPUseCase } from "../../../application/auth/use-cases/VerifyPasswordResetOTPUseCase";
import { ResetPasswordUseCase } from "../../../application/auth/use-cases/ResetPasswordUseCase";
import { LogoutUseCase } from "../../../application/auth/use-cases/LogoutUseCase";

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
    @inject(RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    @inject(VerifyOTPUseCase) private readonly verifyOTPUseCase: VerifyOTPUseCase,
    @inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @inject(ResendOTPUseCase) private readonly resendOTPUseCase: ResendOTPUseCase,
    @inject(RefreshTokenUseCase) private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject(LogoutUseCase) private readonly logoutUseCase: LogoutUseCase,
    @inject(ForgotPasswordUseCase) private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    @inject(VerifyPasswordResetOTPUseCase) private readonly verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCase,
    @inject(ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase
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

    console.log('Login result:', JSON.stringify(result, null, 2));
    console.log('Result user:', result.user);
    console.log('User id:', result.user?.id);

    if (!result.user || !result.user.id) {
      console.error('ERROR: result.user is missing or invalid:', result);
      throw new Error('Failed to retrieve user data after login');
    }

    setAccessTokenCookie(reply, result.accessToken);
    setRefreshTokenCookie(reply, result.refreshToken);

    const responseData = success({ user: result.user });
    console.log('Response data being sent:', JSON.stringify(responseData, null, 2));
    console.log('Response data type:', typeof responseData);
    console.log('Response data keys:', Object.keys(responseData));

    reply.send(responseData);
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
