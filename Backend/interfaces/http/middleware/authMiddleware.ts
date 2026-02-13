import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../../shared/errors/AppError";
import { getCookie } from "../cookies/cookieHelper";
import { redisClient } from "../../../infrastructure/cache/RedisClient";

// ─── Type: what a logged-in user looks like ──────────────────────
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

// Extend Fastify's request type so we can use `request.currentUser`
declare module "fastify" {
  interface FastifyRequest {
    currentUser: AuthenticatedUser;
  }
}

// ─── Helper: extract token from cookie, verify, and check Redis ──
// This is the SINGLE source of truth for authentication.
// Used by both requireAuth and requireRoles.
//
// Step 1: Read the accessToken cookie
// Step 2: If found, put it in the Authorization header
//         (because @fastify/jwt reads from that header)
// Step 3: Call jwtVerify() to decode and verify the token
// Step 4: Check Redis to make sure the token isn't revoked
// Step 5: Attach the user info to request.currentUser
async function attachUser(request: FastifyRequest) {
  // Step 1: Check if there's an accessToken in cookies
  const token = getCookie(request, "accessToken");

  // Step 2: If cookie has the token, set it as Authorization header.
  //         @fastify/jwt only looks at Authorization header by default,
  //         so we need to put the cookie value there.
  if (token && !request.headers.authorization) {
    request.headers.authorization = `Bearer ${token}`;
  }

  // If still no token anywhere, fail early
  if (!request.headers.authorization) {
    throw AppError.unauthorized("Authentication required - please login");
  }

  // Step 3: Verify the JWT (this checks the signature + expiry)
  await request.jwtVerify();

  const user = request.user as any;

  if (!user) {
    throw AppError.unauthorized("Authentication required");
  }

  // Step 4: Check Redis — if the token's jti was deleted, it was revoked
  //         (e.g., user logged out, or token was manually revoked)
  const jti = user.jti;
  if (jti) {
    const exists = await redisClient.exists(`access:${jti}`);
    if (!exists) {
      throw AppError.unauthorized("Session expired - please login again");
    }
  }

  // Step 5: Attach user data to the request for controllers to use
  request.currentUser = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };

  return user;
}

// ─── Middleware: require any logged-in user ───────────────────────
// Use this on routes that need login but any role is OK
// Example: preHandler: [requireAuth]
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  await attachUser(request);
}

// ─── Middleware: require specific roles ───────────────────────────
// Use this on routes that need a specific role (e.g., admin only)
// Example: preHandler: [requireRoles('admin')]
export function requireRoles(...roles: string[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const user = await attachUser(request);

    if (!roles.includes(user.role)) {
      throw AppError.forbidden("Access denied");
    }
  };
}
