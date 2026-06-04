import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../../infrastructure/config/env.js";

/** Same-origin SPA (`/api` proxy): Lax + Secure + httpOnly. */
const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
} as const;

export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

export function setAccessTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("accessToken", token, {
    ...authCookieOptions,
    maxAge: env.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function setRefreshTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("refreshToken", token, {
    ...authCookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearCookie(_request: FastifyRequest, reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...authCookieOptions,
  });
}
