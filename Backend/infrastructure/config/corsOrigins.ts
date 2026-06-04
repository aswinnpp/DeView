import type { FastifyBaseLogger } from "fastify";
import { env } from "./env.js";

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/**
 * Origins allowed for credentialed CORS / Socket.IO. HTTPS only; HTTP localhost is excluded.
 * Built from `CORS_ALLOWED_ORIGINS` (comma-separated) + `FRONTEND_URL` (when HTTPS).
 */
export function getHttpsCorsOriginSet(log?: Pick<FastifyBaseLogger, "warn">): Set<string> {
  const set = new Set<string>();

  // Parse comma-separated CORS_ALLOWED_ORIGINS from env
  const origins = env.CORS_ALLOWED_ORIGINS
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  for (const o of origins) {
    set.add(normalizeOrigin(o));
  }

  const fe = env.FRONTEND_URL ? normalizeOrigin(env.FRONTEND_URL) : "";
  if (fe.length > 0) {
    if (fe.toLowerCase().startsWith("https://")) {
      set.add(fe);
    } else {
      log?.warn({ origin: fe }, "FRONTEND_URL is not HTTPS — omitted from CORS (production HTTPS only)");
    }
  }
  return set;
}

export function isAllowedBrowserOrigin(origin: string | undefined, allowed: Set<string>): boolean {
  if (origin === undefined || origin.length === 0) {
    return true;
  }
  const normalized = normalizeOrigin(origin);
  return allowed.has(origin) || allowed.has(normalized);
}

/** CSP `frame-src` / `frame-ancestors`: `'self'` plus every allowed HTTPS frontend. */
export function getHelmetFrameParticipantSources(): string[] {
  const origins = getHttpsCorsOriginSet();
  return ["'self'", ...Array.from(origins)];
}
