import { z } from 'zod';


/** Optional fields: URL (linkedin, github, resume) and Professional (title, company, salary, experience) */
const optionalString = z.string().catch('');

const NOTICE_PERIOD_OPTIONS = [
    'Immediate',
    '1 week',
    '2 weeks',
    '1 month',
    '2 months',
    '3 months',
] as const;

// ─── Schema ─────────────────────────────────────────────────────
export const candidateProfileSchema = z.object({
    fullName: z
        .string()
        .min(1, { message: 'Full name is required' })
        .min(2, { message: 'Full name must be at least 2 characters' })
        .max(100, { message: 'Full name must be less than 100 characters' }),
    email: z
        .string()
        .min(1, { message: 'Email is required' })
        .email({ message: 'Please enter a valid email' }),
    phone: z
        .string()
        .min(1, { message: 'Phone number is required' })
        .refine(
            (val) => /^[\d\s\-+()]{7,20}$/.test(val),
            { message: 'Please enter a valid phone number' }
        ),
    location: z
        .string()
        .min(1, { message: 'Location is required' })
        .min(2, { message: 'Location must be at least 2 characters' }),
    dateOfBirth: z
        .string()
        .min(1, { message: 'Date of birth is required' })
        .refine(
            (val) => {
                const date = new Date(val);
                if (isNaN(date.getTime())) return false;
                const now = new Date();
                const minAge = 16;
                const minDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
                return date <= minDate;
            },
            { message: 'You must be at least 16 years old' }
        ),
    // Optional: Professional information
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
            (val) => NOTICE_PERIOD_OPTIONS.includes(val as typeof NOTICE_PERIOD_OPTIONS[number]),
            { message: 'Please select a valid notice period' }
        ),
    preferredWorkMode: z.string().min(1, { message: 'Preferred work mode is required' }),
    preferredJobType: z.string().min(1, { message: 'Preferred job type is required' }),
    willingToRelocate: z.boolean().catch(false),
    skills: z.array(z.string()).catch(['']).refine(
        (arr) => arr.some((s) => s.trim() !== ''),
        { message: 'At least one skill is required' }
    ),
    languages: z.array(z.string()).catch(['']).refine(
        (arr) => arr.some((s) => s.trim() !== ''),
        { message: 'At least one language is required' }
    ),
    education: z.string().min(1, { message: 'Education is required' }),
    university: z.string().min(1, { message: 'University/School is required' }),
    graduationYear: z.string().min(1, { message: 'Graduation year is required' }),
    linkedinUrl: z
        .string()
        .catch('')
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
        .catch('')
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

export type CandidateProfileData = z.infer<typeof candidateProfileSchema>;

/** For PATCH: all fields optional; when present they are validated. */
export const candidateProfileUpdateSchema = candidateProfileSchema.partial();
