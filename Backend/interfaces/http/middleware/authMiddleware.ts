import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../../shared/errors/AppError";
import { redisClient } from "../../../infrastructure/cache/RedisClient";

export interface IAuthenticatedUser {
  userId: string;
  role: string;
  companyId?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    currentUser: IAuthenticatedUser;
  }
}


async function attachUser(request: FastifyRequest) {
  if (!request.cookies?.accessToken) {
    throw AppError.unauthorized("Authentication required - please login");
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
    companyId: user.companyId,
  };

  return user;
}


export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  await attachUser(request);
}

  
export function requireRoles(...roles: string[]) {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply
  ) => {
    const user = await attachUser(request);
   
    

    if (!roles.includes(user.role)) {
      throw AppError.forbidden("Access denied");
    }
  };
}
