import { FastifyRequest, FastifyReply } from "fastify";


const isProduction = process.env.NODE_ENV === "production";

const COOKIE_BASE = {
  httpOnly: true,            // JS on the browser CANNOT read these cookies (security)
  secure: isProduction,      // true in production (HTTPS only), false in dev (localhost)
  sameSite: "lax" as const,
  path: "/",                 // cookie is sent on ALL routes
};

// ─── Read a cookie ────────────────────────────────────────────────
// @fastify/cookie plugin gives us `request.cookies` — no regex needed!
export function getCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name];
}

// ─── Set Access Token Cookie ──────────────────────────────────────
// Access token lives for 15 minutes (900 seconds)
export function setAccessTokenCookie(reply: FastifyReply, token: string) {
  reply.setCookie("accessToken", token, {
    ...COOKIE_BASE,
    maxAge: 900,  // 15 minutes in seconds
  });
}

// ─── Set Refresh Token Cookie ─────────────────────────────────────
// Refresh token lives for 7 days (604800 seconds)
export function setRefreshTokenCookie(reply: FastifyReply, token: string) {
  reply.setCookie("refreshToken", token, {
    ...COOKIE_BASE,
    maxAge: 604800,  // 7 days in seconds
  });
}

// ─── Clear a cookie ───────────────────────────────────────────────
// To delete a cookie, set it with an empty value and maxAge=0
export function clearCookie(reply: FastifyReply, name: string) {
  reply.clearCookie(name, {
    ...COOKIE_BASE,
  });
}
