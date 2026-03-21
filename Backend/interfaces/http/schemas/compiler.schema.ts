import { z } from 'zod';
import { zodToFastifyBody } from './schemaToFastify.js';

const MAX_SOURCE_CODE_CHARS = 20000;

export const executeCodeSchema = {
  body: zodToFastifyBody(
    z.object({
      code: z.string().min(1).max(MAX_SOURCE_CODE_CHARS),
      languageId: z.number().int().positive(),
      stdin: z.string().optional(),
    })
  ),
};
