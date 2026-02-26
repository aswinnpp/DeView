import { Container } from 'inversify';

import { AuthController } from '../../interfaces/http/controllers/auth.controller.js';
import { GoogleAuthController } from '../../interfaces/http/controllers/google-auth.controller.js';
import { CompanyApprovalController } from '../../interfaces/http/controllers/company-approval.controller.js';
import { AdminCompanyApprovalController } from '../../interfaces/http/controllers/admin-company-approval.controller.js';
import { UploadController } from '../../interfaces/http/controllers/upload.controller.js';
import { CompanyTeamController } from '../../interfaces/http/controllers/company-team.controller.js';
import { CandidateProfileController } from '../../interfaces/http/controllers/candidate-profile.controller.js';
import { CompanyProfileController } from '../../interfaces/http/controllers/company-profile.controller.js';
import {AdminSubscribtionController}from"../../interfaces/http/controllers/admin-subscribtion.controller.js"

export function bindControllers(container: Container): void {
  container.bind(AuthController).toSelf();
  container.bind(GoogleAuthController).toSelf();
  container.bind(CompanyApprovalController).toSelf();
  container.bind(AdminCompanyApprovalController).toSelf();
  container.bind(UploadController).toSelf();
  container.bind(CompanyTeamController).toSelf();
  container.bind(CandidateProfileController).toSelf();
  container.bind(CompanyProfileController).toSelf();
  container.bind(AdminSubscribtionController).toSelf();
}
