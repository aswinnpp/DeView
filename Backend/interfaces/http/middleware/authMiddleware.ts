import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { AppError } from '../../../shared/errors/AppError.js';

export interface AuthenticatedUser {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        currentUser: AuthenticatedUser;
    }
}

export function requireAuth(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const user = (request as any).user;

    if (!user) {
        throw AppError.unauthorized('Authentication required');
    }

    request.currentUser = {
        userId: user.userId,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
    };

    done();
}

export function requireRoles(...roles: string[]) {
    return (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        const user = (request as any).user;

        if (!user) {
            throw AppError.unauthorized('Authentication required');
        }

        if (!roles.includes(user.role)) {
            throw AppError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`);
        }

        request.currentUser = {
            userId: user.userId,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
        };

        done();
    };
}
