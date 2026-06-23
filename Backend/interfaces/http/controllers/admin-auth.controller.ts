import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { AppError } from "../../../shared/errors/AppError";

import { TYPES } from "../../../infrastructure/di/types";
import type { ILoginUseCase } from "../../../application/auth/ports/usecase/ILoginUseCase";
import type { ILogoutUseCase } from "../../../application/auth/ports/usecase/ILogoutUseCase";
import type { IRefreshTokenUseCase } from "../../../application/auth/ports/usecase/IRefreshTokenUseCase";

import type { ILoginInputDTO } from "../../../application/auth/dtos/LoginDTO.js";

import {
  getCookie,
  clearCookie,
  setAdminAccessTokenCookie,
  setAdminRefreshTokenCookie,
  ADMIN_COOKIE,
} from "../cookies/cookieHelper";

@injectable()
export class AdminAuthController {
  constructor(
    @inject(TYPES.LoginUseCasePort) private readonly _loginUseCase: ILoginUseCase,
    @inject(TYPES.LogoutUseCasePort) private readonly _logoutUseCase: ILogoutUseCase,
    @inject(TYPES.RefreshTokenUseCasePort) private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
  ) {}

  // ---------------- ADMIN LOGIN ----------------

  login = async (
    request: FastifyRequest<{ Body: ILoginInputDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this._loginUseCase.execute(request.body);

    // Reject non-admin users
    if (result.user.role !== 'admin') {
      throw AppError.forbidden('This login is for administrators only');
    }

    setAdminAccessTokenCookie(request, reply, result.accessToken);
    setAdminRefreshTokenCookie(request, reply, result.refreshToken);

    reply.send(success({ user: result.user }));
  };

  // ---------------- ADMIN REFRESH ----------------

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, ADMIN_COOKIE.REFRESH);
    const result = await this._refreshTokenUseCase.execute(refreshToken);

    setAdminAccessTokenCookie(request, reply, result.accessToken);
    setAdminRefreshTokenCookie(request, reply, result.newRefreshToken);

    reply.send(success({ success: true }));
  };

  // ---------------- ADMIN LOGOUT ----------------

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = getCookie(request, ADMIN_COOKIE.REFRESH);
    const accessToken = getCookie(request, ADMIN_COOKIE.ACCESS);

    const result = await this._logoutUseCase.execute(refreshToken, accessToken);

    clearCookie(request, reply, ADMIN_COOKIE.ACCESS);
    clearCookie(request, reply, ADMIN_COOKIE.REFRESH);

    reply.send(success(result));
  };
}
