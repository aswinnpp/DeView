import { userContractSchema } from '../../../../Shared/contracts/auth/user.js';
import { zodToFastifyBody } from './schemaToFastify.js';

const errorResponse = {
    type: 'object',
    properties: {
        error: { type: 'string' },
    },
};

const messageResponse = {
    type: 'object',
    properties: {
        message: { type: 'string' },
    },
};

export const userSchema = zodToFastifyBody(userContractSchema);

export const getUserSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                data: userSchema,
            },
        },
        404: errorResponse,
    },
};

export { errorResponse, messageResponse };
