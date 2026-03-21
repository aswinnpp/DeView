import { Container } from 'inversify';
import { TYPES } from './types.js';

// Auth use cases
import { RegisterUserUseCase } from '../../application/auth/use-cases/register-user.usecase.js';
import { VerifyOTPUseCase } from '../../application/auth/use-cases/verify-otp.usecase.js';
import { LoginUseCase } from '../../application/auth/use-cases/login.usecase.js';
import { ResendOTPUseCase } from '../../application/auth/use-cases/resend-otp.usecase.js';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/refresh-token.usecase.js';
import { LogoutUseCase } from '../../application/auth/use-cases/logout.usecase.js';
import { ForgotPasswordUseCase } from '../../application/auth/use-cases/forgot-password.usecase.js';
import { VerifyPasswordResetOTPUseCase } from '../../application/auth/use-cases/verify-password-reset-otp.usecase.js';
import { ResetPasswordUseCase } from '../../application/auth/use-cases/reset-password.usecase.js';
import { VerifyOldPasswordUseCase } from '../../application/auth/use-cases/verify-old-password.usecase.js';
import { ChangePasswordUseCase } from '../../application/auth/use-cases/change-password.usecase.js';
import { GoogleOAuthUseCase } from '../../application/auth/use-cases/google-oauth.usecase.js';

// Company use cases
import { ResolveCompanyForUserUseCase } from '../../application/company/use-cases/resolve-company-for-user.usecase.js';
import { CheckCompanyStatusUseCase } from '../../application/company/use-cases/check-company-status.usecase.js';
import { SubmitCompanyApprovalUseCase } from '../../application/company/use-cases/submit-company-approval.usecase.js';
import { GetMyCompanyApprovalUseCase } from '../../application/company/use-cases/get-my-company-approval.usecase.js';
import { GetCompanyProfileUseCase } from '../../application/company/use-cases/get-company-profile.usecase.js';
import { UpdateCompanyProfileUseCase } from '../../application/company/use-cases/update-company-profile.usecase.js';
import { CreateTeamMemberUseCase } from '../../application/company/use-cases/create-team-member.usecase.js';
import { ListTeamMembersUseCase } from '../../application/company/use-cases/list-team-members.usecase.js';
import { ToggleTeamMemberStatusUseCase } from '../../application/company/use-cases/toggle-team-member-status.usecase.js';
import { CreatePaymentIntentUseCase } from '../../application/company/use-cases/create-payment-intent.usecase.js';
import { HandlePaymentWebhookUseCase } from '../../application/company/use-cases/handle-payment-webhook.usecase.js';

// Job use cases
import { CreateJobUseCase } from '../../application/job/use-cases/create-job.usecase.js';
import { UpdateJobUseCase } from '../../application/job/use-cases/update-job.usecase.js';
import { ListJobsUseCase } from '../../application/job/use-cases/list-jobs.usecase.js';
import { ToggleJobStatusUseCase } from '../../application/job/use-cases/toggle-job-status.usecase.js';
import { SubscriptionUseCase } from '../../application/job/use-cases/Subscription.usecase.js';

// Admin use cases
import { GetPendingCompaniesUseCase } from '../../application/admin/use-cases/get-pending-companies.usecase.js';
import { ApproveCompanyUseCase } from '../../application/admin/use-cases/approve-company.usecase.js';
import { RejectCompanyUseCase } from '../../application/admin/use-cases/reject-company.usecase.js';
import { MarkDocumentUseCase } from '../../application/admin/use-cases/mark-document.usecase.js';
import { GetApprovedCompaniesUseCase } from '../../application/admin/use-cases/get-approved-companies.usecase.js';
import { AdminToggleActivityUseCase } from '../../application/admin/use-cases/admin-toggle-activity.usecase.js';
import { AdminCreateSubscription } from "../../application/admin/use-cases/admin-subscription.usecase.js";
import { AdminListSubscriptionsUsecase } from "../../application/admin/use-cases/admin-list-subscriptions.usecase.js";
import { AdminToggleSubscriptionStatusUsecase } from "../../application/admin/use-cases/admin-toggle-subscription-status.usecase.js";
import { AdminUpdateSubscription } from "../../application/admin/use-cases/admin-update-subscription.usecase.js";

