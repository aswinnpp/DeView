import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../../infrastructure/config/env.js";

/** Same-origin SPA (`/api` proxy): Lax + Secure + httpOnly. */
const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
} as const;

// ─── Cookie Name Constants ───
export const USER_COOKIE = {
  ACCESS: 'userAccessToken',
  REFRESH: 'userRefreshToken',
} as const;

export const ADMIN_COOKIE = {
  ACCESS: 'adminAccessToken',
  REFRESH: 'adminRefreshToken',
} as const;

// ─── Generic Helpers ───
export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

export function clearCookie(_request: FastifyRequest, reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...authCookieOptions,
  });
}

// ─── User Cookie Helpers ───
export function setUserAccessTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie(USER_COOKIE.ACCESS, token, {
    ...authCookieOptions,
    maxAge: env.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function setUserRefreshTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie(USER_COOKIE.REFRESH, token, {
    ...authCookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS,
  });
}

// ─── Admin Cookie Helpers ───
export function setAdminAccessTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie(ADMIN_COOKIE.ACCESS, token, {
    ...authCookieOptions,
    maxAge: env.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function setAdminRefreshTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie(ADMIN_COOKIE.REFRESH, token, {
    ...authCookieOptions,
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS,
  });
}
