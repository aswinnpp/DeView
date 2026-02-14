export interface CreateCandidateProfileDTO {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    dateOfBirth: string;
    title?: string;
    currentCompany?: string;
    currentSalary?: string;
    experience?: string;
    bio: string;
    expectedSalary: string;
    noticePeriod: string;
    preferredWorkMode?: string;
    preferredJobType?: string;
    willingToRelocate?: boolean;
    skills?: string[];
    languages?: string[];
    education: string;
    university: string;
    graduationYear: string;
    linkedinUrl?: string;
    githubUrl?: string;
    resumeUrl?: string;
}
