import { z } from 'zod';


const URL_MAX = 2048;

/** Short optional text (titles, labels, dates). */
const optionalString = z.string().trim().max(500).catch('');

const optionalLinkedInUrl = z.string().trim().max(URL_MAX).catch('').refine(
    (val) => {
        const v = (val ?? '').trim();
        if (!v) return true;
        if (!v.includes('linkedin.com')) return false;
        try { new URL(v); return true; } catch { return false; }
    },
    { message: 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourprofile)' }
);
const optionalGithubUrl = z.string().trim().max(URL_MAX).catch('').refine(
    (val) => {
        const v = (val ?? '').trim();
        if (!v) return true;
        if (!v.includes('github.com')) return false;
        try { new URL(v); return true; } catch { return false; }
    },
    { message: 'Please enter a valid GitHub URL (e.g. https://github.com/yourusername)' }
);

const NOTICE_PERIOD_OPTIONS = [
    'Immediate',
    '1 week',
    '2 weeks',
    '1 month',
    '2 months',
    '3 months',
] as const;

// ─── Education & Work Experience sub-schemas ────────────────────
export const educationEntrySchema = z.object({
    degree: z
        .string()
        .trim()
        .min(1, { message: 'Degree/Qualification is required' })
        .max(200, { message: 'Degree must be at most 200 characters' }),
    institution: z
        .string()
        .trim()
        .min(1, { message: 'Institution is required' })
        .max(200, { message: 'Institution must be at most 200 characters' }),
    year: z
        .string()
        .trim()
        .min(1, { message: 'Year is required' })
        .max(20, { message: 'Year must be at most 20 characters' }),
});

export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const workExperienceEntrySchema = z.object({
    jobTitle: z
        .string()
        .trim()
        .min(1, { message: 'Job title is required' })
        .max(200, { message: 'Job title must be at most 200 characters' }),
    company: z
        .string()
        .trim()
        .min(1, { message: 'Company is required' })
        .max(200, { message: 'Company must be at most 200 characters' }),
    startDate: z
        .string()
        .trim()
        .min(1, { message: 'Start date is required' })
        .max(50, { message: 'Start date must be at most 50 characters' }),
    endDate: z.string().trim().max(50).catch(''),
    description: z.string().trim().max(2000).catch(''),
});

export type WorkExperienceEntry = z.infer<typeof workExperienceEntrySchema>;

// ─── Schema ─────────────────────────────────────────────────────
const candidateProfileObjectSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, { message: 'Full name is required' })
        .min(2, { message: 'Full name must be at least 2 characters' })
        .max(100, { message: 'Full name must be less than 100 characters' }),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, { message: 'Email is required' })
        .max(254, { message: 'Email is too long' })
        .email({ message: 'Please enter a valid email' }),
    phone: z
        .string()
        .trim()
        .min(1, { message: 'Phone number is required' })
        .refine(
            (val) => /^[\d\s\-+()]{7,20}$/.test(val),
            { message: 'Please enter a valid phone number' }
        ),
    location: z
        .string()
        .trim()
        .min(1, { message: 'Location is required' })
        .min(2, { message: 'Location must be at least 2 characters' })
        .max(200, { message: 'Location must be at most 200 characters' }),
    dateOfBirth: z
        .string()
        .trim()
        .min(1, { message: 'Date of birth is required' })
        .max(50, { message: 'Date of birth must be at most 50 characters' })
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
    // Optional: Professional & Links
    title: optionalString,
    currentCompany: optionalString,
    currentSalary: optionalString,
    experience: optionalString,
    bio: z
        .string()
        .trim()
        .min(1, { message: 'Bio is required' })
        .min(10, { message: 'Bio must be at least 10 characters' })
        .max(1000, { message: 'Bio must be less than 1000 characters' }),
    expectedSalary: z
        .string()
        .trim()
        .min(1, { message: 'Expected salary is required' })
        .max(200, { message: 'Expected salary must be at most 200 characters' }),
    noticePeriod: z
        .string()
        .trim()
        .min(1, { message: 'Notice period is required' })
        .refine(
            (val) => NOTICE_PERIOD_OPTIONS.includes(val as typeof NOTICE_PERIOD_OPTIONS[number]),
            { message: 'Please select a valid notice period' }
        ),
    preferredWorkMode: z
        .string()
        .trim()
        .min(1, { message: 'Preferred work mode is required' })
        .max(100, { message: 'Preferred work mode must be at most 100 characters' }),
    preferredJobType: z
        .string()
        .trim()
        .min(1, { message: 'Preferred job type is required' })
        .max(100, { message: 'Preferred job type must be at most 100 characters' }),
    willingToRelocate: z.boolean().catch(false),
    skills: z
        .array(z.string().trim().max(100))
        .max(50)
        .catch([''])
        .refine((arr) => arr.some((s) => s !== ''), {
            message: 'At least one skill is required',
        }),
    languages: z
        .array(z.string().trim().max(80))
        .max(30)
        .catch([''])
        .refine((arr) => arr.some((s) => s !== ''), {
            message: 'At least one language is required',
        }),
    // Legacy single education fields (kept for backward compatibility with API/storage).
    // The profile UI primarily uses educationList; these may stay empty until valid entries exist.
    education: z.string().trim().max(200),
    university: z.string().trim().max(200),
    graduationYear: z.string().trim().max(20),
    // Multiple education entries
    educationList: z.array(educationEntrySchema).max(20).catch([]),
    // Multiple work experience entries
    workExperience: z.array(workExperienceEntrySchema).max(20).catch([]),
    linkedinUrl: optionalLinkedInUrl,
    githubUrl: optionalGithubUrl,
    resumeUrl: z.string().trim().max(URL_MAX).catch(''),
    profilePicUrl: z.string().trim().max(URL_MAX).catch(''),
});

function hasCompleteEducationList(
    list: Array<{ degree: string; institution: string; year: string }> | undefined
): boolean {
    return (list ?? []).some(
        (e) =>
            e.degree.trim().length > 0 &&
            e.institution.trim().length > 0 &&
            e.year.trim().length > 0
    );
}

function hasCompleteLegacyEducation(data: {
    education: string;
    university: string;
    graduationYear: string;
}): boolean {
    return (
        data.education.trim().length > 0 &&
        data.university.trim().length > 0 &&
        data.graduationYear.trim().length > 0
    );
}

/** Require either legacy education trio or at least one fully filled educationList row. */
export const candidateProfileSchema = candidateProfileObjectSchema.superRefine((data, ctx) => {
    if (hasCompleteLegacyEducation(data) || hasCompleteEducationList(data.educationList)) {
        return;
    }
    ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Education is required — add an education entry or fill degree, school, and year.',
        path: ['education'],
    });
});

export type CandidateProfileData = z.infer<typeof candidateProfileSchema>;

export const candidateProfileUpdateSchema = candidateProfileObjectSchema.partial();

