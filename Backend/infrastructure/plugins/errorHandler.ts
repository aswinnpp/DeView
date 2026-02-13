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

    if ((error as any).validation) {
      return reply.status(400).send({
        success: false,
        message: "Validation error",
        errors: (error as any).validation
      });
    }

    console.error(error); 

    return reply.status(500).send({
      success: false,
      message: "Internal server error"
    });
  });
}
