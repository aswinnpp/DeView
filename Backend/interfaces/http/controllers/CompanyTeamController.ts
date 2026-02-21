import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { HttpStatus } from '../../../shared/http/HttpStatus';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { CreateTeamMemberUseCasePort } from '../../../application/company/ports/usecase/CreateTeamMemberUseCasePort.js';
import type { ListTeamMembersUseCasePort } from '../../../application/company/ports/usecase/ListTeamMembersUseCasePort.js';
import type { ToggleTeamMemberStatusUseCasePort } from '../../../application/company/ports/usecase/ToggleTeamMemberStatusUseCasePort.js';
import { CompanyTeamMapper } from '../mappers/CompanyTeamMapper.js';

interface CreateBody {
    fullName: string;
    email: string;
}

interface ToggleParams {
    id: string;
}

interface SearchQuery {
    search?: string;
    status?: string;
}

@injectable()
export class CompanyTeamController {
    constructor(
        @inject(TYPES.CreateTeamMemberUseCasePort) private readonly createTeamMemberUseCase: CreateTeamMemberUseCasePort,
        @inject(TYPES.ListTeamMembersUseCasePort) private readonly listTeamMembersUseCase: ListTeamMembersUseCasePort,
        @inject(TYPES.ToggleTeamMemberStatusUseCasePort) private readonly toggleTeamMemberStatusUseCase: ToggleTeamMemberStatusUseCasePort
    ) {}

    listHRs = async (
        request: FastifyRequest<{ Querystring: SearchQuery }>,
        reply: FastifyReply
    ) => {
        const { userId, companyId } = request.currentUser;
        const { search, status } = request.query;
        const result = await this.listTeamMembersUseCase.execute(userId, companyId, 'hr', search, status);
        reply.send(success(result));
    };

    createHR = async (
        request: FastifyRequest<{ Body: CreateBody }>,
        reply: FastifyReply
    ) => {
        const dto = CompanyTeamMapper.toCreateHRDTO(request.body, request.currentUser);
        const result = await this.createTeamMemberUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    toggleHRStatus = async (
        request: FastifyRequest<{ Params: ToggleParams }>,
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
        request: FastifyRequest<{ Querystring: SearchQuery }>,
        reply: FastifyReply
    ) => {
        const { userId, companyId } = request.currentUser;
        const { search, status } = request.query;
        const result = await this.listTeamMembersUseCase.execute(userId, companyId, 'interviewer', search, status);
        reply.send(success(result));
    };

    createInterviewer = async (
        request: FastifyRequest<{ Body: CreateBody }>,
        reply: FastifyReply
    ) => {
        const dto = CompanyTeamMapper.toCreateInterviewerDTO(request.body, request.currentUser);
        const result = await this.createTeamMemberUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    toggleInterviewerStatus = async (
        request: FastifyRequest<{ Params: ToggleParams }>,
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
