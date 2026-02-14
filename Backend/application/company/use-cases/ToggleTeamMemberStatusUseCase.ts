import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class ToggleTeamMemberStatusUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(memberId: string, companyId: string): Promise<{ isActive: boolean }> {
        const user = await this.userRepository.findById(memberId);

        if (!user) {
            throw AppError.notFound('Team member not found');
        }

        // Ensure the member belongs to the requesting company
        if (user.companyId !== companyId) {
            throw AppError.forbidden('You do not have permission to modify this user');
        }

        // Ensure we're only toggling HR or Interviewer accounts
        const role = user.role.getValue();
        if (role !== 'hr' && role !== 'interviewer') {
            throw AppError.badRequest('Can only toggle status of HR or Interviewer accounts');
        }

        // Toggle the status
        if (user.isActive) {
            user.deactivate();
        } else {
            user.activate();
        }

        await this.userRepository.save(user);

        return { isActive: user.isActive };
    }
}
