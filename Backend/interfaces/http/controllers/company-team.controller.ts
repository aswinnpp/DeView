import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { HttpStatus } from '../../../shared/http/HttpStatus';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { ICreateTeamMemberUseCase } from '../../../application/company/ports/usecase/ICreateTeamMemberUseCase.js';
import type { IListTeamMembersUseCase } from '../../../application/company/ports/usecase/IListTeamMembersUseCase.js';
import type { IToggleTeamMemberStatusUseCase } from '../../../application/company/ports/usecase/IToggleTeamMemberStatusUseCase.js';
import { CompanyTeamMapper } from '../../../application/company/mappers/CompanyTeamMapper.js';

interface ICreateBody {
    fullName: string;
    email: string;
}

interface IToggleParams {
    id: string;
}

interface ISearchQuery {
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
}

@injectable()
export class CompanyTeamController {
    constructor(
        @inject(TYPES.CreateTeamMemberUseCasePort) private readonly createTeamMemberUseCase: ICreateTeamMemberUseCase,
        @inject(TYPES.ListTeamMembersUseCasePort) private readonly listTeamMembersUseCase: IListTeamMembersUseCase,
        @inject(TYPES.ToggleTeamMemberStatusUseCasePort) private readonly toggleTeamMemberStatusUseCase: IToggleTeamMemberStatusUseCase
    ) {}

    listHRs = async (
        request: FastifyRequest<{ Querystring: ISearchQuery }>,
        reply: FastifyReply
    ) => {
        const { userId, companyId } = request.currentUser;
        const { search, status, page, limit } = request.query;
        const result = await this.listTeamMembersUseCase.execute(userId, companyId, 'hr', search, status, page, limit);
        reply.send(success(result));
    };

    createHR = async (
        request: FastifyRequest<{ Body: ICreateBody }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CompanyTeamMapper.toCreateHRDTO(request.body, ctx);
        const result = await this.createTeamMemberUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    toggleHRStatus = async (
        request: FastifyRequest<{ Params: IToggleParams }>,
        reply: FastifyReply
    ) => {
        const { userId, companyId } = request.currentUser;
        

        const result = await this.toggleTeamMemberStatusUseCase.execute(
            request.params.id,
            userId,
            companyId
        );
        reply.send(success(result));
    };

    listInterviewers = async (
        request: FastifyRequest<{ Querystring: ISearchQuery }>,
        reply: FastifyReply
    ) => {
        const { userId, companyId } = request.currentUser;
        const { search, status, page, limit } = request.query;
        const result = await this.listTeamMembersUseCase.execute(userId, companyId, 'interviewer', search, status, page, limit);
        reply.send(success(result));
    };

    createInterviewer = async (
        request: FastifyRequest<{ Body: ICreateBody }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CompanyTeamMapper.toCreateInterviewerDTO(request.body, ctx);
        const result = await this.createTeamMemberUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    toggleInterviewerStatus = async (
        request: FastifyRequest<{ Params: IToggleParams }>,
        reply: FastifyReply
    ) => {
        const { userId, companyId } = request.currentUser;
        const result = await this.toggleTeamMemberStatusUseCase.execute(
            request.params.id,
            userId,
            companyId
        );
        reply.send(success(result));
    };
}
