import type { CompanyDocuments } from '../../../domain/entities/CompanyApprovalEntitie.js';

/** Company approval / document actions — input + output pairs in one module. */

export interface IApproveCompanyInputDTO {
  approvalId: string;
}

export interface IApproveCompanyOutputDTO {
  ok: true;
}

export interface IRejectCompanyInputDTO {
  approvalId: string;
  reason: string;
}

export interface IRejectCompanyOutputDTO {
  ok: true;
}

/** Route `:id` is the company owner user id (see AdminToggleActivityUseCase). */
export interface IToggleCompanyActivityInputDTO {
  userId: string;
}

export interface IToggleCompanyActivityOutputDTO {
  isActive: boolean;
}

export interface IMarkCompanyDocumentInputDTO {
  companyId: string;
  documentKey: keyof CompanyDocuments;
  verified: boolean;
}

export interface IMarkCompanyDocumentOutputDTO {
  documentKey: keyof CompanyDocuments;
  marked: boolean;
}
