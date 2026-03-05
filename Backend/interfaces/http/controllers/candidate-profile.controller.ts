import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { ICreateCandidateProfileUseCase } from "../../../application/candidate/ports/usecase/ICreateCandidateProfileUseCase";
import type { IGetCandidateProfileUseCase } from "../../../application/candidate/ports/usecase/IGetCandidateProfileUseCase";
import type { IUpdateCandidateProfileUseCase } from "../../../application/candidate/ports/usecase/IUpdateCandidateProfileUseCase";
import type { IGetAllCandidatesUseCase } from "../../../application/candidate/ports/usecase/IGetAllCandidatesUseCase";
import type { IToggleCandidateStatusUseCase } from "../../../application/candidate/ports/usecase/IToggleCandidateStatusUseCase";
import { CandidateProfileMapper } from "../../../application/candidate/mappers/CandidateProfileMapper.js";

/** Body shape from Zod-validated request */
interface IProfileBody {
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
        @inject(TYPES.CreateCandidateProfileUseCasePort) private readonly createProfileUseCase: ICreateCandidateProfileUseCase,
        @inject(TYPES.GetCandidateProfileUseCasePort) private readonly getProfileUseCase: IGetCandidateProfileUseCase,
        @inject(TYPES.UpdateCandidateProfileUseCasePort) private readonly updateProfileUseCase: IUpdateCandidateProfileUseCase,
        @inject(TYPES.GetAllCandidatesUseCasePort) private readonly getAllCandidatesUseCase: IGetAllCandidatesUseCase,
        @inject(TYPES.ToggleCandidateStatusUseCasePort) private readonly toggleStatusUseCase: IToggleCandidateStatusUseCase
    ) { }

    getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;
        const profile = await this.getProfileUseCase.execute(user.userId);
        reply.send(success({ profile: profile ?? null }));
    };

    createProfile = async (
        request: FastifyRequest<{ Body: IProfileBody }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CandidateProfileMapper.toCreateDTO(request.body, ctx);
        const result = await this.createProfileUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    updateProfile = async (
        request: FastifyRequest<{ Body: Partial<IProfileBody> }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CandidateProfileMapper.toUpdateDTO(request.body, ctx);
        const result = await this.updateProfileUseCase.execute(dto);
        reply.send(success(result));
    };

    getAll = async (
        request: FastifyRequest<{ Querystring: { search?: string; status?: string; sortOrder?: 'asc' | 'desc'; page?: string; limit?: string } }>,
        reply: FastifyReply
    ) => {
        const { search, status, sortOrder, page, limit } = request.query;
        const result = await this.getAllCandidatesUseCase.execute(search, status, sortOrder, page, limit);
        reply.send(success(result));
    }


}
