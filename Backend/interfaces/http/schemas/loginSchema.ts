import { loginRequestSchema } from '../../../../Shared/contracts/auth/login.js';
import { zodBodyParser } from './zodParser.js';

export const loginBodyParser = zodBodyParser(loginRequestSchema);

export const loginSchema = {
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
