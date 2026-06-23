import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../../shared/errors/AppError";
import { redisClient } from "../../../infrastructure/cache/RedisClient";
import type { IAuthenticatedUser } from "./authMiddleware";

/**
 * Admin-only authentication middleware.
 * Reads the `adminAccessToken` cookie (JWT extraction is configured
 * at the Fastify-JWT plugin level for the Admin server).
 */
export async function requireAdminAuth(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  if (!request.cookies?.adminAccessToken) {
    throw AppError.unauthorized("Admin authentication required - please login");
  }

  await request.jwtVerify();

  const user = request.user as {
    userId: string;
    role: string;
    companyId?: string;
    jti?: string;
  } | undefined;

  if (!user) {
    throw AppError.unauthorized("Authentication required");
  }

  if (user.role !== 'admin') {
    throw AppError.forbidden("Admin access only");
  }

  const jti = user.jti;
  if (!jti) {
    throw AppError.unauthorized("Session expired - please login again");
  }

  const exists = await redisClient.exists(`access:${jti}`);
  if (!exists) {
    throw AppError.unauthorized("Session expired - please login again");
  }

  request.currentUser = {
    userId: user.userId,
    role: user.role,
  };
}
