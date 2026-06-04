import { DomainError } from "../../shared/errors/DomainError";

export interface IEducationEntry {
    degree: string;
    institution: string;
    year: string;
}

export interface IWorkExperienceEntry {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export class CandidateProfile {
    constructor(
        public id: string | null,
        public userId: string,
        public fullName: string,
        public email: string,
        public phone?: string,
        public location?: string,
        public dateOfBirth?: string,
        public title?: string,
        public currentCompany?: string,
        public currentSalary?: string,
        public experience?: string,
        public bio?: string,
        public expectedSalary?: string,
        public noticePeriod?: string,
        public preferredWorkMode?: string,
        public preferredJobType?: string,
        public willingToRelocate: boolean = false,
        public skills: string[] = [],
        public languages: string[] = [],
        public education?: string,
        public university?: string,
        public graduationYear?: string,
        public educationList: IEducationEntry[] = [],
        public workExperience: IWorkExperienceEntry[] = [],
        public linkedinUrl?: string,
        public githubUrl?: string,
        public resumeUrl?: string,
        public profilePicUrl?: string,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    updateFields(fields: Partial<Omit<CandidateProfile, "id" | "userId" | "createdAt" | "updatedAt">>) {
        if (fields.fullName !== undefined) this.fullName = fields.fullName;
        if (fields.email !== undefined) this.email = fields.email;
        if (fields.phone !== undefined) this.phone = fields.phone;
        if (fields.location !== undefined) this.location = fields.location;
        if (fields.dateOfBirth !== undefined) this.dateOfBirth = fields.dateOfBirth;
        if (fields.title !== undefined) this.title = fields.title;
        if (fields.currentCompany !== undefined) this.currentCompany = fields.currentCompany;
        if (fields.currentSalary !== undefined) this.currentSalary = fields.currentSalary;
        if (fields.experience !== undefined) this.experience = fields.experience;
        if (fields.bio !== undefined) this.bio = fields.bio;
        if (fields.expectedSalary !== undefined) this.expectedSalary = fields.expectedSalary;
        if (fields.noticePeriod !== undefined) this.noticePeriod = fields.noticePeriod;
        if (fields.preferredWorkMode !== undefined) this.preferredWorkMode = fields.preferredWorkMode;
        if (fields.preferredJobType !== undefined) this.preferredJobType = fields.preferredJobType;
        if (fields.willingToRelocate !== undefined) this.willingToRelocate = fields.willingToRelocate;
        if (fields.skills !== undefined) this.skills = fields.skills;
        if (fields.languages !== undefined) this.languages = fields.languages;
        if (fields.education !== undefined) this.education = fields.education;
        if (fields.university !== undefined) this.university = fields.university;
        if (fields.graduationYear !== undefined) this.graduationYear = fields.graduationYear;
        if (fields.educationList !== undefined) this.educationList = fields.educationList;
        if (fields.workExperience !== undefined) this.workExperience = fields.workExperience;
        if (fields.linkedinUrl !== undefined) this.linkedinUrl = fields.linkedinUrl;
        if (fields.githubUrl !== undefined) this.githubUrl = fields.githubUrl;
        if (fields.resumeUrl !== undefined) this.resumeUrl = fields.resumeUrl;
        if (fields.profilePicUrl !== undefined) this.profilePicUrl = fields.profilePicUrl;

        this.updatedAt = new Date();
    }

    attachResume(resumeUrl: string) {
        if (!resumeUrl.trim()) {
            throw new DomainError("Resume URL cannot be empty");
        }

        this.resumeUrl = resumeUrl;
        this.updatedAt = new Date();
    }
}
