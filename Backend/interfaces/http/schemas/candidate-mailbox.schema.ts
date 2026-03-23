import { z } from 'zod';

export const candidateMailboxListQuerySchema = z.object({
  /** Which message type to show. */
  kind: z.enum(['all', 'offer', 'rejection']).optional(),
  /** Filter offers/rejections by job id. */
  jobId: z.string().trim().optional(),
  /** Filter offer status. Only applies when `kind` includes offers. */
  offerStatus: z.enum(['pending', 'accepted', 'declined', 'counter']).optional(),
  /** Search by job title (case-insensitive). */
  search: z.string().trim().optional(),
  /** Pagination (1-indexed). */
  page: z.coerce.number().int().min(1).optional(),
  /** Page size. */
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

