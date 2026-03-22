import type { CompanyDocuments } from '../../../domain/entities/CompanyApprovalEntitie.js';
import type {
  IApproveCompanyInputDTO,
  IMarkCompanyDocumentInputDTO,
  IRejectCompanyInputDTO,
  IToggleCompanyActivityInputDTO,
} from '../dtos/AdminCompanyMutationsDTO.js';

export const AdminCompanyApprovalMutationMapper = {
  toApproveInput(approvalId: string): IApproveCompanyInputDTO {
    return { approvalId };
  },

  toRejectInput(approvalId: string, reason: string): IRejectCompanyInputDTO {
    return { approvalId, reason };
  },

  toToggleActivityInput(userId: string): IToggleCompanyActivityInputDTO {
    return { userId };
  },

  toMarkDocumentInput(
    companyId: string,
    documentKey: keyof CompanyDocuments,
    verified: boolean,
  ): IMarkCompanyDocumentInputDTO {
    return { companyId, documentKey, verified };
  },
};
