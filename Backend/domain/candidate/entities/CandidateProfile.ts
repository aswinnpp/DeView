import { DomainError } from "../../../shared/errors/DomainError";

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
        public linkedinUrl?: string,
        public githubUrl?: string,
        public resumeUrl?: string,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    updateFields(fields: Partial<Omit<CandidateProfile, "id" | "userId" | "createdAt" | "updatedAt">>) {
        const allowedKeys: (keyof typeof fields)[] = [
            "fullName", "email", "phone", "location", "dateOfBirth",
            "title", "currentCompany", "currentSalary", "experience",
            "bio", "expectedSalary", "noticePeriod", "preferredWorkMode",
            "preferredJobType", "willingToRelocate", "skills", "languages",
            "education", "university", "graduationYear",
            "linkedinUrl", "githubUrl", "resumeUrl",
        ];

        for (const key of allowedKeys) {
            if (key in fields) {
                (this as any)[key] = fields[key];
            }
        }

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
