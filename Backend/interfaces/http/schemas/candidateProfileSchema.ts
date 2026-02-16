import {
    candidateProfileSchema,
    candidateProfileUpdateSchema,
} from '../../../../Shared/contracts/candidateProfile/profile.js';
import { zodToFastifyBody } from './schemaToFastify.js';

/** POST /candidate/profile — create: all fields required except URL and professional. */
export const createCandidateProfileSchema = {
    body: zodToFastifyBody(candidateProfileSchema),
};

/** PATCH /candidate/profile — update: all fields optional; when present, validated. */
export const updateCandidateProfileSchema = {
    body: zodToFastifyBody(candidateProfileUpdateSchema),
};

/** POST /candidate/profile/resume — JSON body: base64 file (no multipart). */
export const uploadResumeSchema = {
    body: {
        type: 'object',
        required: ['fileName', 'fileBase64'],
        properties: {
            fileName: { type: 'string' },
            mimetype: { type: 'string' },
            fileBase64: { type: 'string' },
        },
    },
};
