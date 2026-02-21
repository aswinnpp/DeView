import { resendOtpRequestSchema } from '../../../../Shared/contracts/auth/otp.js';
import { zodBodyParser } from './zodParser.js';

export const resendOTPBodyParser = zodBodyParser(resendOtpRequestSchema);

export const resendOTPSchema = {
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
