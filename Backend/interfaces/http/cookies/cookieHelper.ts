import { FastifyRequest, FastifyReply } from "fastify";

const httpsCookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  path: "/",
} as const;


function cookieBase() {
  return httpsCookieOptions 
}

export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

export function setAccessTokenCookie(request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("accessToken", token, {
    ...cookieBase(),
    maxAge: 900,
  });
}

export function setRefreshTokenCookie(request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("refreshToken", token, {
    ...cookieBase(),
    maxAge: 604800,
  });
}

export function clearCookie(request: FastifyRequest, reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...cookieBase(),
  });
}
