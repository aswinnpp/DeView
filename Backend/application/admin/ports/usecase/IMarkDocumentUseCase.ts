import type { CompanyDocuments } from "../../../../domain/entities/CompanyApprovalEntitie";

export interface IMarkDocumentUseCase {
  execute(
    companyId: string,
    documentKey: keyof CompanyDocuments,
    verified: boolean
  ): Promise<{ documentKey: keyof CompanyDocuments; marked: boolean }>;
}
