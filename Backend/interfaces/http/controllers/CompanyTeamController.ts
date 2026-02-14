import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateTeamMemberUseCase } from '../../../application/company/use-cases/CreateTeamMemberUseCase.js';
import { ListTeamMembersUseCase } from '../../../application/company/use-cases/ListTeamMembersUseCase.js';
import { ToggleTeamMemberStatusUseCase } from '../../../application/company/use-cases/ToggleTeamMemberStatusUseCase.js';
import { CompanyApprovalRepository } from '../../../domain/company/repositories/CompanyApprovalRepository.js';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';

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

export class CompanyTeamController {
    constructor(
        private readonly createTeamMemberUseCase: CreateTeamMemberUseCase,
        private readonly listTeamMembersUseCase: ListTeamMembersUseCase,
        private readonly toggleTeamMemberStatusUseCase: ToggleTeamMemberStatusUseCase,
        private readonly companyApprovalRepo: CompanyApprovalRepository,
        private readonly userRepo: UserRepository
    ) { }


    private async resolveCompanyId(request: FastifyRequest): Promise<string | null> {
        const { companyId, userId } = request.currentUser;

        if (companyId) return companyId;

        const approval = await this.companyApprovalRepo.findByUserId(userId);
        if (!approval || approval.status !== 'approved' || !approval.id) return null;

        const user = await this.userRepo.findById(userId);
        if (user) {
            user.companyId = approval.id;
            await this.userRepo.save(user);
        }

        return approval.id;
    }

    listHRs = async (
        request: FastifyRequest<{ Querystring: SearchQuery }>,
        reply: FastifyReply
    ) => {
        const companyId = await this.resolveCompanyId(request);

        if (!companyId) {
            reply.code(403).send({ error: 'No company associated with this account' });
            return;
        }

        const { search, status } = request.query;
        const data = await this.listTeamMembersUseCase.execute(companyId, 'hr', search, status);
        reply.send({ data });
    };

    createHR = async (
        request: FastifyRequest<{ Body: CreateBody }>,
        reply: FastifyReply
    ) => {
        const companyId = await this.resolveCompanyId(request);

        if (!companyId) {
            reply.code(403).send({ error: 'No company associated with this account' });
            return;
        }

        const result = await this.createTeamMemberUseCase.execute({
            fullName: request.body.fullName,
            email: request.body.email,
            role: 'hr',
            companyId,
        });

        reply.code(201).send({
            message: 'HR account created successfully',
            userId: result.userId,
        });
    };


    toggleHRStatus = async (
        request: FastifyRequest<{ Params: ToggleParams }>,
        reply: FastifyReply
    ) => {
        const companyId = await this.resolveCompanyId(request);

        if (!companyId) {
            reply.code(403).send({ error: 'No company associated with this account' });
            return;
        }

        const result = await this.toggleTeamMemberStatusUseCase.execute(
            request.params.id,
            companyId
        );

        reply.send({
            message: result.isActive ? 'HR activated' : 'HR deactivated',
            isActive: result.isActive,
        });
    };

    listInterviewers = async (
        request: FastifyRequest<{ Querystring: SearchQuery }>,
        reply: FastifyReply
    ) => {
        const companyId = await this.resolveCompanyId(request);

        if (!companyId) {
            reply.code(403).send({ error: 'No company associated with this account' });
            return;
        }

        const { search, status } = request.query;
        const data = await this.listTeamMembersUseCase.execute(companyId, 'interviewer', search, status);
        reply.send({ data });
    };

    createInterviewer = async (
        request: FastifyRequest<{ Body: CreateBody }>,
        reply: FastifyReply
    ) => {
        const companyId = await this.resolveCompanyId(request);

        if (!companyId) {
            reply.code(403).send({ error: 'No company associated with this account' });
            return;
        }

        const result = await this.createTeamMemberUseCase.execute({
            fullName: request.body.fullName,
            email: request.body.email,
            role: 'interviewer',
            companyId,
        });

        reply.code(201).send({
            message: 'Interviewer account created successfully',
            userId: result.userId,
        });
    };

    toggleInterviewerStatus = async (
        request: FastifyRequest<{ Params: ToggleParams }>,
        reply: FastifyReply
    ) => {
        const companyId = await this.resolveCompanyId(request);

        if (!companyId) {
            reply.code(403).send({ error: 'No company associated with this account' });
            return;
        }

        const result = await this.toggleTeamMemberStatusUseCase.execute(
            request.params.id,
            companyId
        );

        reply.send({
            message: result.isActive ? 'Interviewer activated' : 'Interviewer deactivated',
            isActive: result.isActive,
        });
    };
}

