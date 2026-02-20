import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../../company/ports/repository/CompanyApprovalRepositoryPort";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { DomainError } from "../../../shared/errors/DomainError";
import type { ToggleCompanyActiveUseCasePort } from "../ports/usecase/ToggleCompanyActiveUseCasePort";

@injectable()
export class ToggleCompanyActiveUseCase implements ToggleCompanyActiveUseCasePort {
    constructor(
        @inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort,
        @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort
    ) { }

    async execute(id: string) {
        const company = await this.repo.findById(id);

        if (!company) {
            throw new DomainError("Company not found");
        }

        const user = await this.userRepo.findByCompanyIdAndRole(id, "company")

        if (!user.length) {
            throw new DomainError("Company user not found");
        }



        user[0].isActive = !user[0].isActive;
        company.isActive = user[0].isActive;

        await this.userRepo.save(user[0]);
        await this.repo.save(company);



        return { isActive: company.isActive };
    }
}
