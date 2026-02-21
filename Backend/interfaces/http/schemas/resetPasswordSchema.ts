import { resetPasswordRequestSchema } from '../../../../Shared/contracts/auth/resetPassword.js';
import { zodBodyParser } from './zodParser.js';

export const resetPasswordBodyParser = zodBodyParser(resetPasswordRequestSchema);

export const resetPasswordSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
