import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { CompanyProfileRepositoryPort } from '../ports/repository/CompanyProfileRepositoryPort.js';
import { UserRepositoryPort } from '../../shared/ports/repository/UserRepositoryPort.js';
import { AppError } from '../../../shared/errors/AppError.js';


@injectable()
export class ResolveCompanyForUserUseCase {
    constructor(
@inject(TYPES.CompanyProfileRepositoryPort) private readonly companyProfileRepo: CompanyProfileRepositoryPort,
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: UserRepositoryPort
    ) {}

    async execute(userId: string, companyIdFromToken?: string): Promise<string> {
        if (companyIdFromToken) {
            return companyIdFromToken;
        }

        const approval = await this.companyProfileRepo.findByUserId(userId);
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
