import { registerRequestSchema } from '../../../../Shared/contracts/auth/register.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const registerSchema = {
    body: zodToFastifyBody(registerRequestSchema),
    response: {
        201: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                email: { type: 'string' },
            },
        },
    },
};
