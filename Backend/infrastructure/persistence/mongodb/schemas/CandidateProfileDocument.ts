import { ObjectId } from "mongodb";

export interface IEducationEntryDocument {
    degree: string;
    institution: string;
    year: string;
}

export interface IWorkExperienceEntryDocument {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface ICandidateProfileDocument {
    _id?: ObjectId;
    userId: string;
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    dateOfBirth?: string;
    title?: string;
    currentCompany?: string;
    currentSalary?: string;
    experience?: string;
    bio?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    preferredWorkMode?: string;
    preferredJobType?: string;
    willingToRelocate: boolean;
    skills: string[];
    languages: string[];
    education?: string;
    university?: string;
    graduationYear?: string;
    educationList?: IEducationEntryDocument[];
    workExperience?: IWorkExperienceEntryDocument[];
    linkedinUrl?: string;
    githubUrl?: string;
    resumeUrl?: string;
    profilePicUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
