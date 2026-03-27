import { z } from 'zod';


const optionalString = z.string().trim().catch('');

const optionalLinkedInUrl = z.string().trim().catch('').refine(
    (val) => {
        const v = (val ?? '').trim();
        if (!v) return true;
        if (!v.includes('linkedin.com')) return false;
        try { new URL(v); return true; } catch { return false; }
    },
    { message: 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourprofile)' }
);
const optionalGithubUrl = z.string().trim().catch('').refine(
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
    degree: z.string().trim().min(1, { message: 'Degree/Qualification is required' }),
    institution: z.string().trim().min(1, { message: 'Institution is required' }),
    year: z.string().trim().min(1, { message: 'Year is required' }),
});

export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const workExperienceEntrySchema = z.object({
    jobTitle: z.string().trim().min(1, { message: 'Job title is required' }),
    company: z.string().trim().min(1, { message: 'Company is required' }),
    startDate: z.string().trim().min(1, { message: 'Start date is required' }),
    endDate: optionalString,
    description: optionalString,
});

export type WorkExperienceEntry = z.infer<typeof workExperienceEntrySchema>;

// ─── Schema ─────────────────────────────────────────────────────
export const candidateProfileSchema = z.object({
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
        .min(2, { message: 'Location must be at least 2 characters' }),
    dateOfBirth: z
        .string()
        .trim()
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
    expectedSalary: z.string().trim().min(1, { message: 'Expected salary is required' }),
    noticePeriod: z
        .string()
        .trim()
        .min(1, { message: 'Notice period is required' })
        .refine(
            (val) => NOTICE_PERIOD_OPTIONS.includes(val as typeof NOTICE_PERIOD_OPTIONS[number]),
            { message: 'Please select a valid notice period' }
        ),
    preferredWorkMode: z.string().trim().min(1, { message: 'Preferred work mode is required' }),
    preferredJobType: z.string().trim().min(1, { message: 'Preferred job type is required' }),
    willingToRelocate: z.boolean().catch(false),
    skills: z.array(z.string().trim()).catch(['']).refine(
        (arr) => arr.some((s) => s !== ''),
        { message: 'At least one skill is required' }
    ),
    languages: z.array(z.string().trim()).catch(['']).refine(
        (arr) => arr.some((s) => s !== ''),
        { message: 'At least one language is required' }
    ),
    // Legacy single education fields (kept for backward compatibility)
    education: z.string().trim().min(1, { message: 'Education is required' }),
    university: z.string().trim().min(1, { message: 'University/School is required' }),
    graduationYear: z.string().trim().min(1, { message: 'Graduation year is required' }),
    // Multiple education entries
    educationList: z.array(educationEntrySchema).catch([]),
    // Multiple work experience entries
    workExperience: z.array(workExperienceEntrySchema).catch([]),
    linkedinUrl: optionalLinkedInUrl,
    githubUrl: optionalGithubUrl,
    resumeUrl: optionalString,
    profilePicUrl: optionalString,
});

export type CandidateProfileData = z.infer<typeof candidateProfileSchema>;

export const candidateProfileUpdateSchema = candidateProfileSchema.partial();

