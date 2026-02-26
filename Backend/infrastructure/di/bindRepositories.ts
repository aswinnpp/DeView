import { Container } from 'inversify';
import type { Db } from 'mongodb';
import type { RedisClientType } from 'redis';

import { TYPES } from './types.js';
import type { IUserRepository } from '../../application/shared/ports/repository/IUserRepository.js';
import type { ICompanyProfileRepository } from '../../application/company/ports/repository/ICompanyProfileRepository.js';
import type { IOtpRepository } from '../../application/auth/ports/repository/IOtpRepository.js';
import type { ICandidateProfileRepository } from '../../application/candidate/ports/repository/ICandidateProfileRepository.js';
import type { ISubscribtionRepository } from '../../application/admin/ports/repository/ISubscribtionRepository.js';
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { MongoCompanyProfileRepository } from '../persistence/mongodb/repositories/MongoCompanyProfileRepository.js';
import { MongoCandidateProfileRepository } from '../persistence/mongodb/repositories/MongoCandidateProfileRepository.js';
import { MongoSubscribtionRepository } from '../persistence/mongodb/repositories/MongoSubscribtionRepository.js';
import { RedisOTPRepository } from '../persistence/redis/RedisOTPRepository.js';
import { RedisOAuthSessionRepository } from '../persistence/redis/RedisOAuthSessionRepository.js';
import { IUserDocument } from '../persistence/mongodb/schemas/UserDocument.js';
import { ICompanyApprovalDocument } from '../persistence/mongodb/schemas/CompanyApprovalDocument.js';
import { ICandidateProfileDocument } from '../persistence/mongodb/schemas/CandidateProfileDocument.js';
import { ISubscribtion } from '../persistence/mongodb/schemas/subscribtion.js';

/**
 * Helper functions to create repository instances
 */
const createUserRepository = (db: Db) => 
  new MongoUserRepository(db.collection<IUserDocument>('users'));

const createCompanyProfileRepository = (db: Db) => 
  new MongoCompanyProfileRepository(db.collection<ICompanyApprovalDocument>('companyProfiles'));

const createCandidateProfileRepository = (db: Db) => 
  new MongoCandidateProfileRepository(db.collection<ICandidateProfileDocument>('candidateProfiles'));

const createSubscribtionRepository = (db: Db) =>
  new MongoSubscribtionRepository(db.collection<ISubscribtion>('subscribtions'));

const createOTPRepository = (redis: RedisClientType) => 
  new RedisOTPRepository(redis);

const createOAuthSessionRepository = (redis: RedisClientType) => 
  new RedisOAuthSessionRepository(redis);


export function bindRepositories(container: Container): void {
  container.bind<IUserRepository>(TYPES.UserRepositoryPort).toDynamicValue(() =>
    createUserRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<ICompanyProfileRepository>(TYPES.CompanyProfileRepositoryPort).toDynamicValue(() =>
    createCompanyProfileRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<ICandidateProfileRepository>(TYPES.CandidateProfileRepositoryPort).toDynamicValue(() =>
    createCandidateProfileRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<ISubscribtionRepository>(TYPES.SubscribtionRepositoryPort).toDynamicValue(() =>
    createSubscribtionRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IOtpRepository>(TYPES.OTPRepositoryPort).toDynamicValue(() =>
    createOTPRepository(container.get<RedisClientType>(TYPES.Redis))
  );

  container.bind(TYPES.OAuthSessionPort).toDynamicValue(() => 
    createOAuthSessionRepository(container.get<RedisClientType>(TYPES.Redis))
  );
}
