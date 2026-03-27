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
import type { IFileStorage } from "../../../application/upload/ports/services/IFileStorage.js";
import { AppError } from "../../../shared/errors/AppError";
import { MESSAGES } from "../../../shared/constants/messages.js";

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
    profilePicUrl?: string;
}

@injectable()
export class CandidateProfileController {
    constructor(
        @inject(TYPES.CreateCandidateProfileUseCasePort) private readonly _createProfileUseCase: ICreateCandidateProfileUseCase,
        @inject(TYPES.GetCandidateProfileUseCasePort) private readonly _getProfileUseCase: IGetCandidateProfileUseCase,
        @inject(TYPES.UpdateCandidateProfileUseCasePort) private readonly _updateProfileUseCase: IUpdateCandidateProfileUseCase,
        @inject(TYPES.GetAllCandidatesUseCasePort) private readonly _getAllCandidatesUseCase: IGetAllCandidatesUseCase,
        @inject(TYPES.ToggleCandidateStatusUseCasePort) private readonly _toggleStatusUseCase: IToggleCandidateStatusUseCase,
        @inject(TYPES.FileStoragePort) private readonly _fileStorage: IFileStorage
    ) { }

    getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;
        const profile = await this._getProfileUseCase.execute(user.userId);
        reply.send(success({ profile: profile ?? null }));
    };

    getResumeViewUrl = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;
        const profile = await this._getProfileUseCase.execute(user.userId);
        const raw = profile?.resumeUrl ?? '';
        if (!raw.trim()) throw AppError.notFound(MESSAGES.RESUME_NOT_FOUND);
        const url = await this._fileStorage.getSignedViewUrl(raw, 3600);
        reply.send(success({ url }));
    };

    getProfilePicViewUrl = async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.currentUser;
        const profile = await this._getProfileUseCase.execute(user.userId);
        const raw = profile?.profilePicUrl ?? '';
        if (!raw.trim()) throw AppError.notFound(MESSAGES.PROFILE_PICTURE_NOT_FOUND);
        const url = await this._fileStorage.getSignedViewUrl(raw, 3600);
        reply.send(success({ url }));
    };

    createProfile = async (
        request: FastifyRequest<{ Body: IProfileBody }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CandidateProfileMapper.toCreateDTO(request.body, ctx);
        const result = await this._createProfileUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    updateProfile = async (
        request: FastifyRequest<{ Body: Partial<IProfileBody> }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CandidateProfileMapper.toUpdateDTO(request.body, ctx);
        const result = await this._updateProfileUseCase.execute(dto);
        reply.send(success(result));
    };

    getAll = async (
        request: FastifyRequest<{ Querystring: { search?: string; status?: string; sortOrder?: 'asc' | 'desc'; page?: string; limit?: string } }>,
        reply: FastifyReply
    ) => {
        const { search, status, sortOrder, page, limit } = request.query;
        const result = await this._getAllCandidatesUseCase.execute(search, status, sortOrder, page, limit);
        reply.send(success(result));
    }


}
