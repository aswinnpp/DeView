import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { HttpStatus } from '../../../shared/http/HttpStatus';
import { CreateTeamMemberUseCase } from '../../../application/company/use-cases/CreateTeamMemberUseCase.js';
import { ListTeamMembersUseCase } from '../../../application/company/use-cases/ListTeamMembersUseCase.js';
import { ToggleTeamMemberStatusUseCase } from '../../../application/company/use-cases/ToggleTeamMemberStatusUseCase.js';

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
        @inject(CreateTeamMemberUseCase) private readonly createTeamMemberUseCase: CreateTeamMemberUseCase,
        @inject(ListTeamMembersUseCase) private readonly listTeamMembersUseCase: ListTeamMembersUseCase,
        @inject(ToggleTeamMemberStatusUseCase) private readonly toggleTeamMemberStatusUseCase: ToggleTeamMemberStatusUseCase
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
        const { userId, companyId } = request.currentUser;
        const result = await this.createTeamMemberUseCase.execute({
            fullName: request.body.fullName,
            email: request.body.email,
            role: 'hr',
            userId,
            companyIdFromToken: companyId,
        });
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
        const { userId, companyId } = request.currentUser;
        const result = await this.createTeamMemberUseCase.execute({
            fullName: request.body.fullName,
            email: request.body.email,
            role: 'interviewer',
            userId,
            companyIdFromToken: companyId,
        });
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
