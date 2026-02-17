import { Container } from 'inversify';
import type { Db } from 'mongodb';
import type { RedisClientType } from 'redis';

import { TYPES } from './types.js';
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { MongoCompanyApprovalRepository } from '../persistence/mongodb/repositories/MongoCompanyApprovalRepository.js';
import { MongoCandidateProfileRepository } from '../persistence/mongodb/repositories/MongoCandidateProfileRepository.js';
import { RedisOTPRepository } from '../persistence/redis/RedisOTPRepository.js';
import { RedisOAuthSessionRepository } from '../persistence/redis/RedisOAuthSessionRepository.js';
import { UserDocument } from '../persistence/mongodb/schemas/UserDocument.js';
import { CompanyApprovalDocument } from '../persistence/mongodb/schemas/CompanyApprovalDocument.js';
import { CandidateProfileDocument } from '../persistence/mongodb/schemas/CandidateProfileDocument.js';

/**
 * Helper functions to create repository instances
 */
const createUserRepository = (db: Db) => 
  new MongoUserRepository(db.collection<UserDocument>('users'));

const createCompanyApprovalRepository = (db: Db) => 
  new MongoCompanyApprovalRepository(db.collection<CompanyApprovalDocument>('companyApprovals'));

const createCandidateProfileRepository = (db: Db) => 
  new MongoCandidateProfileRepository(db.collection<CandidateProfileDocument>('candidateProfiles'));

const createOTPRepository = (redis: RedisClientType) => 
  new RedisOTPRepository(redis);

const createOAuthSessionRepository = (redis: RedisClientType) => 
  new RedisOAuthSessionRepository(redis);

/**
 */
export function bindRepositories(container: Container): void {
  container.bind(TYPES.UserRepository).toDynamicValue(() => 
    createUserRepository(container.get<Db>(TYPES.Db))
  );

  container.bind(TYPES.CompanyApprovalRepository).toDynamicValue(() => 
    createCompanyApprovalRepository(container.get<Db>(TYPES.Db))
  );

  container.bind(TYPES.CandidateProfileRepository).toDynamicValue(() => 
    createCandidateProfileRepository(container.get<Db>(TYPES.Db))
  );

  container.bind(TYPES.OTPRepository).toDynamicValue(() => 
    createOTPRepository(container.get<RedisClientType>(TYPES.Redis))
  );

  container.bind(TYPES.OAuthSessionPort).toDynamicValue(() => 
    createOAuthSessionRepository(container.get<RedisClientType>(TYPES.Redis))
  );
}
