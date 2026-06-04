import { resetPasswordRequestSchema } from '../../../../Shared/contracts/auth/resetPassword.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const resetPasswordSchema = {
    body: zodToFastifyBody(resetPasswordRequestSchema),
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
