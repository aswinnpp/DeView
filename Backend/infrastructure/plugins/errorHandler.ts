import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../../shared/errors/AppError";
import { DomainError } from "../../shared/errors/DomainError";
import { HttpStatus } from "../../shared/http/HttpStatus";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const rateLimitStatus = (error as { statusCode?: number }).statusCode;
    if (rateLimitStatus === HttpStatus.TOO_MANY_REQUESTS) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Too many requests. Please try again later.';
      return reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
        success: false,
        message,
      });
    }

    if (error instanceof AppError) {
      request.log.error(
        { err: error, statusCode: error.statusCode, url: request.url },
        'AppError handled',
      );
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message
      });
    }

    if (error instanceof DomainError) {
      request.log.error(
        { err: error, url: request.url },
        'DomainError handled',
      );
      return reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof ZodError) {
      const first = error.issues[0];
      const message = first?.message ?? "Validation error";
      const errors = error.issues.map((i) => ({
        message: i.message,
        path: i.path.join("."),
      }));
      return reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message,
        errors,
      });
    }

    const apiErr = error as { name?: string; status?: number; message?: string };
    if (apiErr?.name === 'ApiError') {
      if (apiErr.status === 429) {
        return reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          message:
            'AI scoring quota exceeded. Please try again in a few minutes or check your Gemini API quota.',
        });
      }

      if (apiErr.status === 404) {
        return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          success: false,
          message:
            'AI scoring service model not found or not available. Please verify GOOGLE_AI_MODEL_ID and your Gemini model configuration.',
        });
      }

      return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: 'AI scoring service is currently unavailable. Please try again later.',
      });
    }

    const validation = (error as { validation?: { message?: string }[] }).validation;
    if (Array.isArray(validation) && validation.length > 0) {
      const first = validation[0];
      const message =
        typeof first?.message === "string"
          ? first.message
          : (error as Error).message && (error as Error).message !== "Validation error"
            ? (error as Error).message
            : "Validation error";
      return reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message,
        errors: validation,
      });
    }

    request.log.error({ err: error, url: request.url }, 'Unhandled error');

    const errMsg = error instanceof Error && typeof error.message === 'string' && error.message.trim()
      ? error.message
      : 'Internal server error';

    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: errMsg
    });
  });
}
