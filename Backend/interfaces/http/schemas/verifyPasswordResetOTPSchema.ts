import { verifyOtpRequestSchema } from '../../../../Shared/contracts/auth/otp.js';
import { zodBodyParser } from './zodParser.js';

export const verifyPasswordResetOTPBodyParser = zodBodyParser(verifyOtpRequestSchema);

export const verifyPasswordResetOTPSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
            },
        },
    },
};
