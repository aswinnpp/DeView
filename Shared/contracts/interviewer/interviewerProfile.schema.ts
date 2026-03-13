import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url("Enter a valid URL")]);

export const interviewerProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  title: z.string().min(1, "Professional title is required").trim(),
  currentCompany: z.string().trim().optional(),
  yearsOfExperience: z.number().min(0, "Must be 0 or more"),
  bio: z.string().min(1, "Professional bio is required").trim(),
  technicalSkills: z.array(z.string()),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  education: z.string().min(1, "Education is required").trim(),
  university: z.string().trim().optional(),
  linkedinUrl: optionalUrl.optional(),
  githubUrl: optionalUrl.optional(),
  profilePicUrl: z.string().trim().optional(),
});

export type InterviewerProfileFormValues = z.infer<typeof interviewerProfileSchema>;
