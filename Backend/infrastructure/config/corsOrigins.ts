import type { FastifyBaseLogger } from "fastify";
import { env } from "./env.js";

/** Fixed production frontends (HTTPS only). */
const STATIC_HTTPS_ORIGINS = ["https://deview.serveftp.com", "https://ndeview.dds.net" ,"https://35.153.76.13:3000"] as const;

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/**
 * Origins allowed for credentialed CORS / Socket.IO. HTTPS only; HTTP localhost is excluded.
 * `FRONTEND_URL` is included when it is an `https://` URL.
 */
export function getHttpsCorsOriginSet(log?: Pick<FastifyBaseLogger, "warn">): Set<string> {
  const set = new Set<string>();
  for (const o of STATIC_HTTPS_ORIGINS) {
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
