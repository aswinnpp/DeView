import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '../../shared/errors/AppError.js';
import { DomainError } from '../../shared/errors/DomainError.js';
import { HttpStatus } from '../../shared/http/HttpStatus.js';
import { logger } from '../logging/fileLogger.js';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const rateLimitStatus = (error as { statusCode?: number }).statusCode;

    if (rateLimitStatus === HttpStatus.TOO_MANY_REQUESTS) {
      const rateLimitMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Too many requests. Please try again later.';

      logger.error({
        type: 'RATE_LIMIT_ERROR',
        url: request.url,
        method: request.method,
        message: rateLimitMessage,
      });

      return reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
        success: false,
        message: rateLimitMessage,
      });
    }

    if (error instanceof AppError) {
      logger.error({
        type: 'APP_ERROR',
        statusCode: error.statusCode,
        url: request.url,
        method: request.method,
        message: error.message,
        stack: error.stack,
      });

      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof DomainError) {
      logger.error({
        type: 'DOMAIN_ERROR',
        url: request.url,
        method: request.method,
        message: error.message,
        stack: error.stack,
      });

      return reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof ZodError) {
      logger.error({
        type: 'ZOD_VALIDATION_ERROR',
        url: request.url,
        method: request.method,
        errors: error.issues,
      });

      const first = error.issues[0];
      const message = first?.message ?? 'Validation error';

      const errors = error.issues.map((i) => ({
        message: i.message,
        path: i.path.join('.'),
      }));

      return reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message,
        errors,
      });
    }

    const apiErr = error as {
      name?: string;
      status?: number;
      message?: string;
    };

    if (apiErr?.name === 'ApiError') {
      logger.error({
        type: 'AI_API_ERROR',
        url: request.url,
        method: request.method,
        status: apiErr.status,
        message: apiErr.message,
      });

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
        message:
          'AI scoring service is currently unavailable. Please try again later.',
      });
    }

    const validation = (error as {
      validation?: { message?: string }[];
    }).validation;

    if (Array.isArray(validation) && validation.length > 0) {
      logger.error({
        type: 'FASTIFY_VALIDATION_ERROR',
        url: request.url,
        method: request.method,
        validation,
      });

      const first = validation[0];

      const message =
        typeof first?.message === 'string'
          ? first.message
          : error instanceof Error &&
              error.message &&
              error.message !== 'Validation error'
            ? error.message
            : 'Validation error';

      return reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        message,
        errors: validation,
      });
    }

    logger.error({
      type: 'UNHANDLED_ERROR',
      url: request.url,
      method: request.method,
      message:
        error instanceof Error ? error.message : 'Unknown error',
      stack:
        error instanceof Error ? error.stack : undefined,
    });

    const errMsg =
      error instanceof Error &&
      typeof error.message === 'string' &&
      error.message.trim()
        ? error.message
        : 'Internal server error';

    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: errMsg,
    });
  });
}