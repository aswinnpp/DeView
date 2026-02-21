import { verifyOtpRequestSchema } from '../../../../Shared/contracts/auth/otp.js';
import { zodBodyParser } from './zodParser.js';

export const verifyOTPBodyParser = zodBodyParser(verifyOtpRequestSchema);

export const verifyOTPSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
};
