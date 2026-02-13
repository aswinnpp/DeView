export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }

  static notFound(message: string) {
    return new AppError(message, 404);
  }

  static internal(message = "Internal server error") {
    return new AppError(message, 500);
  }
}
