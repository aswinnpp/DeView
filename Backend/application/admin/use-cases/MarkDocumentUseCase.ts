import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { AppError } from "../../../shared/errors/AppError";

export class MarkDocumentUseCase {
    constructor(private repo: CompanyApprovalRepository) { }

    async execute(companyId: string, documentKey: string, verified: boolean) {
        const company = await this.repo.findById(companyId);

        if (!company) {
            throw AppError.notFound("Company approval not found");
        }

        company.markDocument(documentKey, verified);
        await this.repo.save(company);

        return { documentKey, marked: verified };
    }
}
