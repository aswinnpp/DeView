import {
  candidateProfileSchema,
  candidateProfileUpdateSchema,
} from '../../../../Shared/contracts/candidateProfile/profile.js';
import { zodToFastifyBody } from './schemaToFastify.js';

export const createCandidateProfileSchema = {
  body: zodToFastifyBody(candidateProfileSchema),
};

export const updateCandidateProfileSchema = {
  body: zodToFastifyBody(candidateProfileUpdateSchema),
};
