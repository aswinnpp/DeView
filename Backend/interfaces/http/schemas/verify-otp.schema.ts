import { verifyOtpRequestSchema } from '../../../../Shared/contracts/auth/otp.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const verifyOTPSchema = {
    body: zodToFastifyBody(verifyOtpRequestSchema),
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
