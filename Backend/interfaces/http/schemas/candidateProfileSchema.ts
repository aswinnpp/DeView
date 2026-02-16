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
