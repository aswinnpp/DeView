import {
  candidateProfileSchema,
  candidateProfileUpdateSchema,
} from '../../../../Shared/contracts/candidateProfile/profile.js';
import { zodToFastifyBody } from './schemaToFastify.js';

/** POST /candidate/profile — body validated by Fastify from Shared contract */
export const createCandidateProfileSchema = {
  body: zodToFastifyBody(candidateProfileSchema),
};

/** PATCH /candidate/profile — body validated by Fastify from Shared contract */
export const updateCandidateProfileSchema = {
  body: zodToFastifyBody(candidateProfileUpdateSchema),
};
