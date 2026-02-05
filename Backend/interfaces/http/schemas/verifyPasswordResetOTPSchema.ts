export const verifyPasswordResetOTPSchema = {
    body: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
            email: { type: 'string', format: 'email' },
            otp: { type: 'string', minLength: 4, maxLength: 4 },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                valid: { type: 'boolean' },
            },
        },
    },
};
