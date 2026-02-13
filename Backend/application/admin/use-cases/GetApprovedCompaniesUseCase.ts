import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class GetApprovedCompaniesUseCase {
    constructor(private repo: CompanyApprovalRepository) { }

    async execute() {
        return await this.repo.findApproved();
    }
}
