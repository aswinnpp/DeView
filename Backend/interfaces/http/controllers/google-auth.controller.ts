import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGoogleOAuthUseCase } from "../../../application/auth/ports/usecase/IGoogleOAuthUseCase";
import type { IGoogleAuth } from "../../../application/auth/ports/services/IGoogleAuth";
import { env } from "../../../infrastructure/config/env.js";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../cookies/cookieHelper";

@injectable()
export class GoogleAuthController {
  constructor(
    @inject(TYPES.GoogleOAuthUseCasePort) private readonly _googleOAuthUseCase: IGoogleOAuthUseCase,
    @inject(TYPES.GoogleAuthPort) private readonly _googleAuthService: IGoogleAuth
  ) {}

  initiateAuth = async (
    request: FastifyRequest<{ Querystring: { role?: string; mode?: string } }>,
    reply: FastifyReply
  ) => {
    const { role, mode } = request.query ?? {};
    const authUrl = this._googleAuthService.getAuthUrl(role, mode);
    reply.redirect(authUrl);
  };

  handleCallback = async (
    request: FastifyRequest<{ Querystring: { code?: string; state?: string } }>,
    reply: FastifyReply
  ) => {
    const frontendUrl = env.FRONTEND_URL;
    const { code, state } = request.query;

    const sessionId = await this._googleOAuthUseCase.handleCallback(code, state);
    return reply.redirect(`${frontendUrl}/auth/callback?sessionId=${sessionId}`);
  };

  exchangeToken = async (
    request: FastifyRequest<{ Querystring: { sessionId: string } }>,
    reply: FastifyReply
  ) => {
    const result = await this._googleOAuthUseCase.exchange(
      request.query.sessionId
    );

    setAccessTokenCookie(request, reply, result.accessToken);
    setRefreshTokenCookie(request, reply, result.refreshToken);

    reply.send(
      success({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
    );
  };
}
