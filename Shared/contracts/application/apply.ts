import { z } from 'zod';

export const applyForJobBodySchema = z.object({
  useResumeFromProfile: z.boolean(),
  coverLetter: z.string().trim().max(5000).optional().default(''),
  resumeUrl: z.string().url().optional(),
});

export type ApplyForJobBody = z.infer<typeof applyForJobBodySchema>;
