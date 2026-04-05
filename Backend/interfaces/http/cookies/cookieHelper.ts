import { FastifyRequest, FastifyReply } from "fastify";

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
    maxAge: 900,
  });
}

export function setRefreshTokenCookie(_request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("refreshToken", token, {
    ...authCookieOptions,
    maxAge: 604800,
  });
}

export function clearCookie(_request: FastifyRequest, reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...authCookieOptions,
  });
}
