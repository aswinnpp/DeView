import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";
import { AppError } from "../../../shared/errors/AppError";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    currentUser: AuthenticatedUser;
  }
}

// Internal helper (avoid duplication)
function attachUser(request: FastifyRequest) {
  const user = (request as any).user;

  if (!user) {
    throw AppError.unauthorized("Authentication required");
  }

  request.currentUser = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };

  return user;
}

// Require login
export function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  attachUser(request);
  done();
}

// Require specific roles
export function requireRoles(...roles: string[]) {
  return (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    const user = attachUser(request);

    if (!roles.includes(user.role)) {
      throw AppError.forbidden(`Access denied`);
    }

    done();
  };
}
