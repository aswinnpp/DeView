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
    preferredWorkMode: string;
    preferredJobType: string;
    willingToRelocate: boolean;
    skills: string[];
    languages: string[];
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


        const profile = await this.getProfileUseCase.execute(user.userId);

        reply.send({ profile });
    };

    createProfile = async (
        request: FastifyRequest<{ Body: ProfileBody }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const body = request.body;
        if (!body || typeof body !== "object") {
            return reply.code(400).send({
                success: false,
                message: "Request body is required",
            });
        }
        const result = await this.createProfileUseCase.execute({
            ...body,
            userId: user.userId,
            email: body.email ?? user.email,
        });

        reply.code(201).send(result);
    };

    // PATCH /candidate/profile
    updateProfile = async (
        request: FastifyRequest<{ Body: Partial<ProfileBody> }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const body = request.body;
      
        const result = await this.updateProfileUseCase.execute({
            userId: user.userId,
            ...body,
        });

        reply.send(result);
    };

    // POST /candidate/profile/resume — JSON body with base64 file (no multipart)
    uploadResume = async (
        request: FastifyRequest<{
            Body: { fileName: string; mimetype?: string; fileBase64: string };
        }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const body = request.body;
        if (!body?.fileName || !body?.fileBase64 || typeof body.fileBase64 !== "string") {
            return reply.code(400).send({
                success: false,
                message: "Request body must include fileName and fileBase64.",
            });
        }
        let buffer: Buffer;
        try {
            buffer = Buffer.from(body.fileBase64, "base64");
        } catch {
            return reply.code(400).send({
                success: false,
                message: "Invalid base64 in fileBase64.",
            });
        }
        if (buffer.length === 0) {
            return reply.code(400).send({
                success: false,
                message: "File content is empty.",
            });
        }

        const result = await this.uploadResumeUseCase.execute({
            userId: user.userId,
            fileName: body.fileName,
            fileBuffer: buffer,
            mimetype: body.mimetype,
        });

        reply.send(result);
    };
}
