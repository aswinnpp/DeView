import {
    candidateProfileSchema,
    candidateProfileUpdateSchema,
} from '../../../../Shared/contracts/candidateProfile/profile.js';
import { zodBodyParser } from './zodParser.js';

export const createCandidateProfileBodyParser = zodBodyParser(candidateProfileSchema);
export const updateCandidateProfileBodyParser = zodBodyParser(candidateProfileUpdateSchema);

/** POST /candidate/profile — create: all fields required except URL and professional. */
export const createCandidateProfileSchema = {};

/** PATCH /candidate/profile — update: all fields optional; when present, validated. */
export const updateCandidateProfileSchema = {};
