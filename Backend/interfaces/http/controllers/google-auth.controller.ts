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
    @inject(TYPES.GoogleOAuthUseCasePort) private readonly googleOAuthUseCase: IGoogleOAuthUseCase,
    @inject(TYPES.GoogleAuthPort) private readonly googleAuthService: IGoogleAuth
  ) {}

  initiateAuth = async (
    _request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const authUrl = this.googleAuthService.getAuthUrl();
    reply.redirect(authUrl);
  };

  handleCallback = async (
    request: FastifyRequest<{ Querystring: { code?: string; state?: string } }>,
    reply: FastifyReply
  ) => {
    const frontendUrl = env.FRONTEND_URL;
    const { code, state } = request.query;

    const sessionId = await this.googleOAuthUseCase.handleCallback(code, state);
    return reply.redirect(`${frontendUrl}/auth/callback?sessionId=${sessionId}`);
  };

  exchangeToken = async (
    request: FastifyRequest<{ Querystring: { sessionId: string } }>,
    reply: FastifyReply
  ) => {
    const result = await this.googleOAuthUseCase.exchange(
      request.query.sessionId
    );

    setAccessTokenCookie(reply, result.accessToken);
    setRefreshTokenCookie(reply, result.refreshToken);

    reply.send(success({ user: result.user }));
  };
}
