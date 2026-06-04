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
import { CandidateJobsController } from '../../interfaces/http/controllers/candidate-jobs.controller.js';
import { CandidateInterviewsController } from '../../interfaces/http/controllers/candidate-interviews.controller.js';
import { InterviewRoomController } from '../../interfaces/http/controllers/interview-room.controller.js';
import { CompanyProfileController } from '../../interfaces/http/controllers/company-profile.controller.js';
import { AdminSubscriptionController } from '../../interfaces/http/controllers/admin-subscription.controller.js';
import { CompanyPaymentController } from '../../interfaces/http/controllers/company-payment.controller.js';
import { JobsController } from '../../interfaces/http/controllers/jobs.controller.js';
import { ApplicationsController } from '../../interfaces/http/controllers/applications.controller.js';
import { InterviewerAssignmentsController } from '../../interfaces/http/controllers/interviewer-assignments.controller.js';
import { InterviewerProfileController } from '../../interfaces/http/controllers/interviewer-profile.controller.js';
import { HrProfileController } from '../../interfaces/http/controllers/hr-profile.controller.js';
import { InterviewerSlotsController } from "../../interfaces/http/controllers/interviewer-slots.controller.js";
import { NotificationsController } from "../../interfaces/http/controllers/notifications.controller.js";
import { LandingStatsController } from '../../interfaces/http/controllers/landing-stats.controller.js';
import { CompilerController } from "../../interfaces/http/controllers/compiler.controller.js";
import { DashboardStatsController } from "../../interfaces/http/controllers/dashboard-stats.controller.js";

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
    candidateJobsController: container.get(CandidateJobsController),
    candidateInterviewsController: container.get(CandidateInterviewsController),
    interviewRoomController: container.get(InterviewRoomController),
    companyProfileController: container.get(CompanyProfileController),
    adminSubscriptionController: container.get(AdminSubscriptionController),
    companyPaymentController: container.get(CompanyPaymentController),
    jobsControllers: container.get(JobsController),
    applicationsController: container.get(ApplicationsController),
    interviewerAssignmentsController: container.get(InterviewerAssignmentsController),
    interviewerProfileController: container.get(InterviewerProfileController),
    hrProfileController: container.get(HrProfileController),
    interviewerSlotsController: container.get(InterviewerSlotsController),
    notificationsController: container.get(NotificationsController),
    landingStatsController: container.get(LandingStatsController),
    compilerController: container.get(CompilerController),
    dashboardStatsController: container.get(DashboardStatsController),
  };
}

export type ContainerType = ReturnType<typeof createContainer>;
