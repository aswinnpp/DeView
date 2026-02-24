import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { ICompanyProfileRepository } from '../ports/repository/ICompanyProfileRepository.js';
import { IUserRepository } from '../../shared/ports/repository/IUserRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';


@injectable()
export class ResolveCompanyForUserUseCase {
    constructor(
@inject(TYPES.CompanyProfileRepositoryPort) private readonly companyProfileRepo: ICompanyProfileRepository,
    @inject(TYPES.UserRepositoryPort) private readonly userRepo: IUserRepository
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
