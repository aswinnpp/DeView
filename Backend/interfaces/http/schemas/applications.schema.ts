import { z } from 'zod';

export const applicationsListQuerySchema = z.object({
  status: z
    .enum([
      'PENDING',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETE',
      'COMPLETED',
      'HIRED',
      'REJECTED',
      'RESCHEDULE_REQUESTED',
    ])
    .optional(),
  pipelineTab: z.enum(['pending', 'shortlist', 'interview', 'interview_complete', 'complete']).optional(),
});

