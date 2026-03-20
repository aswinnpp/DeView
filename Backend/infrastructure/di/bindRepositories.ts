import { Container } from 'inversify';
import type { Db } from 'mongodb';
import type { RedisClientType } from 'redis';

import { TYPES } from './types.js';
import type { IUserRepository } from '../../application/shared/ports/repository/IUserRepository.js';
import type { ICompanyProfileRepository } from '../../application/company/ports/repository/ICompanyProfileRepository.js';
import type { IOtpRepository } from '../../application/auth/ports/repository/IOtpRepository.js';
import type { ICandidateProfileRepository } from '../../application/candidate/ports/repository/ICandidateProfileRepository.js';
import type { ISubscriptionRepository } from '../../application/admin/ports/repository/ISubscriptionRepository.js';
import type { IPaymentRepository } from '../../application/company/ports/repository/IPaymentRepository.js';
import type { IJobRepository } from '../../application/job/ports/repository/IJobRepository.js';
import type { IJobApplicationRepository } from '../../application/candidate/ports/repository/IJobApplicationRepository.js';
import type { IApplicationRepository } from '../../application/job-application/ports/repository/IApplicationRepository.js';
import type { IRejectionMailRepository } from '../../application/job-application/ports/repository/IRejectionMailRepository.js';
import type { IInterviewRepository } from '../../application/interview/ports/repository/IInterviewRepository.js';
import type { IInterviewFeedbackRepository } from '../../application/interview/ports/repository/IInterviewFeedbackRepository.js';
import type { IInterviewerProfileRepository } from '../../application/interviewer/ports/repository/IInterviewerProfileRepository.js';
import type { IInterviewerSlotsRepository } from "../../application/interviewer/ports/repository/IInterviewerSlotsRepository.js";
import type { INotificationRepository } from "../../application/notification/ports/repository/INotificationRepository.js";
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { MongoCompanyProfileRepository } from '../persistence/mongodb/repositories/MongoCompanyProfileRepository.js';
import { MongoCandidateProfileRepository } from '../persistence/mongodb/repositories/MongoCandidateProfileRepository.js';
import { MongoSubscriptionRepository } from '../persistence/mongodb/repositories/MongoSubscriptionRepository.js';
import { MongoPaymentRepository } from '../persistence/mongodb/repositories/MongoPaymentRepository.js';
import { MongoJobRepository } from '../persistence/mongodb/repositories/MongoJobRepository.js';
import { MongoJobApplicationRepository } from '../persistence/mongodb/repositories/MongoJobApplicationRepository.js';
import { MongoApplicationRepository } from '../persistence/mongodb/repositories/MongoApplicationRepository.js';
import { RedisOTPRepository } from '../persistence/redis/RedisOTPRepository.js';
import { RedisOAuthSessionRepository } from '../persistence/redis/RedisOAuthSessionRepository.js';
import { IUserDocument } from '../persistence/mongodb/schemas/UserDocument.js';
import { ICompanyApprovalDocument } from '../persistence/mongodb/schemas/CompanyApprovalDocument.js';
import { ICandidateProfileDocument } from '../persistence/mongodb/schemas/CandidateProfileDocument.js';
import { ISubscription } from '../persistence/mongodb/schemas/subscription.js';
import { IPaymentDocument } from '../persistence/mongodb/schemas/payment.js';
import { IJobDocument } from '../persistence/mongodb/schemas/JobDocument.js';
import { IApplicationDocument } from '../persistence/mongodb/schemas/ApplicationDocument.js';
import { IRejectionMailDocument } from '../persistence/mongodb/schemas/RejectionMailDocument.js';
import { MongoRejectionMailRepository } from '../persistence/mongodb/repositories/MongoRejectionMailRepository.js';
import { IInterviewDocument } from '../persistence/mongodb/schemas/InterviewDocument.js';
import { MongoInterviewRepository } from '../persistence/mongodb/repositories/MongoInterviewRepository.js';
import { IInterviewFeedbackDocument } from '../persistence/mongodb/schemas/InterviewFeedbackDocument.js';
import { MongoInterviewFeedbackRepository } from '../persistence/mongodb/repositories/MongoInterviewFeedbackRepository.js';
import { IInterviewerProfileDocument } from '../persistence/mongodb/schemas/InterviewerProfileDocument.js';
import { MongoInterviewerProfileRepository } from '../persistence/mongodb/repositories/MongoInterviewerProfileRepository.js';
import { MongoInterviewerSlotsRepository } from "../persistence/mongodb/repositories/MongoInterviewerSlotsRepository.js";
import { IInterviewerSlotsDocument } from "../persistence/mongodb/schemas/InterviewerSlotsDocument.js";
import type { INotificationDocument } from "../persistence/mongodb/schemas/NotificationDocument.js";
import { MongoNotificationRepository } from "../persistence/mongodb/repositories/MongoNotificationRepository.js";

