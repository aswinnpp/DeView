import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";

export class GetApprovedCompaniesUseCase {
    constructor(private repo: CompanyApprovalRepository) { }

    async execute(search?: string) {
        return await this.repo.searchApproved(search);
    }
}
