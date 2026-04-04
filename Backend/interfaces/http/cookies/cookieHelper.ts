import { FastifyRequest, FastifyReply } from "fastify";

/** Cross-site credentialed SPA → API (different domains). SameSite=None requires Secure. */
const crossSiteHttpsCookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  path: "/",
} as const;

/** Local HTTP (e.g. localhost → localhost); None+Secure is invalid / unusable without TLS. */
const localHttpCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  path: "/",
} as const;

/**
 * TLS is often terminated at a reverse proxy; the Node socket may be plain HTTP.
 * Prefer X-Forwarded-Proto (first hop if comma-separated), then Fastify's protocol
 * (correct when trustProxy is enabled).
 */
function isPublicHttps(request: FastifyRequest): boolean {
  const xf = request.headers["x-forwarded-proto"];
  const raw = (Array.isArray(xf) ? xf[0] : xf) ?? "";
  const firstHop = raw.split(",")[0]?.trim().toLowerCase();
  if (firstHop === "https") return true;
  if (firstHop === "http") return false;
  return request.protocol === "https";
}

function cookieBase(request: FastifyRequest) {
  return isPublicHttps(request) ? crossSiteHttpsCookieOptions : localHttpCookieOptions;
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
