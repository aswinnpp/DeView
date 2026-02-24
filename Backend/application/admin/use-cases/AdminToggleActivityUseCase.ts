import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../../company/ports/repository/CompanyProfileRepositoryPort";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import type { TokenServicePort } from "../../auth/ports/services/TokenServicePort";
import { DomainError } from "../../../shared/errors/DomainError";
import type { AdminToggleActivityUseCasePort } from "../ports/usecase/ToggleCompanyActiveUseCasePort";

@injectable()
export class AdminToggleActivityUseCase implements AdminToggleActivityUseCasePort {
    constructor(
        @inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort,
        @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort,
        @inject(TYPES.TokenServicePort) private tokenService: TokenServicePort
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
