export const resetPasswordSchema = {
    body: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
            email: { type: 'string', format: 'email' },
            otp: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
