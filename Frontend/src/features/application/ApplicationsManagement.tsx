import RejectionEmailModal from "../../components/applications/RejectionEmailModal";
import { Button, Pagination, SearchInput, Table } from "../../components/common";
import {
  useApplication,
  COMPANY_PLACEHOLDER,
  type Job,
  type Candidate,
} from "../../hooks/application/useApplication";

const CANDIDATES_PAGE_SIZE = 2;

const HRApplicationsPage = () => {
  const app = useApplication();
  const {
    jobs,
    jobsLoading,
    jobsPage,
    jobsTotalPages,
    selectedJob,
    candidatePipelineTab,
    setCandidatePipelineTab,
    candidateCounts,
    selectedCandidate,
    paginatedCandidates,
    filteredCandidates,
    candidatesPage,
    candidatesTotalPages,
    applicationsLoading,
    showRejectionModal,
    showCandidateDetail,
    resumeLinkLoading,
    setJobsPage,
    setCandidatesPage,
    handleSearch,
    handleViewApplications,
    handleViewResume,
    handleReject,
    handleConfirmRejection,
    handleCloseRejectionModal,
    handleCloseCandidateDetail,
    handleSelectCandidate,
    getStatusBadge,
  } = app;

  return (
    <>
      {/* JOBS LIST VIEW */}
      {!selectedJob && (
        <>
          <h1 className="text-[#f1f5f9] text-[28px] font-bold mb-6">
            Job Applications
          </h1>

          {jobsLoading ? (
            <div className="py-16 text-center text-slate-400">
              Loading jobs...
            </div>
          ) : (
            <>
              <Table<Job>
                rowKey={(j) => j.id}
                data={jobs}
                emptyMessage="No jobs found."
                emptySubMessage="Create a job first."
                columns={[
                  {
                    header: "Job Title",
                    render: (job) => (
                      <div className="text-[#f1f5f9] font-semibold text-sm">
                        {job.title}
                      </div>
                    ),
                  },
                  {
                    header: "Location",
                    render: (job) => (
                      <span className="text-[#94a3b8] text-sm">
                        {job.location}
                      </span>
                    ),
                  },
                  {
                    header: "Type",
                    render: (job) => (
                      <span
                        className={`py-1 px-2.5 rounded-md text-xs font-medium ${job.type === "Full-time" ? "bg-blue-500/20 text-blue-500" : "bg-amber-500/20 text-amber-500"}`}
                      >
                        {job.type}
                      </span>
                    ),
                  },
                  {
                    header: "Department",
                    render: (job) => (
                      <span className="text-[#94a3b8] text-sm">
                        {job.department}
                      </span>
                    ),
                  },
                  {
                    header: "Salary",
                    render: (job) => (
                      <span className="text-emerald-500 text-sm font-medium">
                        {job.salary}
                      </span>
                    ),
                  },
                  {
                    header: "Applications",
                    cellClassName: "text-center",
                    render: (job) => (
                      <span className="py-1.5 px-3.5 rounded-lg text-sm font-bold bg-blue-500/20 text-blue-500">
                        {job.applicantCount ?? 0}
                      </span>
                    ),
                  },
                  {
                    header: "Actions",
                    cellClassName: "text-right",
                    render: (job) => (
                      <Button
                        type="button"
                        onClick={() => handleViewApplications(job)}
                        className="py-2 px-4 font-semibold text-xs"
                      >
                        View Applications
                      </Button>
                    ),
                  },
                ]}
              />
              {jobs.length > 0 && (
                <Pagination
                  page={jobsPage}
                  totalPages={jobsTotalPages}
                  onPageChange={setJobsPage}
                />
              )}
            </>
          )}
        </>
      )}

      {/* CANDIDATES VIEW (when job is selected) */}
      {selectedJob && (
        <>
          <div className="mb-6">
            <h1 className="text-[#f1f5f9] text-2xl font-bold m-0">
              {selectedJob.title}
            </h1>
            <p className="text-[#94a3b8] my-1">
              {selectedJob.location} • {selectedJob.type}
            </p>
          </div>

          {/* Candidate pipeline tabs with counts */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(
              [
                { id: "pending" as const, label: "Pending", count: candidateCounts.pending },
                { id: "shortlist" as const, label: "Shortlist", count: candidateCounts.shortlist },
                { id: "interview" as const, label: "Interview", count: candidateCounts.shortlist },
                { id: "complete" as const, label: "Complete", count: candidateCounts.complete },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCandidatePipelineTab(tab.id)}
                className={`py-2 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                  candidatePipelineTab === tab.id
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-slate-800/50 text-slate-400 border-slate-600 hover:text-slate-200 hover:border-slate-500"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="mb-5 max-w-[450px]">
            <SearchInput
              placeholder="Search candidates by name or email..."
              onSearch={handleSearch}
            />
          </div>

          <div>
            {applicationsLoading ? (
              <div className="py-10 text-center text-slate-500">
                Loading applications...
              </div>
            ) : (
              <>
                <Table<Candidate>
                  rowKey={(c) => c.id}
                  data={paginatedCandidates}
                  emptyMessage={`No candidates in ${candidatePipelineTab}.`}
                  columns={[
                    {
                      header: "Candidate",
                      render: (c) => (
                        <div>
                          <div className="text-[#f1f5f9] font-semibold text-sm">
                            {c.name}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            {c.email}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Experience",
                      render: (c) => (
                        <span className="text-slate-200 text-sm">
                          {c.experience}
                        </span>
                      ),
                    },
                    {
                      header: "Location",
                      render: (c) => (
                        <span className="text-[#94a3b8] text-sm">
                          {c.location}
                        </span>
                      ),
                    },
                    {
                      header: "Status",
                      render: (c) => {
                        const badge = getStatusBadge(c.status);
                        return (
                          <span className={badge.className}>{badge.label}</span>
                        );
                      },
                    },
                    {
                      header: "Applied",
                      render: (c) => (
                        <span className="text-slate-500 text-[13px]">
                          {c.appliedDate}
                        </span>
                      ),
                    },
                    {
                      header: "Actions",
                      cellClassName: "text-right",
                      render: (c) => (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleSelectCandidate(c)}
                          className="py-1.5 px-3.5 bg-slate-600 text-white border-0 text-xs font-semibold"
                        >
                          View
                        </Button>
                      ),
                    },
                  ]}
                />
                {filteredCandidates.length > 0 && (
                  <Pagination
                    page={candidatesPage}
                    totalPages={candidatesTotalPages}
                    onPageChange={setCandidatesPage}
                    leftContent={`Showing ${(candidatesPage - 1) * CANDIDATES_PAGE_SIZE + 1}–${Math.min(candidatesPage * CANDIDATES_PAGE_SIZE, filteredCandidates.length)} of ${filteredCandidates.length} candidates`}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* CANDIDATE DETAIL MODAL */}
      {showCandidateDetail && selectedCandidate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-[700px] w-[95%] max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-slate-200 m-0">Candidate Details</h3>
              </div>
              <button
                onClick={handleCloseCandidateDetail}
                className="bg-transparent border-0 text-slate-400 cursor-pointer text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl">
                {selectedCandidate.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-slate-100 text-[22px] font-bold m-0">
                  {selectedCandidate.name}
                </h3>
                {selectedCandidate.title && (
                  <p className="text-violet-500 text-sm mt-1 font-medium">
                    {selectedCandidate.title}
                  </p>
                )}
                {selectedCandidate.currentCompany && (
                  <p className="text-slate-500 text-[13px] mt-0.5">
                    @ {selectedCandidate.currentCompany}
                  </p>
                )}
                <div className="mt-2">
                  {(() => {
                    const badge = getStatusBadge(selectedCandidate.status);
                    return (
                      <span className={badge.className}>{badge.label}</span>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase">
                    Full Name
                  </span>
                  <p className="text-slate-200 mt-1 text-sm font-medium">
                    {selectedCandidate.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase">
                    Email
                  </span>
                  <p className="text-slate-200 mt-1 text-sm font-medium">
                    {selectedCandidate.email}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase">
                    Phone
                  </span>
                  <p className="text-slate-200 mt-1 text-sm font-medium">
                    {selectedCandidate.phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase">
                    Location
                  </span>
                  <p className="text-slate-200 mt-1 text-sm font-medium">
                    {selectedCandidate.location}
                  </p>
                </div>
              </div>
            </div>

            {(selectedCandidate.title ||
              selectedCandidate.currentCompany ||
              selectedCandidate.experience) && (
              <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
                <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                  Professional Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedCandidate.title && (
                    <div>
                      <span className="text-slate-500 text-[11px] uppercase">
                        Job Title
                      </span>
                      <p className="text-slate-200 mt-1 text-sm font-medium">
                        {selectedCandidate.title}
                      </p>
                    </div>
                  )}
                  {selectedCandidate.currentCompany && (
                    <div>
                      <span className="text-slate-500 text-[11px] uppercase">
                        Current Company
                      </span>
                      <p className="text-slate-200 mt-1 text-sm font-medium">
                        {selectedCandidate.currentCompany}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 text-[11px] uppercase">
                      Experience
                    </span>
                    <p className="text-slate-200 mt-1 text-sm font-medium">
                      {selectedCandidate.experience}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(selectedCandidate.bio ||
              selectedCandidate.expectedSalary ||
              selectedCandidate.noticePeriod) && (
              <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
                <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                  About & Availability
                </h4>
                {selectedCandidate.bio && (
                  <div className="mb-3">
                    <span className="text-slate-500 text-[11px] uppercase">
                      Bio
                    </span>
                    <p className="text-slate-400 mt-1 text-[13px] leading-relaxed">
                      {selectedCandidate.bio}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {selectedCandidate.expectedSalary && (
                    <div>
                      <span className="text-slate-500 text-[11px] uppercase">
                        Expected Salary
                      </span>
                      <p className="text-emerald-500 mt-1 text-sm font-semibold">
                        {selectedCandidate.expectedSalary}
                      </p>
                    </div>
                  )}
                  {selectedCandidate.noticePeriod && (
                    <div>
                      <span className="text-slate-500 text-[11px] uppercase">
                        Notice Period
                      </span>
                      <p className="text-amber-500 mt-1 text-sm font-semibold">
                        {selectedCandidate.noticePeriod}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(
                  selectedCandidate.skillsArray ||
                  selectedCandidate.skills.split(", ")
                ).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="py-1.5 px-3 bg-violet-500/20 text-violet-300 rounded-md text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                Education
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase">
                    Highest Qualification
                  </span>
                  <p className="text-slate-200 mt-1 text-sm font-medium">
                    {selectedCandidate.education}
                  </p>
                </div>
                {selectedCandidate.university && (
                  <div>
                    <span className="text-slate-500 text-[11px] uppercase">
                      University/School
                    </span>
                    <p className="text-slate-200 mt-1 text-sm font-medium">
                      {selectedCandidate.university}
                    </p>
                  </div>
                )}
                {selectedCandidate.graduationYear && (
                  <div>
                    <span className="text-slate-500 text-[11px] uppercase">
                      Graduation Year
                    </span>
                    <p className="text-slate-200 mt-1 text-sm font-medium">
                      {selectedCandidate.graduationYear}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(selectedCandidate.linkedinUrl ||
              selectedCandidate.githubUrl ||
              selectedCandidate.resumeUrl) && (
              <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
                <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                  Links
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedCandidate.linkedinUrl && (
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-[#0077b5] text-white rounded-md text-xs font-medium no-underline flex items-center gap-1.5"
                    >
                      LinkedIn
                    </a>
                  )}
                  {selectedCandidate.githubUrl && (
                    <a
                      href={selectedCandidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-4 bg-neutral-800 text-white rounded-md text-xs font-medium no-underline flex items-center gap-1.5"
                    >
                      GitHub
                    </a>
                  )}
                  {selectedCandidate.resumeUrl && (
                    <Button
                      type="button"
                      onClick={handleViewResume}
                      disabled={resumeLinkLoading}
                      className="py-2 px-4 bg-red-500 text-white rounded-md text-xs font-medium border-0"
                    >
                      {resumeLinkLoading ? "Opening…" : "View Resume"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="mb-5 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <h4 className="text-slate-200 text-sm font-semibold mb-3 uppercase border-b border-slate-700 pb-2">
                Application Info
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase">
                    Applied Date
                  </span>
                  <p className="text-slate-200 mt-1 text-sm font-medium">
                    {selectedCandidate.appliedDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <button
                onClick={() => {
                  handleCloseCandidateDetail();
                  handleReject(selectedCandidate);
                }}
                className="flex-1 py-3.5 bg-red-500 text-white border-0 rounded-lg cursor-pointer font-semibold text-sm"
              >
                Reject
              </button>
              <button
                onClick={handleCloseCandidateDetail}
                className="flex-1 py-3.5 bg-slate-700 text-white border-0 rounded-lg cursor-pointer font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      <RejectionEmailModal
        isOpen={showRejectionModal}
        onClose={handleCloseRejectionModal}
        onConfirm={handleConfirmRejection}
        candidate={
          selectedCandidate
            ? { name: selectedCandidate.name, email: selectedCandidate.email }
            : null
        }
        job={selectedJob ? { title: selectedJob.title } : null}
        company={COMPANY_PLACEHOLDER}
        isLoading={false}
      />
    </>
  );
};

export default HRApplicationsPage;
