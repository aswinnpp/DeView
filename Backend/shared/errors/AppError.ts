import { HttpStatus } from "../http/HttpStatus";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }

  static badRequest(message: string) {
    return new AppError(message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, HttpStatus.FORBIDDEN);
  }

  static conflict(message: string) {
    return new AppError(message, HttpStatus.CONFLICT);
  }

  static notFound(message: string) {
    return new AppError(message, HttpStatus.NOT_FOUND);
  }

  static tooManyRequests(message = "Rate limit exceeded. Please try again later.") {
    return new AppError(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static internal(message = "Internal server error") {
    return new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static serviceUnavailable(message: string) {
    return new AppError(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
