import { FastifyRequest, FastifyReply } from 'fastify';
import { CompanyApprovalUseCase } from '../../../application/company/CompanyApprovalUseCase.js';
import { CompanyDocuments } from '../../../infrastructure/persistence/mongodb/schemas/CompanyApprovalDocument.js';

interface CheckStatusBody {
    userId: string;
}

interface SubmitApprovalBody {
    companyName: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    taxId: string;
    website?: string;
    numberOfEmployees: string;
    documents: CompanyDocuments;
}

export class CompanyApprovalController {
    constructor(
        private readonly companyApprovalUseCase: CompanyApprovalUseCase
    ) {
        this.checkStatus = this.checkStatus.bind(this);
        this.submit = this.submit.bind(this);
    }

    /**
     * POST /company/check-status
     * Check if company approval exists for a user (used during login)
     */
    async checkStatus(
        request: FastifyRequest<{ Body: CheckStatusBody }>,
        reply: FastifyReply
    ): Promise<void> {
        const result = await this.companyApprovalUseCase.checkStatus(request.body);

        if (!result.success) {
            return reply.status(400).send({ error: result.error });
        }

        return reply.status(200).send(result.data);
    }

    /**
     * POST /company/submit
     * Submit a new company approval request
     */
    async submit(
        request: FastifyRequest<{ Body: SubmitApprovalBody }>,
        reply: FastifyReply
    ): Promise<void> {
        // Get userId from JWT token
        const user = (request as any).user;

        if (!user?.id) {
            return reply.status(401).send({ error: 'Unauthorized - Please login first' });
        }

        const result = await this.companyApprovalUseCase.submit({
            userId: user.id,
            ...request.body
        });

        if (!result.success) {
            return reply.status(400).send({ error: result.error });
        }

        return reply.status(201).send({
            message: result.message,
            approvalId: result.data.approvalId
        });
    }
}
