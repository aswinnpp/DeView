import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";
import { ISubmitCompanyApprovalDTO } from "../dtos/SubmitCompanyApprovalDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { ISubmitCompanyApprovalUseCase } from "../ports/usecase/ISubmitCompanyApprovalUseCase";

@injectable()
export class SubmitCompanyApprovalUseCase implements ISubmitCompanyApprovalUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository,
    @inject(TYPES.UserRepositoryPort) private userRepo: IUserRepository
  ) { }

  async execute(dto: ISubmitCompanyApprovalDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const existing = await this.repo.findByUserId(dto.userId);

   
    

    if (existing?.status === "pending") {
      throw AppError.badRequest("You already have a pending approval request");
    }

    if (existing?.status === "approved") {
      throw AppError.conflict("Company already approved");
    }

    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw AppError.badRequest("User not found");
    }

    if (existing?.status === "rejected") {
      existing.companyName = dto.companyName;
      existing.address = dto.address;
      existing.contactPerson = dto.contactPerson;
      existing.contactEmail = user.email.getValue();
      existing.contactPhone = dto.contactPhone;
      existing.taxId = dto.taxId;
      existing.numberOfEmployees = dto.numberOfEmployees;
      existing.documents = dto.documents;
      existing.website = dto.website;
      existing.status = "pending";
      existing.rejectionReason = undefined;
      existing.updatedAt = new Date();

      await this.repo.save(existing);

      return { approvalId: existing.id };
    }

    const approval = new CompanyApproval(
      null,
      dto.userId,
      dto.companyName,
      dto.location,
      dto.address,
      dto.contactPerson,
      user.email.getValue(),
      dto.contactPhone,
      dto.taxId,
      dto.numberOfEmployees,
      dto.documents,
      dto.website
    );

    await this.repo.save(approval);
    return { approvalId: approval.id ?? null };
  }
}

