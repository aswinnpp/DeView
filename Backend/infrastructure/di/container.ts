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
import { AuthController } from '../../interfaces/http/controllers/AuthController.js';
import { GoogleAuthController } from '../../interfaces/http/controllers/GoogleAuthController.js';
import { CompanyApprovalController } from '../../interfaces/http/controllers/CompanyApprovalController.js';
import { AdminCompanyApprovalController } from '../../interfaces/http/controllers/AdminCompanyApprovalController.js';
import { UploadController } from '../../interfaces/http/controllers/UploadController.js';
import { CompanyTeamController } from '../../interfaces/http/controllers/CompanyTeamController.js';
import { CandidateProfileController } from '../../interfaces/http/controllers/CandidateProfileController.js';

/**
 * Creates and configures the Inversify container with all dependencies.
 * Delegates binding logic to separate modules for better organization.
 */
export function createContainer(db: Db) {
  const container = new Container();

  // Infrastructure dependencies
  container.bind<Db>(TYPES.Db).toConstantValue(db);
  container.bind<RedisClientType>(TYPES.Redis).toConstantValue(redisClient);

  // Bind all dependencies
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
  };
}

export type ContainerType = ReturnType<typeof createContainer>;
