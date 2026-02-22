import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../../company/ports/repository/CompanyProfileRepositoryPort";
import { AppError } from "../../../shared/errors/AppError";
import type { MarkDocumentUseCasePort } from "../ports/usecase/MarkDocumentUseCasePort";

@injectable()
export class MarkDocumentUseCase implements MarkDocumentUseCasePort {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) { }

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
