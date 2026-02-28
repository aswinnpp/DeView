import { FastifyInstance } from 'fastify';
import { jobController } from '../controllers/jobs.controller';
import { requireRoles } from '../middleware/authMiddleware';
import {
  createJobSchema,
  updateJobSchema,
  toggleJobStatusSchema,
} from '../schemas/jobs.schema';

export async function jobRoutes(
  fastify: FastifyInstance,
  controller: jobController
) {
  // Only company and HR users can manage jobs
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
}