import { FastifyInstance } from "fastify";
import { AppError } from "../../shared/errors/AppError";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message
      });
    }

    const validation = (error as any).validation;
    if (Array.isArray(validation) && validation.length > 0) {
      const first = validation[0];
      const message =
        typeof first?.message === "string"
          ? first.message
          : (error as Error).message && (error as Error).message !== "Validation error"
            ? (error as Error).message
            : "Validation error";
      return reply.status(400).send({
        success: false,
        message,
        errors: validation,
      });
    }

    console.error(error); 

    return reply.status(500).send({
      success: false,
      message: "Internal server error"
    });
  });
}
