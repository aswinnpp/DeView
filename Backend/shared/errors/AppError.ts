export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = 500,
        public readonly code: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        this.name = 'AppError';
    }

    static badRequest(message: string): AppError {
        return new AppError(message, 400, 'BAD_REQUEST');
    }

    static unauthorized(message: string = 'Unauthorized'): AppError {
        return new AppError(message, 401, 'UNAUTHORIZED');
    }

    static forbidden(message: string = 'Forbidden'): AppError {
        return new AppError(message, 403, 'FORBIDDEN');
    }

    static notFound(message: string = 'Not found'): AppError {
        return new AppError(message, 404, 'NOT_FOUND');
    }

    static conflict(message: string): AppError {
        return new AppError(message, 409, 'CONFLICT');
    }

    static internal(message: string = 'Internal server error'): AppError {
        return new AppError(message, 500, 'INTERNAL_ERROR');
    }
}
