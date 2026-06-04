import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { HttpStatus } from '../../../shared/http/HttpStatus';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { ICreateTeamMemberUseCase } from '../../../application/company/ports/usecase/ICreateTeamMemberUseCase.js';
import type { IListTeamMembersUseCase } from '../../../application/company/ports/usecase/IListTeamMembersUseCase.js';
import type { IToggleTeamMemberStatusUseCase } from '../../../application/company/ports/usecase/IToggleTeamMemberStatusUseCase.js';
import { CompanyTeamMapper } from '../../../application/company/mappers/CompanyTeamMapper.js';
import type { IGetMyInterviewerSlotsUseCase } from "../../../application/interviewer/ports/usecase/IGetMyInterviewerSlotsUseCase.js";

interface ICreateBody {
    fullName: string;
    email: string;
}

interface IToggleParams {
    id: string;
}

interface IInterviewerIdParams {
    id: string;
}

interface ISearchQuery {
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
}

interface IInterviewerSlotsQuery {
    slotDate?: string;
}

@injectable()
export class CompanyTeamController {
    constructor(
        @inject(TYPES.CreateTeamMemberUseCasePort) private readonly _createTeamMemberUseCase: ICreateTeamMemberUseCase,
        @inject(TYPES.ListTeamMembersUseCasePort) private readonly _listTeamMembersUseCase: IListTeamMembersUseCase,
        @inject(TYPES.ToggleTeamMemberStatusUseCasePort) private readonly _toggleTeamMemberStatusUseCase: IToggleTeamMemberStatusUseCase,
        @inject(TYPES.GetMyInterviewerSlotsUseCasePort) private readonly _getInterviewerSlotsUseCase: IGetMyInterviewerSlotsUseCase,
    ) {}

    listHRs = async (
        request: FastifyRequest<{ Querystring: ISearchQuery }>,
        reply: FastifyReply
    ) => {
        const input = CompanyTeamMapper.toListMembersInput(request.query, request.currentUser, 'hr');
        const result = await this._listTeamMembersUseCase.execute(
            input.userId,
            input.companyIdFromToken,
            input.role,
            input.search,
            input.status,
            input.page,
            input.limit
        );
        reply.send(success(result));
    };

    createHR = async (
        request: FastifyRequest<{ Body: ICreateBody }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CompanyTeamMapper.toCreateHRDTO(request.body, ctx);
        const result = await this._createTeamMemberUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    toggleHRStatus = async (
        request: FastifyRequest<{ Params: IToggleParams }>,
        reply: FastifyReply
    ) => {
        const input = CompanyTeamMapper.toToggleMemberStatusInput(request.params, request.currentUser);
        const result = await this._toggleTeamMemberStatusUseCase.execute(
            input.memberId,
            input.userId,
            input.companyIdFromToken
        );
        reply.send(success(result));
    };

    listInterviewers = async (
        request: FastifyRequest<{ Querystring: ISearchQuery }>,
        reply: FastifyReply
    ) => {
        const input = CompanyTeamMapper.toListMembersInput(request.query, request.currentUser, 'interviewer');
        const result = await this._listTeamMembersUseCase.execute(
            input.userId,
            input.companyIdFromToken,
            input.role,
            input.search,
            input.status,
            input.page,
            input.limit
        );
        reply.send(success(result));
    };

    createInterviewer = async (
        request: FastifyRequest<{ Body: ICreateBody }>,
        reply: FastifyReply
    ) => {
        const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
        const dto = CompanyTeamMapper.toCreateInterviewerDTO(request.body, ctx);
        const result = await this._createTeamMemberUseCase.execute(dto);
        reply.code(HttpStatus.CREATED).send(success(result));
    };

    toggleInterviewerStatus = async (
        request: FastifyRequest<{ Params: IToggleParams }>,
        reply: FastifyReply
    ) => {
        const input = CompanyTeamMapper.toToggleMemberStatusInput(request.params, request.currentUser);
        const result = await this._toggleTeamMemberStatusUseCase.execute(
            input.memberId,
            input.userId,
            input.companyIdFromToken
        );
        reply.send(success(result));
    };

    getInterviewerSlots = async (
        request: FastifyRequest<{ Params: IInterviewerIdParams; Querystring: IInterviewerSlotsQuery }>,
        reply: FastifyReply,
    ) => {
        const input = CompanyTeamMapper.toGetInterviewerSlotsInput(request.params, request.query ?? {}, request.currentUser);
        const result = await this._getInterviewerSlotsUseCase.execute(input);
        reply.send(success(result));
    };
}
