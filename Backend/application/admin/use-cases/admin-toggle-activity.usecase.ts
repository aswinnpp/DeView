import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../../company/ports/repository/ICompanyProfileRepository";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import type { ITokenService } from "../../auth/ports/services/ITokenService";
import { DomainError } from "../../../shared/errors/DomainError";
import type { IAdminToggleActivityUseCase } from "../ports/usecase/IAdminToggleActivityUseCase";

@injectable()
export class AdminToggleActivityUseCase implements IAdminToggleActivityUseCase {
    constructor(
        @inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository,
        @inject(TYPES.UserRepositoryPort) private _userRepo: IUserRepository,
        @inject(TYPES.TokenServicePort) private _tokenService: ITokenService
    ) { }

    async execute(id: string) {

        const user = await this._userRepo.findById(id);

        if (!user) {
            throw new DomainError("User not found");
        }

        const company = await this._repo.findByUserId(id);


        user.isActive = !user.isActive;

        if (company) {
            company.isActive = user.isActive;
            await this._repo.save(company);
        }

        if (!user.isActive && user.id) {
            await this._tokenService.revokeAllUserTokens(user.id);
        }

        await this._userRepo.save(user);


        return { isActive: user.isActive };
    }
}
