import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import type { INotificationRepository } from "../../notification/ports/repository/INotificationRepository.js";
import type { INotificationPublisher } from "../../notification/ports/service/INotificationPublisher.js";
import { CompanyApproval } from "../../../domain/entities/CompanyApprovalEntitie";
import type { CompanyDocuments } from "../../../domain/entities/CompanyApprovalEntitie";
import type { ISubmitCompanyApprovalInputDTO } from '../dtos/CompanyApprovalDTO.js';
import { AppError } from "../../../shared/errors/AppError";
import type { ISubmitCompanyApprovalUseCase } from "../ports/usecase/ISubmitCompanyApprovalUseCase";

function toCompanyDocuments(input: ISubmitCompanyApprovalInputDTO["documents"]): CompanyDocuments {
  const convert = (doc?: { fileName: string; fileUrl: string; uploadedAt: string; marked?: boolean }) => {
    if (!doc) return undefined;
    return {
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      uploadedAt: new Date(doc.uploadedAt),
      marked: Boolean(doc.marked),
    };
  };

  return {
    certificateOfIncorporation: convert(input.certificateOfIncorporation),
    gstCertificate: convert(input.gstCertificate),
    panCard: convert(input.panCard),
    addressProof: convert(input.addressProof),
    authorizedSignatoryId: convert(input.authorizedSignatoryId),
    bankDocument: convert(input.bankDocument),
  };
}

@injectable()
export class SubmitCompanyApprovalUseCase implements ISubmitCompanyApprovalUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository,
    @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository,
    @inject(TYPES.NotificationRepositoryPort) private _notificationRepo: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort) private _notificationPublisher: INotificationPublisher
  ) { }

  async execute(dto: ISubmitCompanyApprovalInputDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const existing = await this._repo.findByUserId(dto.userId);

   
    

    if (existing?.status === "pending") {
      throw AppError.badRequest("You already have a pending approval request");
    }

    if (existing?.status === "approved") {
      throw AppError.conflict("Company already approved");
    }

    const user = await this._userRepo.findById(dto.userId);
    if (!user) {
      throw AppError.badRequest("User not found");
    }
    const normalizedDocuments = toCompanyDocuments(dto.documents);

    if (existing?.status === "rejected") {
      existing.companyName = dto.companyName;
      existing.address = dto.address;
      existing.contactPerson = dto.contactPerson;
      existing.contactEmail = user.email.getValue();
      existing.contactPhone = dto.contactPhone;
      existing.taxId = dto.taxId;
      existing.numberOfEmployees = dto.numberOfEmployees;
      existing.documents = normalizedDocuments;
      existing.website = dto.website;
      existing.status = "pending";
      existing.rejectionReason = undefined;
      existing.updatedAt = new Date();

      await this._repo.save(existing);
      await this._notifyAdmins(existing.id ?? '', dto.companyName);

      return { approvalId: existing.id };
    }

    const approval = new CompanyApproval(
      null,
      dto.userId,
      dto.companyName,
      undefined,
      dto.location,
      dto.address,
      dto.contactPerson,
      user.email.getValue(),
      dto.contactPhone,
      dto.taxId,
      dto.numberOfEmployees,
      normalizedDocuments,
      dto.website
    );

    await this._repo.save(approval);
    await this._notifyAdmins(approval.id ?? '', dto.companyName);
    return { approvalId: approval.id ?? null };
  }

  private async _notifyAdmins(approvalId: string, companyName: string): Promise<void> {
    const adminIds = await this._userRepo.listActiveUserIdsByRole('admin');
    if (adminIds.length === 0) return;

    await Promise.all(
      adminIds.map(async (adminUserId) => {
        const notification = await this._notificationRepo.create({
          recipientType: 'USER',
          recipientId: adminUserId,
          type: 'NEW_COMPANY_REGISTRATION',
          title: 'New company registration',
          message: `${companyName} submitted a company approval request.`,
          data: { approvalId, companyName },
        });

        await this._notificationPublisher.publish({
          recipientType: 'USER',
          recipientId: adminUserId,
          notification,
        });
      })
    );
  }
}

