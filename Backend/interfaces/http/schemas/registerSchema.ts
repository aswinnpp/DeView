export const registerSchema = {
    body: {
        type: 'object',
        required: ['fullName', 'email', 'password', 'role'],
        properties: {
            fullName: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['admin', 'company', 'hr', 'interviewer', 'candidate'] },
        },
    },
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
