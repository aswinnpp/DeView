import { z } from "zod";

// Shared validation for interviewer feedback modal.
// Backend expects `feedback` (comments) to be non-empty; also requires stricter feedback
// when `overallScore` is high.
export const interviewerFeedbackSchema = z
  .object({
    overallScore: z
      .coerce
      .number({
        // Note: this repo's Zod version doesn't support `invalid_type_error` for `coerce.number()`.
      })
      .min(1, "Overall score must be at least 1.")
      .max(10, "Overall score must be at most 10."),
    // Backend expects `feedback` to always be present and non-empty.
    comments: z.string().trim().optional().default(""),
  })
  .superRefine((val, ctx) => {
    const trimmed = val.comments.trim();
    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comments"],
        message:
          val.overallScore > 5
            ? "Feedback is required when the score is above 5."
            : "Please add detailed feedback / justification.",
      });
    }
  });

export type InterviewerFeedbackValues = z.infer<typeof interviewerFeedbackSchema>;

