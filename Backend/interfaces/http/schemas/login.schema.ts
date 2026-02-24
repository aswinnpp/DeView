import { loginRequestSchema } from '../../../../Shared/contracts/auth/login.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const loginSchema = {
    body: zodToFastifyBody(loginRequestSchema),
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                fullName: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' },
                            },
                            required: ['id', 'fullName', 'email', 'role'],
                        },
                    },
                    required: ['user'],
                },
            },
            required: ['success', 'data'],
        },
    },
};
