import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url("Enter a valid URL")]);

const educationEntrySchema = z.object({
  degree: z.string().min(1, "Degree is required").trim(),
  university: z.string().min(1, "Institution is required").trim(),
  year: z.string().trim().optional(),
});

const workExperienceEntrySchema = z.object({
  company: z.string().min(1, "Company is required").trim(),
  jobTitle: z.string().trim().optional(),
  years: z
    .coerce
    .number()
    .min(0, "Years must be 0 or more")
    .max(100, "Years must be 100 or less"),
  description: z.string().trim().optional(),
});

export const interviewerProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  title: z.string().min(1, "Professional title is required").trim(),
  // Kept for backwards compatibility & derived display.
  currentCompany: z.string().trim().optional(),
  yearsOfExperience: z.coerce.number().min(0, "Must be 0 or more").optional(),
  bio: z.string().min(1, "Professional bio is required").trim(),
  technicalSkills: z.array(z.string()),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  // Backwards-compatible legacy fields.
  education: z.string().min(1, "Education is required").trim().optional(),
  university: z.string().trim().optional(),

  // Multi-value fields (new).
  educationList: z
    .array(educationEntrySchema)
    .min(1, "At least one education is required"),
  workExperience: z
    .array(workExperienceEntrySchema)
    .min(1, "At least one work experience is required"),

  linkedinUrl: optionalUrl.optional(),
  githubUrl: optionalUrl.optional(),
  profilePicUrl: z.string().trim().optional(),
});

export type InterviewerProfileFormValues = z.infer<typeof interviewerProfileSchema>;
