import { verifyOtpRequestSchema } from '../../../../Shared/contracts/auth/otp.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const verifyPasswordResetOTPSchema = {
    body: zodToFastifyBody(verifyOtpRequestSchema),
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
            },
        },
    },
};
