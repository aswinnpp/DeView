import { CompanyApprovalRepository } from '../../../domain/company/repositories/CompanyApprovalRepository.js';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

/**
 * Resolves the company ID for the current user.
 * Uses companyId from token if present; otherwise loads approved company approval and backfills user.companyId.
 * @throws AppError.forbidden when user has no associated company
 */
export class ResolveCompanyForUserUseCase {
    constructor(
        private readonly companyApprovalRepo: CompanyApprovalRepository,
        private readonly userRepo: UserRepository
    ) {}

    async execute(userId: string, companyIdFromToken?: string): Promise<string> {
        if (companyIdFromToken) {
            return companyIdFromToken;
        }

        const approval = await this.companyApprovalRepo.findByUserId(userId);
        if (!approval || approval.status !== 'approved' || !approval.id) {
            throw AppError.forbidden('No company associated with this account');
        }

        const user = await this.userRepo.findById(userId);
        if (user) {
            user.companyId = approval.id;
            await this.userRepo.save(user);
        }

        return approval.id;
    }
}
