import { FastifyRequest, FastifyReply } from "fastify";
import { CreateCandidateProfileUseCase } from "../../../application/candidate/use-cases/CreateCandidateProfileUseCase";
import { GetCandidateProfileUseCase } from "../../../application/candidate/use-cases/GetCandidateProfileUseCase";
import { UpdateCandidateProfileUseCase } from "../../../application/candidate/use-cases/UpdateCandidateProfileUseCase";
import { UploadCandidateResumeUseCase } from "../../../application/candidate/use-cases/UploadCandidateResumeUseCase";

interface ProfileBody {
    fullName: string;
    email?: string;
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

export class CandidateProfileController {
    constructor(
        private readonly createProfileUseCase: CreateCandidateProfileUseCase,
        private readonly getProfileUseCase: GetCandidateProfileUseCase,
        private readonly updateProfileUseCase: UpdateCandidateProfileUseCase,
        private readonly uploadResumeUseCase: UploadCandidateResumeUseCase
    ) { }

    // GET /candidate/profile
    getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;

        if (!user) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }

        const profile = await this.getProfileUseCase.execute(user.userId);

        reply.send({ profile });
    };

    // POST /candidate/profile
    createProfile = async (
        request: FastifyRequest<{ Body: ProfileBody }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;

        if (!user) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }

        const result = await this.createProfileUseCase.execute({
            ...request.body,
            userId: user.userId,
            email: request.body.email ?? user.email,
        });

        reply.code(201).send(result);
    };

    // PATCH /candidate/profile
    updateProfile = async (
        request: FastifyRequest<{ Body: Partial<ProfileBody> }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;

        if (!user) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }

        const result = await this.updateProfileUseCase.execute({
            userId: user.userId,
            ...request.body,
        });

        reply.send(result);
    };

    // POST /candidate/profile/resume
    uploadResume = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;

        if (!user) {
            reply.code(401).send({ error: "Unauthorized" });
            return;
        }

        const data = await request.file();

        if (!data) {
            reply.code(400).send({ error: "No file uploaded" });
            return;
        }

        const buffer = await data.toBuffer();

        const result = await this.uploadResumeUseCase.execute({
            userId: user.userId,
            fileName: data.filename,
            fileBuffer: buffer,
        });

        reply.send(result);
    };
}
