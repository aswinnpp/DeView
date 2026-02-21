import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { CreateCandidateProfileUseCasePort } from "../../../application/candidate/ports/usecase/CreateCandidateProfileUseCasePort";
import type { GetCandidateProfileUseCasePort } from "../../../application/candidate/ports/usecase/GetCandidateProfileUseCasePort";
import type { UpdateCandidateProfileUseCasePort } from "../../../application/candidate/ports/usecase/UpdateCandidateProfileUseCasePort";
import type { GetAllCandidatesUseCasePort } from "../../../application/candidate/ports/usecase/GetAllCandidateUsecasePort";
import type { ToggleCandidateStatusUseCasePort } from "../../../application/candidate/ports/usecase/ToggleCandidateStatusUseCasePort";
import { CandidateProfileMapper } from "../mappers/CandidateProfileMapper.js";

/** Body shape from Zod-validated request */
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
        @inject(TYPES.UpdateCandidateProfileUseCasePort) private readonly updateProfileUseCase: UpdateCandidateProfileUseCasePort,
        @inject(TYPES.GetAllCandidatesUseCasePort) private readonly getAllCandidatesUseCase: GetAllCandidatesUseCasePort,
        @inject(TYPES.ToggleCandidateStatusUseCasePort) private readonly toggleStatusUseCase: ToggleCandidateStatusUseCasePort
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
        const dto = CandidateProfileMapper.toCreateDTO(request.body, request.currentUser);
        const result = await this.createProfileUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    // PATCH /candidate/profile
    updateProfile = async (
        request: FastifyRequest<{ Body: Partial<ProfileBody> }>,
        reply: FastifyReply
    ) => {
        const dto = CandidateProfileMapper.toUpdateDTO(request.body, request.currentUser);
        const result = await this.updateProfileUseCase.execute(dto);
        reply.send(success(result));
    };

    getAll = async (
        request: FastifyRequest<{ Querystring: { search?: string; status?: string; sortOrder?: 'asc' | 'desc'; page?: string; limit?: string } }>,
        reply: FastifyReply
    ) => {
        const { search, status, sortOrder, page: pageStr, limit: limitStr } = request.query;
        const page = pageStr != null ? parseInt(pageStr, 10) : undefined;
        const limit = limitStr != null ? parseInt(limitStr, 10) : undefined;
        const result = await this.getAllCandidatesUseCase.execute(search, status, sortOrder, page, limit);
        reply.send(success(result));
    }

    toggleStatus = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        const { id } = request.params;
        const result = await this.toggleStatusUseCase.execute(id);
        reply.send(success(result));
    }
}
