export const resendOTPSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                email: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
};
