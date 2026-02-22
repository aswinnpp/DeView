import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../ports/repository/CompanyProfileRepositoryPort";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";
import { SubmitCompanyApprovalDTO } from "../dtos/SubmitCompanyApprovalDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { SubmitCompanyApprovalUseCasePort } from "../ports/usecase/SubmitCompanyApprovalUseCasePort";

@injectable()
export class SubmitCompanyApprovalUseCase implements SubmitCompanyApprovalUseCasePort {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort,
    @inject(TYPES.UserRepositoryPort) private userRepo: UserRepositoryPort
  ) { }

  async execute(dto: SubmitCompanyApprovalDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const existing = await this.repo.findByUserId(dto.userId);

    console.log("ex",existing);
    

    if (existing?.status === "pending") {
      throw AppError.badRequest("You already have a pending approval request");
    }

    if (existing?.status === "approved") {
      throw AppError.conflict("Company already approved");
    }

    // Fetch the user's email from the User collection
    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw AppError.badRequest("User not found");
    }

    // If the user was previously rejected, update the existing record
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

    // Brand new submission
    const approval = new CompanyApproval(
      null,
      dto.userId,
      dto.companyName,
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

