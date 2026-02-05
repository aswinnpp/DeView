import { TokenServicePort } from '../ports/TokenServicePort';

export interface LogoutRequest {
    refreshTokenHash: string;
}

export class LogoutUseCase {
    constructor(private readonly tokenService: TokenServicePort) { }

    async execute(request: LogoutRequest): Promise<void> {
        await this.tokenService.revokeRefreshToken(request.refreshTokenHash);
    }
}
