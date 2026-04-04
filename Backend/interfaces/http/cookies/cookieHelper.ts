import { FastifyRequest, FastifyReply } from "fastify";


function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "none" as const,
    secure: true,
    path: "/",
  };
}

/**
 * Get cookie
 */
export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

/**
 * Set Access Token (short-lived)
 */
export function setAccessTokenCookie(
  reply: FastifyReply,
  token: string
) {
  reply.setCookie("accessToken", token, {
    ...cookieBase(),

    maxAge: 60 * 15, // 15 minutes
  });
}


export function setRefreshTokenCookie(
  reply: FastifyReply,
  token: string
) {
  reply.setCookie("refreshToken", token, {
    ...cookieBase(),

    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}


export function clearCookie(
  reply: FastifyReply,
  name: string
) {
  reply.clearCookie(name, {
    ...cookieBase(),
  });
}