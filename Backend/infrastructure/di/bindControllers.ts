import { Container } from 'inversify';

import { AuthController } from '../../interfaces/http/controllers/AuthController.js';
import { GoogleAuthController } from '../../interfaces/http/controllers/GoogleAuthController.js';
import { CompanyApprovalController } from '../../interfaces/http/controllers/CompanyApprovalController.js';
import { AdminCompanyApprovalController } from '../../interfaces/http/controllers/AdminCompanyApprovalController.js';
import { UploadController } from '../../interfaces/http/controllers/UploadController.js';
import { CompanyTeamController } from '../../interfaces/http/controllers/CompanyTeamController.js';
import { CandidateProfileController } from '../../interfaces/http/controllers/CandidateProfileController.js';

/**
 * Binds all controller dependencies to the container
 */
export function bindControllers(container: Container): void {
  container.bind(AuthController).toSelf();
  container.bind(GoogleAuthController).toSelf();
  container.bind(CompanyApprovalController).toSelf();
  container.bind(AdminCompanyApprovalController).toSelf();
  container.bind(UploadController).toSelf();
  container.bind(CompanyTeamController).toSelf();
  container.bind(CandidateProfileController).toSelf();
}
