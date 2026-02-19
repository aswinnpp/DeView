import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { DomainError } from "../../../shared/errors/DomainError";

@injectable()
export class ToggleCompanyActiveUseCase {
    constructor(
        @inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository,
        @inject(TYPES.UserRepository) private userRepo: UserRepository
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