// Candidate use cases
import { CreateCandidateProfileUseCase } from '../../application/candidate/use-cases/create-candidate-profile.usecase.js';
import { GetCandidateProfileUseCase } from '../../application/candidate/use-cases/get-candidate-profile.usecase.js';
import { UpdateCandidateProfileUseCase } from '../../application/candidate/use-cases/update-candidate-profile.usecase.js';
import { GetAllCandidatesUseCase } from '../../application/candidate/use-cases/get-all-candidates.usecase.js';
import { ToggleCandidateStatusUseCase } from '../../application/candidate/use-cases/toggle-candidate-status.usecase.js';
import { ListAllJobsForCandidatesUseCase } from '../../application/candidate/use-cases/list-all-jobs-for-candidates.usecase.js';
import { ApplyForJobUseCase } from '../../application/candidate/use-cases/apply-for-job.usecase.js';
import { ListMyApplicationsUseCase } from '../../application/candidate/use-cases/list-my-applications.usecase.js';
import { ListPendingApplicationsForJobUseCase } from '../../application/job-application/use-cases/list-pending-applications-for-job.usecase.js';
import { ScoreCandidatesUseCase } from '../../application/job-application/use-cases/score-candidates.usecase.js';
import { UpdateApplicationStatusUseCase } from '../../application/job-application/use-cases/update-application-status.usecase.js';
import { ScheduleInterviewUseCase } from '../../application/job-application/use-cases/schedule-interview.usecase.js';
import { PrecheckScheduleInterviewUseCase } from '../../application/job-application/use-cases/precheck-schedule-interview.usecase.js';
import { DeclineRescheduleRequestUseCase } from '../../application/job-application/use-cases/decline-reschedule-request.usecase.js';
import { GetResumeViewUrlUseCase } from '../../application/job-application/use-cases/get-resume-view-url.usecase.js';
import { GetLatestInterviewerFeedbackUseCase } from '../../application/job-application/use-cases/get-latest-interviewer-feedback.usecase.js';
import { ListMyInterviewsUseCase } from '../../application/interview/use-cases/list-my-interviews.usecase.js';
import { GetInterviewRoomDetailsUseCase } from '../../application/interview/use-cases/get-interview-room-details.usecase.js';
import { ListInterviewerAssignmentsUseCase } from '../../application/interview/use-cases/list-interviewer-assignments.usecase.js';
import { AcceptInterviewAssignmentUseCase } from '../../application/interview/use-cases/accept-interview-assignment.usecase.js';
import { RejectInterviewAssignmentUseCase } from '../../application/interview/use-cases/reject-interview-assignment.usecase.js';
import { UpdateInterviewStatusUseCase } from '../../application/interview/use-cases/update-interview-status.usecase.js';
import { RequestCandidateRescheduleUseCase } from '../../application/interview/use-cases/request-candidate-reschedule.usecase.js';
import { ListCompletedInterviewsForInterviewerUseCase } from '../../application/interview/use-cases/list-completed-interviews-for-interviewer.usecase.js';
import { SaveInterviewFeedbackUseCase } from '../../application/interview/use-cases/save-interview-feedback.usecase';
import { ListMyInterviewFeedbacksUseCase } from '../../application/interview/use-cases/list-my-interview-feedbacks.usecase.js';
import { GetInterviewerProfileUseCase } from '../../application/interviewer/use-cases/get-interviewer-profile.usecase.js';
import { CreateInterviewerProfileUseCase } from '../../application/interviewer/use-cases/create-interviewer-profile.usecase.js';
import { UpdateInterviewerProfileUseCase } from '../../application/interviewer/use-cases/update-interviewer-profile.usecase.js';
import { GetMyInterviewerSlotsUseCase } from "../../application/interviewer/use-cases/get-my-interviewer-slots.usecase.js";
import { UpsertMyInterviewerSlotsUseCase } from "../../application/interviewer/use-cases/upsert-my-interviewer-slots.usecase.js";
import { ListNotificationsUseCase } from "../../application/notification/use-cases/list-notifications.usecase.js";
import { MarkNotificationReadUseCase } from "../../application/notification/use-cases/mark-notification-read.usecase.js";
import { DeleteNotificationUseCase } from "../../application/notification/use-cases/delete-notification.usecase.js";

// Public use cases
import { GetLandingStatsUseCase } from '../../application/public/use-cases/get-landing-stats.usecase.js';

// Compiler use cases
import { GetCompilerLanguagesUseCase } from '../../application/compiler/use-cases/get-compiler-languages.usecase.js';
import { ExecuteCodeUseCase } from '../../application/compiler/use-cases/execute-code.usecase.js';

// Upload use cases
import { GenerateUploadSignatureUseCase } from '../../application/upload/use-cases/generate-upload-signature.usecase.js';
import { ActivatePendingSubscriptionNowUseCase } from '../../application/company/use-cases/activate-pending-subscription-now.usecase.js';


