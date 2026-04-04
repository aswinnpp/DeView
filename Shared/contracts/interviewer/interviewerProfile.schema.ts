import { z } from "zod";

const URL_MAX = 2048;

const optionalUrl = z.union([
  z.literal(""),
  z.string().max(URL_MAX, "URL is too long").url("Enter a valid URL"),
]);

const educationEntrySchema = z.object({
  degree: z.string().min(1, "Degree is required").max(200).trim(),
  university: z.string().min(1, "Institution is required").max(200).trim(),
  year: z.string().max(20).trim().optional(),
});

const workExperienceEntrySchema = z.object({
  company: z.string().min(1, "Company is required").max(200).trim(),
  jobTitle: z.string().max(200).trim().optional(),
  years: z
    .coerce
    .number()
    .min(0, "Years must be 0 or more")
    .max(100, "Years must be 100 or less"),
  description: z.string().max(2000).trim().optional(),
});

export const interviewerProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100).trim(),
  phone: z.string().max(10).trim().optional(),
  location: z.string().max(200).trim().optional(),
  title: z.string().min(1, "Professional title is required").max(200).trim(),
  // Kept for backwards compatibility & derived display.
  currentCompany: z.string().max(200).trim().optional(),
  yearsOfExperience: z.coerce.number().min(0, "Must be 0 or more").max(80).optional(),
  bio: z.string().min(1, "Professional bio is required").max(2000).trim(),
  technicalSkills: z.array(z.string().max(100)).max(50),
  languages: z
    .array(z.string().max(80))
    .min(1, "At least one language is required")
    .max(30),
  // Backwards-compatible legacy fields.
  education: z.string().min(1, "Education is required").max(200).trim().optional(),
  university: z.string().max(200).trim().optional(),

  // Multi-value fields (new).
  educationList: z
    .array(educationEntrySchema)
    .min(1, "At least one education is required")
    .max(20),
  workExperience: z
    .array(workExperienceEntrySchema)
    .min(1, "At least one work experience is required")
    .max(20),

  linkedinUrl: optionalUrl.optional(),
  githubUrl: optionalUrl.optional(),
  profilePicUrl: z.string().max(URL_MAX).trim().optional(),
});

export type InterviewerProfileFormValues = z.infer<typeof interviewerProfileSchema>;
