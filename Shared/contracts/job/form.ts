import { z } from "zod";

export const jobTypeEnum = z.enum([
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
]);
export const workModeEnum = z.enum(["On-site", "Remote", "Hybrid"]);
export const experienceLevelEnum = z.enum([
  "Entry-level",
  "Mid-level",
  "Senior",
  "Lead",
  "Executive",
]);
export const jobStatusEnum = z.enum(["OPEN", "CLOSED"]);

/** Each interview round must have a non-empty name */
const interviewRoundSchema = z.string().trim().min(1, "Round name is required");

// Base schema without refinements (used for both create and update)
const jobBaseSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  department: z.string().trim().min(1, "Department is required"),
  location: z.string().trim().min(1, "Location is required"),
  jobType: jobTypeEnum,
  workMode: workModeEnum,
  experienceLevel: experienceLevelEnum,
  minExperience: z.string().optional(),
  maxExperience: z.string().optional(),
  salary: z.string().optional(),
  salaryNonDisclosure: z.boolean().default(false),
  skills: z.string().trim().min(1, "Required skills are required"),
  qualifications: z.string().trim().min(1, "Qualifications are required"),
  responsibilities: z.string().trim().min(1, "Key responsibilities are required"),
  benefits: z.string().optional(),
  description: z.string().trim().min(1, "Job description is required"),
  applicationDeadline: z.string().optional(),
  numberOfPositions: z.coerce.number().int().min(1, "At least 1 position required"),
  /** Interview rounds are required; at least one round with a name */
  interviewRounds: z
    .array(interviewRoundSchema)
    .min(1, "Interview rounds are required. Add at least one round."),
  status: jobStatusEnum,
});

export const isFutureOrTodayDate = (value?: string | null) => {
  if (!value || !value.trim()) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date >= today;
};

export const isJobDeadlinePast = (value?: string | null) =>
  !!value?.trim() && !isFutureOrTodayDate(value);

export const JOB_DEADLINE_PAST_MESSAGE =
  "The application deadline has passed. You cannot reopen, edit, or recreate this job.";

export const jobFormSchema = jobBaseSchema
  .refine(
    (data) =>
      data.salaryNonDisclosure ||
      (typeof data.salary === "string" && data.salary.trim().length > 0),
    { message: "Salary range is required when not non-disclosure", path: ["salary"] }
  )
  .refine(
    (data) => isFutureOrTodayDate(data.applicationDeadline),
    {
      message: "Application deadline cannot be in the past",
      path: ["applicationDeadline"],
    }
  );

export type JobFormValues = z.infer<typeof jobFormSchema>;

// Partial schema for updates (all fields optional, with deadline validation if provided)
export const jobUpdateSchema = jobBaseSchema
  .partial()
  .refine(
    (data) => isFutureOrTodayDate(data.applicationDeadline),
    {
      message: "Application deadline cannot be in the past",
      path: ["applicationDeadline"],
    }
  );

export const defaultJobFormValues: JobFormValues = {
  title: "",
  department: "",
  location: "",
  jobType: "Full-time",
  workMode: "On-site",
  experienceLevel: "Mid-level",
  minExperience: "",
  maxExperience: "",
  salary: "",
  salaryNonDisclosure: false,
  skills: "",
  qualifications: "",
  responsibilities: "",
  benefits: "",
  description: "",
  applicationDeadline: "",
  numberOfPositions: 1,
  interviewRounds: [],
  status: "OPEN",
};
