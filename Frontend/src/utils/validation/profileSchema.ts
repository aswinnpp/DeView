// Candidate profile validation with Zod

import { z } from 'zod';

const optionalString = z.string().optional().or(z.literal(''));

const NOTICE_PERIOD_OPTIONS = [
  'Immediate',
  '1 week',
  '2 weeks',
  '1 month',
  '2 months',
  '3 months',
];

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: 'Full name is required' })
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name must be less than 100 characters' }),
  email: z.string().email().optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^[\d\s\-+()]{7,20}$/.test(val),
      { message: 'Please enter a valid phone number' }
    ),
  location: optionalString.refine(
    (val) => !val || val.trim() === '' || (val.trim().length >= 2),
    { message: 'Location must be at least 2 characters' }
  ),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        const now = new Date();
        const minAge = 16;
        const minDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        return date <= minDate;
      },
      { message: 'You must be at least 16 years old' }
    ),
  title: optionalString,
  currentCompany: optionalString,
  currentSalary: optionalString,
  experience: optionalString,
  bio: z
    .string()
    .min(1, { message: 'Bio is required' })
    .min(10, { message: 'Bio must be at least 10 characters' })
    .max(1000, { message: 'Bio must be less than 1000 characters' }),
  expectedSalary: z.string().min(1, { message: 'Expected salary is required' }),
  noticePeriod: z
    .string()
    .min(1, { message: 'Notice period is required' })
    .refine(
      (val) => NOTICE_PERIOD_OPTIONS.includes(val),
      { message: 'Please select a valid notice period' }
    ),
  preferredWorkMode: optionalString,
  preferredJobType: optionalString,
  willingToRelocate: z.boolean(),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
  education: optionalString,
  university: optionalString,
  graduationYear: optionalString,
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        if (!val.includes('linkedin.com')) return false;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid LinkedIn URL' }
    ),
  githubUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        if (!val.includes('github.com')) return false;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid GitHub URL' }
    ),
  resumeUrl: optionalString,
});

export type ProfileData = z.infer<typeof profileSchema>;

export interface ProfileValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
  firstError: string | null;
}

/** Validate profile with Zod and return errors in the same shape as before. */
export function validateProfile(data: ProfileData): ProfileValidationResult {
  const result = profileSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {}, firstError: null };
  }
  const errors: { [key: string]: string } = {};
  const zodErrors = result.error.flatten().fieldErrors;
  for (const [key, messages] of Object.entries(zodErrors)) {
    const msg = Array.isArray(messages) ? messages[0] : messages;
    if (msg) errors[key] = msg;
  }
  const firstError = Object.values(errors)[0] ?? null;
  return { isValid: false, errors, firstError };
}

export function getInitialProfileData(email: string = ''): ProfileData {
  return {
    fullName: '',
    email: email,
    phone: '',
    location: '',
    dateOfBirth: '',
    title: '',
    currentCompany: '',
    currentSalary: '',
    experience: '',
    bio: '',
    expectedSalary: '',
    noticePeriod: 'Immediate',
    preferredWorkMode: '',
    preferredJobType: '',
    willingToRelocate: false,
    skills: [''],
    languages: [''],
    education: '',
    university: '',
    graduationYear: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeUrl: '',
  };
}

/** Clean profile data before sending to backend (remove empty values). */
export function cleanProfileData(profile: ProfileData): Partial<ProfileData> {
  const cleaned: Partial<ProfileData> = {};
  Object.entries(profile).forEach(([key, value]) => {
    if (key === 'skills' || key === 'languages') {
      const filtered = (value as string[]).filter((item) => item.trim() !== '');
      if (filtered.length > 0) {
        (cleaned as Record<string, unknown>)[key] = filtered;
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      (cleaned as Record<string, unknown>)[key] = value.trim();
    } else if (typeof value === 'boolean') {
      (cleaned as Record<string, unknown>)[key] = value;
    }
  });
  return cleaned;
}
