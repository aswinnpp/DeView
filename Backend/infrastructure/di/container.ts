import 'reflect-metadata';
import { Container } from 'inversify';
import type { Db } from 'mongodb';
import type { RedisClientType } from 'redis';

import { TYPES } from './types.js';
import { redisClient } from '../cache/RedisClient.js';
import { bindRepositories } from './bindRepositories.js';
import { bindServices } from './bindServices.js';
import { bindUseCases } from './bindUseCases.js';
import { bindControllers } from './bindControllers.js';

// Controllers (needed for getControllers function)
import { AuthController } from '../../interfaces/http/controllers/auth.controller.js';
import { GoogleAuthController } from '../../interfaces/http/controllers/google-auth.controller.js';
import { CompanyApprovalController } from '../../interfaces/http/controllers/company-approval.controller.js';
import { AdminCompanyApprovalController } from '../../interfaces/http/controllers/admin-company-approval.controller.js';
import { UploadController } from '../../interfaces/http/controllers/upload.controller.js';
import { CompanyTeamController } from '../../interfaces/http/controllers/company-team.controller.js';
import { CandidateProfileController } from '../../interfaces/http/controllers/candidate-profile.controller.js';
import { CompanyProfileController } from '../../interfaces/http/controllers/company-profile.controller.js';
import { AdminSubscribtionController } from '../../interfaces/http/controllers/admin-subscribtion.controller.js';
import { CompanyPaymentController } from '../../interfaces/http/controllers/company-payment.controller.js';


export function createContainer(db: Db) {
  const container = new Container();

  container.bind<Db>(TYPES.Db).toConstantValue(db);
  container.bind<RedisClientType>(TYPES.Redis).toConstantValue(redisClient);

  bindRepositories(container);
  bindServices(container);
  bindUseCases(container);
  bindControllers(container);

  return container;
}

export function getControllers(container: ContainerType) {
  return {
    authController: container.get(AuthController),
    googleAuthController: container.get(GoogleAuthController),
    companyApprovalController: container.get(CompanyApprovalController),
    adminCompanyApprovalController: container.get(AdminCompanyApprovalController),
    uploadController: container.get(UploadController),
    companyTeamController: container.get(CompanyTeamController),
    candidateProfileController: container.get(CandidateProfileController),
    companyProfileController: container.get(CompanyProfileController),
    adminsubscribtioncontroller:container.get(AdminSubscribtionController),
    companyPaymentController: container.get(CompanyPaymentController),
  };
}

export type ContainerType = ReturnType<typeof createContainer>;
