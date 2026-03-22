import { Container } from 'inversify';

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
import { InterviewerSlotsController } from '../../interfaces/http/controllers/interviewer-slots.controller.js';
import { NotificationsController } from "../../interfaces/http/controllers/notifications.controller.js";
import { LandingStatsController } from '../../interfaces/http/controllers/landing-stats.controller.js';
import { CompilerController } from '../../interfaces/http/controllers/compiler.controller.js';
import { DashboardStatsController } from '../../interfaces/http/controllers/dashboard-stats.controller.js';

export function bindControllers(container: Container): void {
  container.bind(AuthController).toSelf();
  container.bind(GoogleAuthController).toSelf();
  container.bind(CompanyApprovalController).toSelf();
  container.bind(AdminCompanyApprovalController).toSelf();
  container.bind(UploadController).toSelf();
  container.bind(CompanyTeamController).toSelf();
  container.bind(CandidateProfileController).toSelf();
  container.bind(CandidateJobsController).toSelf();
  container.bind(CandidateInterviewsController).toSelf();
  container.bind(InterviewRoomController).toSelf();
  container.bind(CompanyProfileController).toSelf();
  container.bind(AdminSubscriptionController).toSelf();
  container.bind(CompanyPaymentController).toSelf();
  container.bind(JobsController).toSelf();
  container.bind(ApplicationsController).toSelf();
  container.bind(InterviewerAssignmentsController).toSelf();
  container.bind(InterviewerProfileController).toSelf();
  container.bind(InterviewerSlotsController).toSelf();
  container.bind(NotificationsController).toSelf();
  container.bind(LandingStatsController).toSelf();
  container.bind(CompilerController).toSelf();
  container.bind(DashboardStatsController).toSelf();
}
