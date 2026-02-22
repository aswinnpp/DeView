import { Container } from 'inversify';
import type { Db } from 'mongodb';
import type { RedisClientType } from 'redis';

import { TYPES } from './types.js';
import type { UserRepositoryPort } from '../../application/shared/ports/repository/UserRepositoryPort.js';
import type { CompanyProfileRepositoryPort } from '../../application/company/ports/repository/CompanyProfileRepositoryPort.js';
import type { OTPRepositoryPort } from '../../application/auth/ports/repository/OTPRepositoryPort.js';
import type { CandidateProfileRepositoryPort } from '../../application/candidate/ports/repository/CandidateProfileRepositoryPort.js';
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { MongoCompanyProfileRepository } from '../persistence/mongodb/repositories/MongoCompanyProfileRepository.js';
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

const createCompanyProfileRepository = (db: Db) => 
  new MongoCompanyProfileRepository(db.collection<CompanyApprovalDocument>('companyProfiles'));

const createCandidateProfileRepository = (db: Db) => 
  new MongoCandidateProfileRepository(db.collection<CandidateProfileDocument>('candidateProfiles'));

const createOTPRepository = (redis: RedisClientType) => 
  new RedisOTPRepository(redis);

const createOAuthSessionRepository = (redis: RedisClientType) => 
  new RedisOAuthSessionRepository(redis);


export function bindRepositories(container: Container): void {
  container.bind<UserRepositoryPort>(TYPES.UserRepositoryPort).toDynamicValue(() =>
    createUserRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<CompanyProfileRepositoryPort>(TYPES.CompanyProfileRepositoryPort).toDynamicValue(() =>
    createCompanyProfileRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<CandidateProfileRepositoryPort>(TYPES.CandidateProfileRepositoryPort).toDynamicValue(() =>
    createCandidateProfileRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<OTPRepositoryPort>(TYPES.OTPRepositoryPort).toDynamicValue(() =>
    createOTPRepository(container.get<RedisClientType>(TYPES.Redis))
  );

  container.bind(TYPES.OAuthSessionPort).toDynamicValue(() => 
    createOAuthSessionRepository(container.get<RedisClientType>(TYPES.Redis))
  );
}
