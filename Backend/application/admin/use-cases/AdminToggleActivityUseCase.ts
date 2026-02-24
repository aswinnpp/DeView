import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import type { ITokenService } from "../../auth/ports/services/ITokenService";
import { DomainError } from "../../../shared/errors/DomainError";
import type { IAdminToggleActivityUseCase } from "../ports/usecase/IAdminToggleActivityUseCase";

@injectable()
export class AdminToggleActivityUseCase implements IAdminToggleActivityUseCase {
    constructor(
        @inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository,
        @inject(TYPES.UserRepositoryPort) private userRepo: IUserRepository,
        @inject(TYPES.TokenServicePort) private tokenService: ITokenService
    ) { }

    async execute(id: string) {

        const user = await this.userRepo.findById(id);

        if (!user) {
            throw new DomainError("User not found");
        }

        const company = await this.repo.findByUserId(id);


        user.isActive = !user.isActive;

        if (company) {
            company.isActive = user.isActive;
            await this.repo.save(company);
        }

        if (!user.isActive && user.id) {
            await this.tokenService.revokeAllUserTokens(user.id);
        }

        await this.userRepo.save(user);


        return { isActive: user.isActive };
    }
}
