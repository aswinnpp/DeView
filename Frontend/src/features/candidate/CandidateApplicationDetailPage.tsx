import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button } from "../../components/common";
import { useCandidateApplications, type ApplicationWithJob } from "../../hooks/candidate/useCandidateApplications";
import type { ApplicationItem } from "../../services/applications.service";

type InterviewRoundLike =
  | NonNullable<ApplicationItem["interviewDetails"]>
  | NonNullable<NonNullable<ApplicationItem["interviewRounds"]>[number]>;

const sectionTitleClass = "text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3";

const sectionBlockClass = "pt-10 border-t border-slate-700/45 first:pt-0 first:border-0";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
    case "applied":
      return { bg: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", border: "rgba(251, 191, 36, 0.35)" };
    case "shortlisted":
      return { bg: "rgba(6, 182, 212, 0.15)", color: "#22d3ee", border: "rgba(6, 182, 212, 0.35)" };
    case "in_interview":
    case "interview":
      return { bg: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd", border: "rgba(139, 92, 246, 0.35)" };
    case "offered":
      return { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "rgba(16, 185, 129, 0.35)" };
    case "accepted":
      return { bg: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "rgba(16, 185, 129, 0.45)" };
    case "rejected":
      return { bg: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "rgba(239, 68, 68, 0.35)" };
    default:
      return { bg: "rgba(148, 163, 184, 0.12)", color: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatInterviewType = (type?: string) => {
  if (type === "CALL") return "Call";
  if (type === "F2F") return "Face to Face";
  if (type === "ONLINE") return "Online";
  return "Online";
};

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-slate-700/35 last:border-0 last:pb-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200 m-0">{value || "—"}</dd>
    </div>
  );
}

function ApplicationDetailBody({ selectedApplication }: { selectedApplication: ApplicationWithJob }) {
  const job = selectedApplication.job;
  const statusStyle = getStatusColor(selectedApplication.status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
      <div className="lg:col-span-8 space-y-0">
        <section className="pb-8 border-b border-slate-700/45">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            
            <span
              className="shrink-0 self-start rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{
                background: statusStyle.bg,
                color: statusStyle.color,
                borderColor: statusStyle.border,
              }}
            >
              {formatStatus(selectedApplication.status)}
            </span>
          </div>
        </section>

        {(job?.location || job?.jobType || job?.salary) && (
          <section className={sectionBlockClass}>
            <h3 className={sectionTitleClass}>Role overview</h3>
            <dl>
              {job?.location && <MetaRow label="Location" value={job.location} />}
              {job?.jobType && <MetaRow label="Employment type" value={job.jobType} />}
              {job?.salary && <MetaRow label="Compensation" value={job.salary} />}
            </dl>
          </section>
        )}

        {job?.description && (
          <section className={sectionBlockClass}>
            <h3 className={sectionTitleClass}>Job description</h3>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300 m-0 max-w-prose">{job.description}</p>
          </section>
        )}

        {job?.requirements &&
          (Array.isArray(job.requirements) ? (
            job.requirements.length > 0 && (
              <section className={sectionBlockClass}>
                <h3 className={sectionTitleClass}>Requirements</h3>
                <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-300 m-0">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="marker:text-slate-500">
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )
          ) : (
            <section className={sectionBlockClass}>
              <h3 className={sectionTitleClass}>Requirements</h3>
              <p className="text-[15px] leading-relaxed text-slate-300 m-0">{job.requirements}</p>
            </section>
          ))}

        {job?.skills &&
          (Array.isArray(job.skills) ? (
            job.skills.length > 0 && (
              <section className={sectionBlockClass}>
                <h3 className={sectionTitleClass}>Required skills</h3>
                <p className="text-[15px] leading-relaxed text-slate-300 m-0">
                  {job.skills.join(" · ")}
                </p>
              </section>
            )
          ) : (
            <section className={sectionBlockClass}>
              <h3 className={sectionTitleClass}>Required skills</h3>
              <p className="text-[15px] text-slate-300 m-0">{job.skills}</p>
            </section>
          ))}

        {selectedApplication.coverLetter && (
          <section className={sectionBlockClass}>
            <h3 className={sectionTitleClass}>Your cover letter</h3>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-300 m-0">
              {selectedApplication.coverLetter}
            </p>
          </section>
        )}

        {(() => {
          const rounds = selectedApplication.interviewRounds?.length
            ? selectedApplication.interviewRounds
            : selectedApplication.interviewDetails
              ? [selectedApplication.interviewDetails]
              : [];
          const completedRounds = new Set(selectedApplication.completedRounds ?? []);
          const isCompletedRound = (r: InterviewRoundLike) =>
            Boolean(r.feedback) || r.totalScore != null || (typeof r.round === "string" && completedRounds.has(r.round));
          const displayRounds = (rounds as InterviewRoundLike[]).filter(
            (r) => isCompletedRound(r) || Boolean(r.interviewerAccepted)
          );
          const shouldShow =
            (selectedApplication.status === "INTERVIEW_SCHEDULED" ||
              selectedApplication.status === "RESCHEDULE_REQUESTED" ||
              selectedApplication.status === "INTERVIEW_COMPLETE" ||
              selectedApplication.status === "COMPLETED" ||
              selectedApplication.status === "HIRED") &&
            displayRounds.length > 0;
          if (!shouldShow) return null;
          return (
            <section className={sectionBlockClass}>
              <h3 className={`${sectionTitleClass} text-violet-300/90`}>Interviews ({displayRounds.length})</h3>
              <div className="space-y-8">
                {displayRounds.map((r, idx: number) => (
                  <div
                    key={idx}
                    className="pt-6 first:pt-0 border-t border-slate-700/35 first:border-0"
                  >
                    <div className="mb-3 text-sm font-semibold text-violet-200">
                      Round {idx + 1}: {r.round}
                    </div>
                    <div className="grid gap-4 text-sm text-slate-100 sm:grid-cols-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Interviewer</div>
                        <div className="mt-1 text-slate-200">
                          {r.interviewer}
                          {r.interviewerEmail ? ` (${r.interviewerEmail})` : ""}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date & time</div>
                        <div className="mt-1 text-slate-200">
                          {formatDate(r.scheduledDate)} at {r.scheduledTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Interview type</div>
                        <div className="mt-1 text-slate-200">
                          {formatInterviewType(r.interviewType ?? selectedApplication.latestFeedback?.interviewType)}
                        </div>
                      </div>
                      {(r.interviewType ?? selectedApplication.latestFeedback?.interviewType) === "F2F" &&
                      (r.interviewLocation ?? selectedApplication.latestFeedback?.interviewLocation) ? (
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location</div>
                          <div className="mt-1 text-slate-200">
                            {r.interviewLocation ?? selectedApplication.latestFeedback?.interviewLocation}
                          </div>
                        </div>
                      ) : null}
                      {r.totalScore != null && (
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Score</div>
                          <div className="mt-1 text-slate-200">{r.totalScore}/10</div>
                        </div>
                      )}
                    </div>
                    {r.feedback && (
                      <div className="mt-4 pt-4 border-t border-slate-700/35">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Feedback</div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-200 m-0">{r.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {selectedApplication.latestFeedback &&
          !selectedApplication.interviewRounds?.length &&
          !selectedApplication.interviewDetails?.feedback && (
            <section className={sectionBlockClass}>
              <h3 className={`${sectionTitleClass} text-emerald-300/90`}>Interviewer feedback</h3>
              <div className="grid gap-4 text-sm text-slate-100 sm:grid-cols-2 mb-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Round</div>
                  <div className="mt-1 text-slate-200">{selectedApplication.latestFeedback.round || "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Score</div>
                  <div className="mt-1 text-slate-200">{selectedApplication.latestFeedback.totalScore}/10</div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Feedback</div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-200 m-0">
                  {selectedApplication.latestFeedback.feedback || "—"}
                </p>
              </div>
            </section>
          )}
      </div>

      <aside className="lg:col-span-4 lg:border-l lg:border-slate-700/45 lg:pl-10">
        <div className="pt-10 lg:pt-0 border-t border-slate-700/45 lg:border-t-0 lg:sticky lg:top-28">
          <h3 className={sectionTitleClass}>Application summary</h3>
          <dl>
            <MetaRow label="Status" value={formatStatus(selectedApplication.status)} />
            <MetaRow label="Applied on" value={formatDate(selectedApplication.createdAt)} />
            {selectedApplication.updatedAt && selectedApplication.updatedAt !== selectedApplication.createdAt && (
              <MetaRow label="Last updated" value={formatDate(selectedApplication.updatedAt)} />
            )}
            {job?.location && <MetaRow label="Location" value={job.location} />}
            {job?.jobType && <MetaRow label="Employment type" value={job.jobType} />}
          </dl>
        </div>
      </aside>
    </div>
  );
}

const CandidateApplicationDetailPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const { applications, isLoading, error } = useCandidateApplications({
    status: "all",
    search: "",
    page: 1,
    itemsPerPage: 500,
    sortOrder: "desc",
  });

  const selectedApplication = applicationId ? applications.find((a) => a.id === applicationId) : undefined;

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,system-ui,sans-serif] text-slate-100 antialiased">
      <div className="min-h-screen flex flex-col">
        <CandidateNavHeader title="APPLICATION DETAIL" currentPage="applied" />

        <main className="flex-1 pt-[72px] px-4 sm:px-6 lg:px-8 pb-16">


            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 text-sm">Loading application…</div>
            ) : error ? (
              <div className="py-6 text-sm text-red-300 border-t border-red-500/25">{error}</div>
            ) : !applicationId || !selectedApplication ? (
              <div className="py-12 text-center border-t border-slate-700/45">
                <p className="text-slate-300 m-0 mb-6 text-[15px]">
                  Application not found or you no longer have access to it.
                </p>
                <Button type="button" variant="primary" onClick={() => navigate("/candidate/applied")}>
                  Return to applied jobs
                </Button>
              </div>
            ) : (
              <>
                <header className="mb-8 sm:mb-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 m-0 mb-2">
                    Application
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight m-0">
                    {selectedApplication.job?.title || "Job application"}
                  </h1>
                 
                </header>
                <ApplicationDetailBody selectedApplication={selectedApplication} />
              </>
            )}
          
        </main>
      </div>
    </div>
  );
};

export default CandidateApplicationDetailPage;
