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
import { jobController } from '../../interfaces/http/controllers/jobs.controller.js';
import { ApplicationsController } from '../../interfaces/http/controllers/applications.controller.js';

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
  container.bind(jobController).toSelf();
  container.bind(ApplicationsController).toSelf();
}
