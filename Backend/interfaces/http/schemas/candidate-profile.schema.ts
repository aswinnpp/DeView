import {
  candidateProfileSchema,
  candidateProfileUpdateSchema,
} from '../../../../Shared/contracts/candidateProfile/profile.js';
import { zodParseBody, zodToFastifyBody } from './schemaToFastify.js';

export const createCandidateProfileSchema = {
  body: zodToFastifyBody(candidateProfileSchema),
};

export const updateCandidateProfileSchema = {
  body: zodToFastifyBody(candidateProfileUpdateSchema),
};

export const createCandidateProfileBodyParser = zodParseBody(candidateProfileSchema);
export const updateCandidateProfileBodyParser = zodParseBody(candidateProfileUpdateSchema);
