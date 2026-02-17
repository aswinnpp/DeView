import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CompanyApprovalRepository } from "../../../domain/company/repositories/CompanyApprovalRepository";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
import { DomainError } from "../../../shared/errors/DomainError";

@injectable()
export class ToggleCompanyActiveUseCase {
    constructor(
        @inject(TYPES.CompanyApprovalRepository) private repo: CompanyApprovalRepository,
        @inject(TYPES.UserRepository) private userRepo: UserRepository
    ) {}

    async execute(id: string) {
        const company = await this.repo.findById(id);

        if (!company) {
            throw new DomainError("Company not found");
        }

        if (company.isActive) {
            company.deactivate();
        } else {
            company.activate();
        }

        await this.repo.save(company);

        // Sync User collection: update company owner and all HR/Interviewer users for this company
        const companyId = company.id;
        if (companyId) {
            // Company owner (user who submitted approval)
            const owner = await this.userRepo.findById(company.userId);
            if (owner) {
                if (company.isActive) owner.activate();
                else owner.deactivate();
                await this.userRepo.save(owner);
            }

            // All HR and Interviewer users under this company
            const [hrUsers, interviewerUsers] = await Promise.all([
                this.userRepo.findByCompanyIdAndRole(companyId, 'hr'),
                this.userRepo.findByCompanyIdAndRole(companyId, 'interviewer'),
            ]);
            for (const user of [...hrUsers, ...interviewerUsers]) {
                if (company.isActive) user.activate();
                else user.deactivate();
                await this.userRepo.save(user);
            }
        }

        return { isActive: company.isActive };
    }
}
