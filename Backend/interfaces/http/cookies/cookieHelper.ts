import { FastifyRequest, FastifyReply } from "fastify";

function isHttpsRequest(request: FastifyRequest): boolean {
  const xfProto = request.headers["x-forwarded-proto"];
  const proto = (Array.isArray(xfProto) ? xfProto[0] : xfProto) ?? (request.protocol as string | undefined);
  return proto === "https";
}


function cookieBase(request: FastifyRequest) {
  const https = isHttpsRequest(request);
  return {
    httpOnly: true,
    sameSite: (https ? "none" : "lax") as "lax" | "none",
    secure: https,
    path: "/",
  };
}


export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

export function setAccessTokenCookie(request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("accessToken", token, {
    ...cookieBase(request),
    maxAge: 900,  
  });
}


export function setRefreshTokenCookie(request: FastifyRequest, reply: FastifyReply, token: string) {
  reply.setCookie("refreshToken", token, {
    ...cookieBase(request),
    maxAge: 604800,  
  });
}


export function clearCookie(request: FastifyRequest, reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...cookieBase(request),
  });
}
