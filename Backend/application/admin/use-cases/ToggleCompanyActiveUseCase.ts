import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../../company/ports/repository/CompanyProfileRepositoryPort";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import type { TokenServicePort } from "../../auth/ports/services/TokenServicePort";
import { DomainError } from "../../../shared/errors/DomainError";
import type { ToggleCompanyActiveUseCasePort } from "../ports/usecase/ToggleCompanyActiveUseCasePort";

@injectable()
export class ToggleCompanyActiveUseCase implements ToggleCompanyActiveUseCasePort {
    constructor(
        @inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort,
        @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort,
        @inject(TYPES.TokenServicePort) private tokenService: TokenServicePort
    ) { }

    async execute(id: string) {
        const company = await this.repo.findById(id);

        if (!company) {
            throw new DomainError("Company not found");
        }

        const user = await this.userRepo.findByCompanyIdAndRole(id, "company");

        if (!user.data.length) {
            throw new DomainError("Company user not found");
        }

        user.data[0].isActive = !user.data[0].isActive;
        company.isActive = user.data[0].isActive;

        if (!user.data[0].isActive && user.data[0].id) {
            await this.tokenService.revokeAllUserTokens(user.data[0].id);
        }

        await this.userRepo.save(user.data[0]);
        await this.repo.save(company);



        return { isActive: company.isActive };
    }
}
