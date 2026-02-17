import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { CompanyApprovalRepository } from '../../../domain/company/repositories/CompanyApprovalRepository.js';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';


@injectable()
export class ResolveCompanyForUserUseCase {
    constructor(
        @inject(TYPES.CompanyApprovalRepository) private readonly companyApprovalRepo: CompanyApprovalRepository,
        @inject(TYPES.UserRepository) private readonly userRepo: UserRepository
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
