import { UseCases } from './useCases.js';
import { Services } from './services.js';
import { Repositories } from './repositories.js';

import { AuthController } from '../../interfaces/http/controllers/AuthController.js';
import { GoogleAuthController } from '../../interfaces/http/controllers/GoogleAuthController.js';

export interface Controllers {
    authController: AuthController;
    googleAuthController: GoogleAuthController;
}

export function createControllers(
    useCases: UseCases,
    services: Services,
    repositories: Repositories
): Controllers {
    return {
        authController: new AuthController(
            useCases.registerUserUseCase,
            useCases.verifyOTPUseCase,
            useCases.loginUseCase,
            useCases.resendOTPUseCase,
            useCases.refreshTokenUseCase,
            useCases.forgotPasswordUseCase,
            useCases.verifyPasswordResetOTPUseCase,
            useCases.resetPasswordUseCase,
            services.tokenService
        ),
        googleAuthController: new GoogleAuthController(
            services.googleAuthService,
            services.tokenService,
            repositories.userRepository
        ),
    };
}
