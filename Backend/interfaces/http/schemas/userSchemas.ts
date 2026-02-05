// Common error response schema
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

// User Schema
export const userSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
        isEmailVerified: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
    },
};

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
