import { z } from "zod";

export const interviewerSlotsUpsertSchema = z.object({
  companyId: z.string().min(1).optional(),
  slotDate: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, "slotDate must be in DD-MM-YYYY format"),
  times: z.array(z.string().datetime()).min(1, "Select at least one time slot"),
  booked: z.boolean().optional(),
});

export type InterviewerSlotsUpsertBody = z.infer<typeof interviewerSlotsUpsertSchema>;

