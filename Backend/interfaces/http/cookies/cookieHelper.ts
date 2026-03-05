import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../../infrastructure/config/env.js";


const isProduction = env.NODE_ENV === "production";

function getRequestHost(request: FastifyRequest): string {
  const xfHost = request.headers["x-forwarded-host"];
  const hostHeader = (Array.isArray(xfHost) ? xfHost[0] : xfHost) ?? request.headers.host ?? "";
  return String(hostHeader).split(":")[0];
}

function isHttpsRequest(request: FastifyRequest): boolean {
  const xfProto = request.headers["x-forwarded-proto"];
  const proto = (Array.isArray(xfProto) ? xfProto[0] : xfProto) ?? (request.protocol as string | undefined);
  return proto === "https";
}

function isCrossSite(request: FastifyRequest): boolean {
  const origin = request.headers.origin;
  if (typeof origin !== "string" || origin.length === 0 || origin === "null") return false;

  try {
    const originUrl = new URL(origin);
    const reqHost = getRequestHost(request);
    return originUrl.hostname !== reqHost || originUrl.protocol !== (isHttpsRequest(request) ? "https:" : "http:");
  } catch {
    return false;
  }
}

function cookieBase(request: FastifyRequest) {
  const crossSite = isCrossSite(request);
  const sameSite: "lax" | "none" = crossSite ? "none" : "lax";
  return {
    httpOnly: true,
    // For cross-site requests (e.g. frontend on localhost, API on ngrok),
    // browsers require SameSite=None + Secure for cookies to be sent.
    sameSite,
    secure: crossSite ? true : isProduction,
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
