import type { ChangePasswordRequest } from '../../../../Shared/contracts/auth/changePassword';
import { changePasswordRequestSchema } from '../../../../Shared/contracts/auth/changePassword.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const changePasswordSchema = {
  body: zodToFastifyBody(changePasswordRequestSchema),
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};

