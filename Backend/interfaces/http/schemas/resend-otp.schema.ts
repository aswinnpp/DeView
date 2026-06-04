import { resendOtpRequestSchema } from '../../../../Shared/contracts/auth/otp.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const resendOTPSchema = {
    body: zodToFastifyBody(resendOtpRequestSchema),
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
