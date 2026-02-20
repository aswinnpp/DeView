import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { CreateCandidateProfileUseCasePort } from "../../../application/candidate/ports/CreateCandidateProfileUseCasePort";
import type { GetCandidateProfileUseCasePort } from "../../../application/candidate/ports/GetCandidateProfileUseCasePort";
import type { UpdateCandidateProfileUseCasePort } from "../../../application/candidate/ports/UpdateCandidateProfileUseCasePort";

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

@injectable()
export class CandidateProfileController {
    constructor(
        @inject(TYPES.CreateCandidateProfileUseCasePort) private readonly createProfileUseCase: CreateCandidateProfileUseCasePort,
        @inject(TYPES.GetCandidateProfileUseCasePort) private readonly getProfileUseCase: GetCandidateProfileUseCasePort,
        @inject(TYPES.UpdateCandidateProfileUseCasePort) private readonly updateProfileUseCase: UpdateCandidateProfileUseCasePort
    ) { }

    // GET /candidate/profile — returns 200 with { profile } or { profile: null } when none
    getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;
        const profile = await this.getProfileUseCase.execute(user.userId);
        reply.send(success({ profile: profile ?? null }));
    };

    createProfile = async (
        request: FastifyRequest<{ Body: ProfileBody }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const body = request.body;
      
        const result = await this.createProfileUseCase.execute({
            ...body,
            userId: user.userId,
            email: body.email ?? user.email,
        });

        reply.code(HttpStatus.CREATED).send(success(result));
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

        reply.send(success(result));
    };
}
