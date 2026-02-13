import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { DomainError } from "../../../shared/errors/DomainError";

export class ToggleCompanyActiveUseCase {
    constructor(private repo: CompanyApprovalRepository) { }

    async execute(id: string) {
        const company = await this.repo.findById(id);

        if (!company) {
            throw new DomainError("Company not found");
        }

        if (company.isActive) {
            company.deactivate();
        } else {
            company.activate();
        }

        await this.repo.save(company);

        return { isActive: company.isActive };
    }
}
