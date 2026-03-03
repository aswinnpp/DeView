import { Table, Button, Input, SearchInput, Pagination } from "../../components/common";
import { useJobs } from "../../hooks/jobs/useJobs";

const JobsPage = () => {
  const {
    jobs,
    isLoading,
    jobsError,
    jobCreateError,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    myJobs,
    paginatedJobs,
    totalPages,
    isCreating,
    viewingJob,
    setViewingJob,
    currentVariant,
    isActive,
    register,
    handleSubmit,
    errors,
    fields,
    append,
    remove,
    swap,
    salaryNonDisclosure,
    onSubmit,
    openCreateModal,
    openEditModal,
    handleCloseModal,
    handleStatusChange,
    setJobCreateError,
  } = useJobs();

  const inputClass =
    "w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
  const labelClass = "block text-slate-400 text-xs font-medium mb-1.5";

  const isInitialLoading = isLoading && jobs.length === 0;

  return (
    <div className="py-4 md:py-6 px-0">

      {/* ── Page header ── */}
      <header className="flex flex-wrap justify-between items-start gap-3 mb-5 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 m-0 mb-1">Job Management</h2>
          <p className="text-slate-400 text-sm m-0">Manage open roles and view applications.</p>
        </div>
        {isActive && (
          <Button
            type="button"
            className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90 border-0 py-2.5 px-4 md:px-5 rounded-lg font-semibold text-sm whitespace-nowrap"
            onClick={openCreateModal}
          >
            + Add New Job
          </Button>
        )}
      </header>

      {/* ── Jobs error banner ── */}
      {jobsError && (
        <div className="mb-4 p-4 rounded-lg bg-slate-800/80 border border-red-500/50 text-red-300 text-sm">
          <strong>Error loading jobs:</strong> {jobsError}
        </div>
      )}

      {/* ── Plan-limit error modal ── */}
      {jobCreateError && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setJobCreateError(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-md w-full border border-red-500/40 shadow-2xl shadow-black/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 border-b border-slate-700 flex items-start gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 text-xl font-bold shrink-0">
                !
              </div>
              <div>
                <h3 className="m-0 text-base md:text-lg font-semibold text-slate-50">Unable to create job</h3>
                <p className="mt-2 mb-0 text-sm text-slate-300 whitespace-pre-line">{jobCreateError}</p>
              </div>
            </div>
            <div className="px-5 py-4 flex justify-end gap-3 border-t border-slate-800 bg-slate-950/80">
              <Button
                type="button"
                variant="secondary"
                className="bg-slate-800/80 text-slate-200 border border-slate-600 hover:bg-slate-700 hover:text-slate-50 hover:border-slate-500 py-2 px-4 rounded-lg text-sm font-semibold"
                onClick={() => setJobCreateError(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {(isCreating || currentVariant === "edit") && (
        <div
          className="fixed inset-0 bg-black/75 flex items-start justify-center z-[1000] p-3 md:p-5 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-[900px] w-full border border-slate-600 p-4 md:p-8 my-3 md:my-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-5 md:mb-6 pb-4 border-b border-slate-600">
              <h3 className="m-0 text-lg md:text-2xl font-bold text-slate-50">
                {currentVariant === "edit" ? "Edit Job" : "Create New Job"}
              </h3>
              <Button
                type="button"
                variant="secondary"
                className="!w-9 !h-9 md:!w-10 md:!h-10 !min-w-0 flex items-center justify-center rounded-lg text-slate-400 hover:!bg-slate-700 hover:text-slate-50 text-2xl !p-0 !border-0 shrink-0"
                onClick={handleCloseModal}
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Basic Info */}
              <div className="mb-5 md:mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Input
                    label="Job Title *"
                    wrapperClassName="flex flex-col gap-1.5"
                    labelClassName={labelClass}
                    className={inputClass}
                    error={errors.title?.message}
                    {...register("title")}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  <Input
                    label="Department *"
                    wrapperClassName="flex flex-col gap-1.5"
                    labelClassName={labelClass}
                    className={inputClass}
                    error={errors.department?.message}
                    {...register("department")}
                    placeholder="e.g., Engineering"
                  />
                  <Input
                    label="Location *"
                    wrapperClassName="flex flex-col gap-1.5"
                    labelClassName={labelClass}
                    className={inputClass}
                    error={errors.location?.message}
                    {...register("location")}
                    placeholder="e.g., New York, NY"
                  />
                  <Input
                    label="Number of Positions *"
                    type="number"
                    wrapperClassName="flex flex-col gap-1.5"
                    labelClassName={labelClass}
                    className={inputClass}
                    error={errors.numberOfPositions?.message}
                    {...register("numberOfPositions", { min: 1 })}
                    min={1}
                  />
                </div>
              </div>

              {/* Employment Details */}
              <div className="mb-5 md:mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4">Employment Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Job Type *</label>
                    <select className={inputClass} {...register("jobType")}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Work Mode *</label>
                    <select className={inputClass} {...register("workMode")}>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Experience Level *</label>
                    <select className={inputClass} {...register("experienceLevel")}>
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Experience & Compensation */}
              <div className="mb-5 md:mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4">Experience & Compensation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Min Experience (Years)</label>
                    <input type="number" className={inputClass} placeholder="0" min={0} {...register("minExperience")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Max Experience (Years)</label>
                    <input type="number" className={inputClass} placeholder="10" min={0} {...register("maxExperience")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Salary Range {!salaryNonDisclosure && "*"}</label>
                    <input
                      className={inputClass}
                      disabled={!!salaryNonDisclosure}
                      placeholder="e.g., $80,000 - $120,000"
                      {...register("salary")}
                    />
                    {errors.salary?.message && (
                      <span className="text-xs text-red-400">{errors.salary.message}</span>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer text-slate-300 text-sm">
                  <input type="checkbox" className="w-4 h-4 rounded" {...register("salaryNonDisclosure")} />
                  Non-Disclosure Salary
                </label>
              </div>

              {/* Deadline */}
              <div className="mb-5 md:mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4">Application Deadline</h4>
                <div className="w-full sm:max-w-[300px] flex flex-col gap-1.5">
                  <label className={labelClass}>Deadline Date</label>
                  <input type="date" className={inputClass} {...register("applicationDeadline")} />
                  {errors.applicationDeadline?.message && (
                    <span className="text-xs text-red-400">
                      {errors.applicationDeadline.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Interview Rounds */}
              <div className="mb-5 md:mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4">Interview Rounds</h4>
                <div className="flex flex-col gap-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        className={`${inputClass} flex-1 min-w-0`}
                        placeholder={`Round ${index + 1}`}
                        {...register(`interviewRounds.${index}`)}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          className="p-2 rounded border border-slate-500 text-slate-400 text-xs hover:bg-slate-700 shrink-0"
                          onClick={() => swap(index, index - 1)}
                          title="Move Up"
                        >↑</button>
                      )}
                      {index < fields.length - 1 && (
                        <button
                          type="button"
                          className="p-2 rounded border border-slate-500 text-slate-400 text-xs hover:bg-slate-700 shrink-0"
                          onClick={() => swap(index, index + 1)}
                          title="Move Down"
                        >↓</button>
                      )}
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="p-2 rounded border border-red-500/50 text-red-400 text-xs bg-red-500/10 hover:bg-red-500/20 shrink-0"
                          onClick={() => remove(index)}
                          title="Remove"
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
                {typeof errors.interviewRounds?.message === "string" && (
                  <p className="text-xs text-red-400 mt-1">{errors.interviewRounds.message}</p>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 !bg-violet-500/10 !border-violet-500 border text-violet-300 hover:!bg-violet-500/20"
                  onClick={() => append("")}
                >
                  + Add Round
                </Button>
              </div>

              {/* Job Details */}
              <div className="mb-5 md:mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4">Job Details</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Job Description *</label>
                    <textarea
                      className={`${inputClass} resize-y min-h-[90px]`}
                      rows={4}
                      placeholder="Detailed description..."
                      {...register("description")}
                    />
                    {errors.description?.message && (
                      <span className="text-xs text-red-400">{errors.description.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Key Responsibilities *</label>
                    <textarea
                      className={`${inputClass} resize-y min-h-[90px]`}
                      rows={4}
                      placeholder="One per line..."
                      {...register("responsibilities")}
                    />
                    {errors.responsibilities?.message && (
                      <span className="text-xs text-red-400">{errors.responsibilities.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Required Skills *</label>
                    <textarea
                      className={`${inputClass} resize-y`}
                      rows={3}
                      placeholder="Comma-separated"
                      {...register("skills")}
                    />
                    {errors.skills?.message && (
                      <span className="text-xs text-red-400">{errors.skills.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Qualifications *</label>
                    <textarea
                      className={`${inputClass} resize-y`}
                      rows={3}
                      placeholder="Education and requirements..."
                      {...register("qualifications")}
                    />
                    {errors.qualifications?.message && (
                      <span className="text-xs text-red-400">{errors.qualifications.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Benefits & Perks</label>
                    <textarea
                      className={`${inputClass} resize-y`}
                      rows={3}
                      placeholder="e.g., Health insurance, Remote work..."
                      {...register("benefits")}
                    />
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-slate-600">
                <Button
                  type="button"
                  variant="secondary"
                  className="!bg-slate-600 !text-slate-200 hover:!bg-slate-500 border-0 py-2.5 px-5 rounded-lg font-semibold text-sm w-full sm:w-auto"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="!bg-emerald-600 hover:!bg-emerald-500 border-0 py-2.5 px-6 rounded-lg font-semibold text-sm disabled:opacity-50 w-full sm:w-auto"
                  disabled={!isActive}
                >
                  {currentVariant === "edit" ? "Save Changes" : "Create Job"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Search & filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mb-5 md:mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Search by Job Title</label>
          <SearchInput placeholder="Search by job title..." onSearch={setSearchQuery} />
        </div>
        <div className="sm:w-[180px]">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Filter by Status</label>
          <select
            className={inputClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* ── Jobs list ── */}
      {isInitialLoading ? (
        <div className="text-center py-16 text-slate-400">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-14 px-5 rounded-xl bg-slate-900 border border-dashed border-slate-600 text-slate-400 text-sm">
          No jobs posted yet. Create a new job to get started.
        </div>
      ) : (
        <>
          <Table
            columns={[
              { header: "Title",    render: (job) => <span className="text-slate-200 font-semibold">{job.title}</span> },
              { header: "Location", render: (job) => <span className="text-slate-300">{job.location}</span> },
              {
                header: "Type",
                render: (job) => (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${job.jobType === "Full-time" ? "bg-blue-500/20 text-blue-300" : "bg-violet-500/20 text-violet-300"}`}>
                    {job.jobType || "Full-time"}
                  </span>
                ),
              },
              {
                header: "Status",
                render: (job) => (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${job.status === "OPEN" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {job.status}
                  </span>
                ),
              },
              {
                header: "Actions",
                render: (job) =>
                  isActive ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="!py-1 !px-2 text-xs !bg-blue-500/10 !border-blue-500/50 border text-blue-300 hover:!bg-blue-500/20"
                        onClick={() => setViewingJob(job)}
                      >
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="!py-1 !px-2 text-xs border border-slate-500 text-slate-300 hover:!bg-slate-700"
                        onClick={(e) => handleStatusChange(e, job)}
                      >
                        {job.status === "OPEN" ? "Close" : "Reopen"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="!py-1 !px-2 text-xs border border-slate-500 text-slate-300 hover:!bg-slate-700"
                        onClick={() => openEditModal(job)}
                      >
                        Edit
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Disabled</span>
                  ),
              },
            ]}
            data={paginatedJobs}
            rowKey={(job) => job.id}
            emptyMessage={myJobs.length === 0 ? "No jobs match your filters." : undefined}
            emptySubMessage={myJobs.length === 0 ? "Try adjusting search or filters." : undefined}
          />
          {isLoading && (
            <p className="mt-3 text-xs text-slate-500 text-right">Updating results…</p>
          )}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* ── View Job modal ── */}
      {viewingJob && (
        <div
          className="fixed inset-0 bg-black/75 flex items-start justify-center z-[1000] p-3 md:p-5 overflow-y-auto"
          onClick={() => setViewingJob(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-[800px] w-full border border-slate-600 p-4 md:p-8 my-3 md:my-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-start mb-5 md:mb-6 pb-4 border-b border-slate-600 gap-3">
              <div className="min-w-0">
                <h2 className="m-0 text-lg md:text-2xl font-bold text-slate-50 mb-2 break-words">{viewingJob.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>{viewingJob.department || "N/A"}</span>
                  <span className="text-slate-600">•</span>
                  <span>{viewingJob.location}</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      viewingJob.status === "OPEN" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {viewingJob.status}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="!w-9 !h-9 md:!w-10 md:!h-10 !min-w-0 flex items-center justify-center rounded-lg text-slate-400 hover:!bg-slate-700 hover:text-slate-50 text-2xl !p-0 !border-0 shrink-0"
                onClick={() => setViewingJob(null)}
              >
                ×
              </Button>
            </div>

            {/* Meta grid – 1 col on mobile, 2 on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 md:mb-6">
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Job Type</div>
                <div className="text-slate-200 text-sm">{viewingJob.jobType || "Full-time"}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Work Mode</div>
                <div className="text-slate-200 text-sm">{viewingJob.workMode || "On-site"}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Experience Level</div>
                <div className="text-slate-200 text-sm">{viewingJob.experienceLevel || "Mid-level"}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Positions</div>
                <div className="text-slate-200 text-sm">{viewingJob.numberOfPositions ?? 1}</div>
              </div>
              {(viewingJob.minExperience || viewingJob.maxExperience) && (
                <div>
                  <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Experience Range</div>
                  <div className="text-slate-200 text-sm">{viewingJob.minExperience}–{viewingJob.maxExperience || "10+"} years</div>
                </div>
              )}
              <div>
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Salary</div>
                <div className="text-slate-200 text-sm">
                  {viewingJob.salaryNonDisclosure ? "Non-Disclosed" : (viewingJob.salary || "Not specified")}
                </div>
              </div>
              {viewingJob.applicationDeadline && (
                <div className="sm:col-span-2">
                  <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Application Deadline</div>
                  <div className="text-slate-200 text-sm">{new Date(viewingJob.applicationDeadline).toLocaleDateString()}</div>
                </div>
              )}
            </div>

            {viewingJob.description && (
              <div className="mb-5">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap m-0">{viewingJob.description}</p>
              </div>
            )}
            {viewingJob.responsibilities && (
              <div className="mb-5">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Key Responsibilities</h4>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap m-0">{viewingJob.responsibilities}</p>
              </div>
            )}
            {viewingJob.skills && (
              <div className="mb-5">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingJob.skills.split(",").map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-md bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {viewingJob.qualifications && (
              <div className="mb-5">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Qualifications</h4>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap m-0">{viewingJob.qualifications}</p>
              </div>
            )}
            {viewingJob.benefits && (
              <div className="mb-5">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Benefits</h4>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap m-0">{viewingJob.benefits}</p>
              </div>
            )}

            {/* Modal footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-slate-600">
              <Button
                type="button"
                variant="secondary"
                className="!bg-slate-600 !text-slate-200 hover:!bg-slate-500 border-0 py-2.5 px-5 rounded-lg font-semibold text-sm w-full sm:w-auto"
                onClick={() => {
                  setViewingJob(null);
                  if (viewingJob) openEditModal(viewingJob);
                }}
              >
                Edit Job
              </Button>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
