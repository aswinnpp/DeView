import { Repositories } from './repositories.js';
import { Services } from './services.js';

import { RegisterUserUseCase } from '../../application/auth/use-cases/RegisterUserUseCase.js';
import { VerifyOTPUseCase } from '../../application/auth/use-cases/VerifyOTPUseCase.js';
import { LoginUseCase } from '../../application/auth/use-cases/LoginUseCase.js';
import { ResendOTPUseCase } from '../../application/auth/use-cases/ResendOTPUseCase.js';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../../application/auth/use-cases/LogoutUseCase.js';
import { ForgotPasswordUseCase } from '../../application/auth/use-cases/ForgotPasswordUseCase.js';
import { VerifyPasswordResetOTPUseCase } from '../../application/auth/use-cases/VerifyPasswordResetOTPUseCase.js';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/ResetPasswordUseCase.js';
import { GoogleTokenExchangeUseCase } from '../../application/auth/use-cases/GoogleTokenExchangeUseCase.js';

export interface UseCases {
    // Auth
    registerUserUseCase: RegisterUserUseCase;
    verifyOTPUseCase: VerifyOTPUseCase;
    loginUseCase: LoginUseCase;
    resendOTPUseCase: ResendOTPUseCase;
    refreshTokenUseCase: RefreshTokenUseCase;
    logoutUseCase: LogoutUseCase;
    forgotPasswordUseCase: ForgotPasswordUseCase;
    verifyPasswordResetOTPUseCase: VerifyPasswordResetOTPUseCase;
    resetPasswordUseCase: ResetPasswordUseCase;
    googleTokenExchangeUseCase: GoogleTokenExchangeUseCase;
}

export function createUseCases(repositories: Repositories, services: Services): UseCases {
    const {
        userRepository,
        otpRepository,
    } = repositories;

    const { passwordHasher, tokenService, emailService } = services;

    return {
        // Auth
        registerUserUseCase: new RegisterUserUseCase(userRepository, otpRepository, passwordHasher, emailService),
        verifyOTPUseCase: new VerifyOTPUseCase(userRepository, otpRepository),
        loginUseCase: new LoginUseCase(userRepository, passwordHasher, tokenService),
        resendOTPUseCase: new ResendOTPUseCase(userRepository, otpRepository, emailService),
        refreshTokenUseCase: new RefreshTokenUseCase(tokenService, userRepository),
        logoutUseCase: new LogoutUseCase(tokenService),
        forgotPasswordUseCase: new ForgotPasswordUseCase(userRepository, otpRepository, emailService),
        verifyPasswordResetOTPUseCase: new VerifyPasswordResetOTPUseCase(otpRepository),
        resetPasswordUseCase: new ResetPasswordUseCase(userRepository, otpRepository, passwordHasher, tokenService),
        googleTokenExchangeUseCase: new GoogleTokenExchangeUseCase(),
    };
}
