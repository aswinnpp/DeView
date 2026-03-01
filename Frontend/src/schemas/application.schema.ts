import { z } from 'zod';

export const applicationFormSchema = z.object({
  useResumeFromProfile: z.boolean(),
  coverLetter: z.string().trim().max(5000).optional().default(''),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