/**
 * Helper functions to create repository instances
 */
const createUserRepository = (db: Db) => 
  new MongoUserRepository(db.collection<IUserDocument>('users'));

const createCompanyProfileRepository = (db: Db) => 
  new MongoCompanyProfileRepository(db.collection<ICompanyApprovalDocument>('companyProfiles'));

const createCandidateProfileRepository = (db: Db) => 
  new MongoCandidateProfileRepository(db.collection<ICandidateProfileDocument>('candidateProfiles'));

const createSubscriptionRepository = (db: Db) =>
  new MongoSubscriptionRepository(db.collection<ISubscription>('subscriptions'));

const createPaymentRepository = (db: Db) =>
  new MongoPaymentRepository(db.collection<IPaymentDocument>('payments'));

const createJobRepository = (db: Db) =>
  new MongoJobRepository(db.collection<IJobDocument>('jobs'));

const createJobApplicationRepository = (db: Db) =>
  new MongoJobApplicationRepository(db.collection<IApplicationDocument>('jobApplications'));

const createApplicationRepository = (db: Db) =>
  new MongoApplicationRepository(
    db.collection<IApplicationDocument>('jobApplications'),
    db.collection<IJobDocument>('jobs')
  );

const createRejectionMailRepository = (db: Db) =>
  new MongoRejectionMailRepository(db.collection<IRejectionMailDocument>('rejectionMails'));

const createInterviewRepository = (db: Db) =>
  new MongoInterviewRepository(db.collection<IInterviewDocument>('interviews'));

const createInterviewFeedbackRepository = (db: Db) =>
  new MongoInterviewFeedbackRepository(db.collection<IInterviewFeedbackDocument>('interviewFeedbacks'));

const createInterviewerProfileRepository = (db: Db) =>
  new MongoInterviewerProfileRepository(db.collection<IInterviewerProfileDocument>('interviewerProfiles'));

const createInterviewerSlotsRepository = (db: Db) =>
  new MongoInterviewerSlotsRepository(db.collection<IInterviewerSlotsDocument>("interviewerSlots"));

const createNotificationRepository = (db: Db) =>
  new MongoNotificationRepository(db.collection<INotificationDocument>("notifications"));

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

  container.bind<ISubscriptionRepository>(TYPES.SubscriptionRepositoryPort).toDynamicValue(() =>
    createSubscriptionRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IPaymentRepository>(TYPES.PaymentRepositoryPort).toDynamicValue(() =>
    createPaymentRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IJobRepository>(TYPES.JobRepositoryPort).toDynamicValue(() =>
    createJobRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IJobApplicationRepository>(TYPES.JobApplicationRepositoryPort).toDynamicValue(() =>
    createJobApplicationRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IApplicationRepository>(TYPES.ApplicationRepositoryPort).toDynamicValue(() =>
    createApplicationRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IRejectionMailRepository>(TYPES.RejectionMailRepositoryPort).toDynamicValue(() =>
    createRejectionMailRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IInterviewRepository>(TYPES.InterviewRepositoryPort).toDynamicValue(() =>
    createInterviewRepository(container.get<Db>(TYPES.Db))
  );

  container
    .bind<IInterviewFeedbackRepository>(TYPES.InterviewFeedbackRepositoryPort)
    .toDynamicValue(() => createInterviewFeedbackRepository(container.get<Db>(TYPES.Db)));

  container.bind<IInterviewerProfileRepository>(TYPES.InterviewerProfileRepositoryPort).toDynamicValue(() =>
    createInterviewerProfileRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IInterviewerSlotsRepository>(TYPES.InterviewerSlotsRepositoryPort).toDynamicValue(() =>
    createInterviewerSlotsRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<INotificationRepository>(TYPES.NotificationRepositoryPort).toDynamicValue(() =>
    createNotificationRepository(container.get<Db>(TYPES.Db))
  );

  container.bind<IOtpRepository>(TYPES.OTPRepositoryPort).toDynamicValue(() =>
    createOTPRepository(container.get<RedisClientType>(TYPES.Redis))
  );

  container.bind(TYPES.OAuthSessionPort).toDynamicValue(() => 
    createOAuthSessionRepository(container.get<RedisClientType>(TYPES.Redis))
  );
}
