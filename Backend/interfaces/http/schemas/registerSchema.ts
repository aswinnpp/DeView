import { registerRequestSchema } from '../../../../Shared/contracts/auth/register.js';
import { zodBodyParser } from './zodParser.js';

export const registerBodyParser = zodBodyParser(registerRequestSchema);

export const registerSchema = {
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
