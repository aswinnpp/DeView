import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import { AppError } from "../../../shared/errors/AppError";
import type { IMarkDocumentUseCase } from "../ports/usecase/IMarkDocumentUseCase";

@injectable()
export class MarkDocumentUseCase implements IMarkDocumentUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) { }

    async execute(companyId: string, documentKey: Parameters<IMarkDocumentUseCase["execute"]>[1], verified: boolean) {
        const company = await this._repo.findById(companyId);

        if (!company) {
            throw AppError.notFound("Company approval not found");
        }

        company.markDocument(documentKey, verified);
        await this._repo.save(company);

        return { documentKey, marked: verified };
    }
}
