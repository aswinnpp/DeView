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

export const offerMailsListQuerySchema = z.object({
  /** Filter by `offerMails.jobId`. */
  jobId: z.string().trim().optional(),
  /** Filter by `offerMails.status` (company HR view). */
  status: z.enum(['pending', 'accepted', 'declined', 'counter']).optional(),
  /** Search by job title (via jobs collection lookup). */
  search: z.string().trim().optional(),
  /** Pagination (1-indexed). */
  page: z.coerce.number().int().min(1).optional(),
  /** Page size. */
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