export function bindUseCases(container: Container): void {
  // Internal use cases (injected by other use cases, not controllers)
  container.bind(ResolveCompanyForUserUseCase).toSelf();

  // Auth use cases - bind port to implementation
  container.bind(TYPES.RegisterUserUseCasePort).to(RegisterUserUseCase);
  container.bind(TYPES.VerifyOTPUseCasePort).to(VerifyOTPUseCase);
  container.bind(TYPES.LoginUseCasePort).to(LoginUseCase);
  container.bind(TYPES.ResendOTPUseCasePort).to(ResendOTPUseCase);
  container.bind(TYPES.RefreshTokenUseCasePort).to(RefreshTokenUseCase);
  container.bind(TYPES.LogoutUseCasePort).to(LogoutUseCase);
  container.bind(TYPES.ForgotPasswordUseCasePort).to(ForgotPasswordUseCase);
  container.bind(TYPES.VerifyPasswordResetOTPUseCasePort).to(VerifyPasswordResetOTPUseCase);
  container.bind(TYPES.ResetPasswordUseCasePort).to(ResetPasswordUseCase);
  container.bind(TYPES.VerifyOldPasswordUseCasePort).to(VerifyOldPasswordUseCase);
  container.bind(TYPES.ChangePasswordUseCasePort).to(ChangePasswordUseCase);
  container.bind(TYPES.GoogleOAuthUseCasePort).to(GoogleOAuthUseCase);

  // Company use cases
  container.bind(TYPES.CheckCompanyStatusUseCasePort).to(CheckCompanyStatusUseCase);
  container.bind(TYPES.SubmitCompanyApprovalUseCasePort).to(SubmitCompanyApprovalUseCase);
  container.bind(TYPES.GetMyCompanyApprovalUseCasePort).to(GetMyCompanyApprovalUseCase);
  container.bind(TYPES.GetCompanyProfileUseCasePort).to(GetCompanyProfileUseCase);
  container.bind(TYPES.UpdateCompanyProfileUseCasePort).to(UpdateCompanyProfileUseCase);
  container.bind(TYPES.CreateTeamMemberUseCasePort).to(CreateTeamMemberUseCase);
  container.bind(TYPES.ListTeamMembersUseCasePort).to(ListTeamMembersUseCase);
  container.bind(TYPES.ToggleTeamMemberStatusUseCasePort).to(ToggleTeamMemberStatusUseCase);
  container.bind(TYPES.CreatePaymentIntentUseCasePort).to(CreatePaymentIntentUseCase);
  container.bind(TYPES.HandlePaymentWebhookUseCasePort).to(HandlePaymentWebhookUseCase);
  container.bind(TYPES.CreateJobUseCasePort).to(CreateJobUseCase);
  container.bind(TYPES.UpdateJobUseCasePort).to(UpdateJobUseCase);
  container.bind(TYPES.ListJobsUseCasePort).to(ListJobsUseCase);
  container.bind(TYPES.ToggleJobStatusUseCasePort).to(ToggleJobStatusUseCase);

  // Admin use cases
  container.bind(TYPES.GetPendingCompaniesUseCasePort).to(GetPendingCompaniesUseCase);
  container.bind(TYPES.GetApprovedCompaniesUseCasePort).to(GetApprovedCompaniesUseCase);
  container.bind(TYPES.ApproveCompanyUseCasePort).to(ApproveCompanyUseCase);
  container.bind(TYPES.RejectCompanyUseCasePort).to(RejectCompanyUseCase);
  container.bind(TYPES.MarkDocumentUseCasePort).to(MarkDocumentUseCase);
  container.bind(TYPES.ToggleCompanyActiveUseCasePort).to(AdminToggleActivityUseCase);

  // Candidate use cases
  container.bind(TYPES.CreateCandidateProfileUseCasePort).to(CreateCandidateProfileUseCase);
  container.bind(TYPES.GetCandidateProfileUseCasePort).to(GetCandidateProfileUseCase);
  container.bind(TYPES.UpdateCandidateProfileUseCasePort).to(UpdateCandidateProfileUseCase);
  container.bind(TYPES.GetAllCandidatesUseCasePort).to(GetAllCandidatesUseCase);
  container.bind(TYPES.ToggleCandidateStatusUseCasePort).to(ToggleCandidateStatusUseCase);
  container
  .bind(TYPES.ListAllJobsForCandidatesUseCasePort)
  .to(ListAllJobsForCandidatesUseCase);

  container.bind(TYPES.ApplyForJobUseCasePort).to(ApplyForJobUseCase);
  container.bind(TYPES.ListMyApplicationsUseCasePort).to(ListMyApplicationsUseCase);

  // Application use cases (company/HR)
  container.bind(TYPES.ListPendingApplicationsForJobUseCasePort).to(ListPendingApplicationsForJobUseCase);
  container.bind(TYPES.ScoreCandidatesUseCasePort).to(ScoreCandidatesUseCase);
  container.bind(TYPES.UpdateApplicationStatusUseCasePort).to(UpdateApplicationStatusUseCase);
  container.bind(TYPES.ScheduleInterviewUseCasePort).to(ScheduleInterviewUseCase);
  container.bind(TYPES.PrecheckScheduleInterviewUseCasePort).to(PrecheckScheduleInterviewUseCase);
  container.bind(TYPES.DeclineRescheduleRequestUseCasePort).to(DeclineRescheduleRequestUseCase);
  container.bind(TYPES.GetResumeViewUrlUseCasePort).to(GetResumeViewUrlUseCase);
  container.bind(TYPES.GetLatestInterviewerFeedbackUseCasePort).to(GetLatestInterviewerFeedbackUseCase);

  // Interview use cases
  container.bind(TYPES.ListMyInterviewsUseCasePort).to(ListMyInterviewsUseCase);
  container.bind(TYPES.GetInterviewRoomDetailsUseCasePort).to(GetInterviewRoomDetailsUseCase);
  container.bind(TYPES.ListInterviewerAssignmentsUseCasePort).to(ListInterviewerAssignmentsUseCase);
  container.bind(TYPES.AcceptInterviewAssignmentUseCasePort).to(AcceptInterviewAssignmentUseCase);
  container.bind(TYPES.RejectInterviewAssignmentUseCasePort).to(RejectInterviewAssignmentUseCase);
  container.bind(TYPES.UpdateInterviewStatusUseCasePort).to(UpdateInterviewStatusUseCase);
  container.bind(TYPES.RequestCandidateRescheduleUseCasePort).to(RequestCandidateRescheduleUseCase);

  container
    .bind(TYPES.ListCompletedInterviewsForInterviewerUseCasePort)
    .to(ListCompletedInterviewsForInterviewerUseCase);

  container.bind(TYPES.SaveInterviewFeedbackUseCasePort).to(SaveInterviewFeedbackUseCase);

  container
    .bind(TYPES.ListMyInterviewFeedbacksUseCasePort)
    .to(ListMyInterviewFeedbacksUseCase);

  // Interviewer profile use cases
  container.bind(TYPES.GetInterviewerProfileUseCasePort).to(GetInterviewerProfileUseCase);
  container.bind(TYPES.CreateInterviewerProfileUseCasePort).to(CreateInterviewerProfileUseCase);
  container.bind(TYPES.UpdateInterviewerProfileUseCasePort).to(UpdateInterviewerProfileUseCase);
  container.bind(TYPES.GetMyInterviewerSlotsUseCasePort).to(GetMyInterviewerSlotsUseCase);
  container.bind(TYPES.UpsertMyInterviewerSlotsUseCasePort).to(UpsertMyInterviewerSlotsUseCase);

  // Upload use cases
  container.bind(TYPES.GenerateUploadSignatureUseCasePort).to(GenerateUploadSignatureUseCase);
  container.bind(TYPES.CreateSubscriptionUsecasePort).to(AdminCreateSubscription);
  container.bind(TYPES.ListSubscriptionsUsecasePort).to(AdminListSubscriptionsUsecase);
  container.bind(TYPES.ToggleSubscriptionStatusUsecasePort).to(AdminToggleSubscriptionStatusUsecase);
  container.bind(TYPES.UpdateSubscriptionUsecasePort).to(AdminUpdateSubscription);
  container
    .bind(TYPES.ActivatePendingSubscriptionNowUseCasePort)
    .to(ActivatePendingSubscriptionNowUseCase);


  // Job use cases
  container.bind(TYPES.SubscriptionUseCasePort).to(SubscriptionUseCase);

  // Notifications (company)
  container.bind(TYPES.ListNotificationsUseCasePort).to(ListNotificationsUseCase);
  container.bind(TYPES.MarkNotificationReadUseCasePort).to(MarkNotificationReadUseCase);
  container.bind(TYPES.DeleteNotificationUseCasePort).to(DeleteNotificationUseCase);

  // Public
  container.bind(TYPES.GetLandingStatsUseCasePort).to(GetLandingStatsUseCase);

  // Compiler
  container.bind(TYPES.GetCompilerLanguagesUseCasePort).to(GetCompilerLanguagesUseCase);
  container.bind(TYPES.ExecuteCodeUseCasePort).to(ExecuteCodeUseCase);
}
