export const loginSchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
        },
    },
    response: {
        200: {
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
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
            },
        },
    },
};
