import { FastifyInstance } from 'fastify';
import { JobsController } from '../controllers/jobs.controller.js';
import { requireRoles } from '../middleware/authMiddleware';
import {
  createJobSchema,
  updateJobSchema,
  toggleJobStatusSchema,
} from '../schemas/jobs.schema';

export async function jobRoutes(
  fastify: FastifyInstance,
  controller: JobsController
) {
  fastify.addHook('preHandler', requireRoles('company', 'hr'));

  fastify.get('/', {
    handler: controller.getJobs,
  });

  fastify.post('/', {
    schema: createJobSchema,
    handler: controller.createJob,
  });

  fastify.put('/:id', {
    schema: updateJobSchema,
    handler: controller.updateJob,
  });

  fastify.put('/:id/status', {
    schema: toggleJobStatusSchema,
    handler: controller.toggleStatus,
  });

  fastify.post('/subscription', {
    handler: controller.subscription,
  });
}