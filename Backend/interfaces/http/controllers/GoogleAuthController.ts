import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { GoogleOAuthUseCasePort } from "../../../application/auth/ports/GoogleOAuthUseCasePort";
import type { GoogleAuthPort } from "../../../application/auth/ports/GoogleAuthPort";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../cookies/cookieHelper";

@injectable()
export class GoogleAuthController {
  constructor(
    @inject(TYPES.GoogleOAuthUseCasePort) private readonly googleOAuthUseCase: GoogleOAuthUseCasePort,
    @inject(TYPES.GoogleAuthPort) private readonly googleAuthService: GoogleAuthPort
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
    const frontendUrl = process.env.FRONTEND_URL ?? "";
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
