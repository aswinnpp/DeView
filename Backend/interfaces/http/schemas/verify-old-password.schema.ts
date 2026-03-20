import type { VerifyOldPasswordRequest } from '../../../../Shared/contracts/auth/changePassword';
import { verifyOldPasswordRequestSchema } from '../../../../Shared/contracts/auth/changePassword.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const verifyOldPasswordSchema = {
  body: zodToFastifyBody(verifyOldPasswordRequestSchema),
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};

