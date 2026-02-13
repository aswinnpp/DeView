import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { CompanyApproval } from "../../../domain/company/entities/CompanyApprovalEntitie";
import { SubmitCompanyApprovalDTO } from "../dtos/SubmitCompanyApprovalDTO";
import { AppError } from "../../../shared/errors/AppError";

export class SubmitCompanyApprovalUseCase {
  constructor(
    private repo: CompanyApprovalRepository,
    private userRepo: UserRepository
  ) { }

  async execute(dto: SubmitCompanyApprovalDTO) {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }

    const existing = await this.repo.findById(dto.userId);

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

    const approvalId = await this.repo.save(approval);

    return {
      approvalId,
    };
  }
}
