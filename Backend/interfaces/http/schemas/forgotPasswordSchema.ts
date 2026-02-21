import { forgotPasswordRequestSchema } from '../../../../Shared/contracts/auth/forgotPassword.js';
import { zodBodyParser } from './zodParser.js';

export const forgotPasswordBodyParser = zodBodyParser(forgotPasswordRequestSchema);

export const forgotPasswordSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
