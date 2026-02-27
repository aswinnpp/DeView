import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../../shared/errors/AppError";
import { DomainError } from "../../shared/errors/DomainError";
import { HttpStatus } from "../../shared/http/HttpStatus";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {

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

    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: "Internal server error"
    });
  });
}
