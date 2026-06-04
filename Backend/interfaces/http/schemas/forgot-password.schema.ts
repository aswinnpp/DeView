import { forgotPasswordRequestSchema } from '../../../../Shared/contracts/auth/forgotPassword.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const forgotPasswordSchema = {
    body: zodToFastifyBody(forgotPasswordRequestSchema),
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
