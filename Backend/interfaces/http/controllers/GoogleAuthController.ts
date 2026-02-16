import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { GoogleOAuthUseCase } from "../../../application/auth/use-cases/GoogleOAuthUseCase";
import { GoogleAuthService } from "../../../infrastructure/auth/GoogleAuthService";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../cookies/cookieHelper";

export class GoogleAuthController {
  constructor(
    private readonly googleOAuthUseCase: GoogleOAuthUseCase,
    private readonly googleAuthService: GoogleAuthService
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
