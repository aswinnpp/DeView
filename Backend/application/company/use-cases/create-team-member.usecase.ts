import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { IUserRepository } from "../../shared/ports/repository/IUserRepository.js";
import { IPasswordHasher } from "../../auth/ports/services/IPasswordHasher.js";
import { IEmailService } from "../../auth/ports/services/IEmailService.js";
import { User } from "../../../domain/user/entities/User.js";
import { Email } from "../../../domain/user/value-objects/Email.js";
import { Role, RoleType } from "../../../domain/user/value-objects/Role.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { ResolveCompanyForUserUseCase } from "./resolve-company-for-user.usecase.js";
import { ICryptoRandom } from "../../shared/ports/services/ICryptoRandom";
import type { ICreateTeamMemberUseCase, ICreateTeamMemberDTO } from "../ports/usecase/ICreateTeamMemberUseCase";

@injectable()
export class CreateTeamMemberUseCase implements ICreateTeamMemberUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly _userRepository: IUserRepository,
        @inject(TYPES.PasswordHasherPort) private readonly _passwordHasher: IPasswordHasher,
        @inject(TYPES.EmailServicePort) private readonly _emailService: IEmailService,
        @inject(ResolveCompanyForUserUseCase) private readonly _resolveCompany: ResolveCompanyForUserUseCase,
        @inject(TYPES.CryptoRandomPort) private readonly _cryptoRandom: ICryptoRandom
    ) {}

    async execute(dto: ICreateTeamMemberDTO): Promise<{ message: string; userId: string }> {
        const companyId = await this._resolveCompany.execute(dto.userId, dto.companyIdFromToken);

        const email = new Email(dto.email);
        const role = new Role(dto.role as RoleType);

        const existing = await this._userRepository.findByEmail(email);
        if (existing) {
            throw AppError.conflict('A user with this email already exists');
        }

          

        const temporaryPassword = this.generatePassword();
        const passwordHash = await this._passwordHasher.hash(temporaryPassword);

        const user = User.create({
            fullName: dto.fullName,
            email,
            passwordHash,
            role,
            companyId,
            createdAt: new Date(),
        });

        user.markEmailAsVerified();
        await this._userRepository.save(user);

        await this._emailService.sendWelcomeEmail(
            dto.email,
            dto.fullName,
            dto.role,
            temporaryPassword
        );

        const roleLabel = dto.role === 'hr' ? 'HR' : 'Interviewer';
        return {
            message: `${roleLabel} account created successfully`,
            userId: user.id || '',
        };
    }

    private generatePassword(): string {
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

        return this._cryptoRandom.generateRandomString(12, chars);
    }
}
