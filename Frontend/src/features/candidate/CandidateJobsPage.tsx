import React from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button, SearchInput, Pagination } from "../../components/common";
import { useCandidateJob } from "../../hooks/candidate/useCandidateJob";


const CandidateJobsPage: React.FC = () => {
    const [showMobileDetail, setShowMobileDetail] = React.useState(false);
    const {
        selectedJob,
        showApplicationConfirm,
        coverLetter,
        setCoverLetter,
        profileResumeUrl,
        useResumeFromProfile,
        setUseResumeFromProfile,
        applicationResumeUrl,
        isUploadingResume,
        handleResumeFileSelect,
        submitError,
        isSubmitting,
        jobs,
        total,
        totalPages,
        isLoading,
        error,
        searchQuery,
        jobTypeFilter,
        setJobTypeFilter,
        sortOrder,
        setSortOrder,
        page,
        setPage,
        hasActiveFilters,
        handleJobClick,
        handleApplyClick,
        handleCancelApplication,
        handleSubmitApplication,
        handleClearFilters,
        handleSearch,
        handlePageChange,
        formatPostedTime,
        buttonn
    } = useCandidateJob();

    // Auto-select the first job whenever jobs list changes
    React.useEffect(() => {
        if (jobs.length > 0) {
            if (!selectedJob || !jobs.some(j => j.id === selectedJob.id)) {
                handleJobClick(jobs[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobs]);


    /* ───────────────── Application Confirm Screen (unchanged) ───────────────── */
    if (selectedJob && showApplicationConfirm) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
                <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                    <CandidateNavHeader title="CONFIRM APPLICATION" currentPage="jobs" />

                    <div className="pt-[72px] py-6 px-3 sm:px-6 lg:px-12 pb-16 sm:pb-20 max-md:pb-12">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <h1 className="m-0 text-2xl sm:text-3xl font-extrabold text-white mb-2">
                                    Apply for {selectedJob.title}
                                </h1>
                                <p className="m-0 text-[rgba(148,163,184,0.9)] text-sm sm:text-base">
                                    {selectedJob.companyName || "Company"}
                                </p>
                            </div>

                            <div className="mb-6 rounded-xl border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.12)] px-4 py-4 sm:px-5 sm:py-5">
                                <h3 className="m-0 text-[15px] sm:text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(16,185,129,0.12)] text-xs">
                                        ✓
                                    </span>
                                    Your profile information will be used
                                </h3>
                                <p className="m-0 text-[13px] sm:text-sm text-[rgba(148,163,184,0.95)] leading-relaxed">
                                    Your application will include your profile data: name, email, phone,
                                    experience, education, skills, and expected salary. Choose your resume below.
                                </p>
                            </div>

                            {submitError && (
                                <div className="mb-5 rounded-lg border border-red-500/50 bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm text-red-200">
                                    {submitError}
                                </div>
                            )}

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-[rgba(226,232,240,0.95)] mb-2">
                                    Resume
                                </label>
                                {profileResumeUrl ? (
                                    <>
                                        <label className="flex items-center gap-2.5 cursor-pointer mb-3 select-none">
                                            <input
                                                type="checkbox"
                                                checked={useResumeFromProfile}
                                                onChange={(e) => setUseResumeFromProfile(e.target.checked)}
                                                className="w-5 h-5 shrink-0 rounded border-2 border-slate-400 bg-slate-800 accent-indigo-500 cursor-pointer focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                                            />
                                            <span className="text-sm text-[rgba(226,232,240,0.95)]">
                                                Use resume from profile
                                            </span>
                                        </label>
                                        {useResumeFromProfile ? (
                                            <div className="flex items-center gap-2 p-3 rounded-lg border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.6)]">
                                                <a
                                                    href={profileResumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-brand-primary no-underline font-medium text-sm hover:underline"
                                                >
                                                    View profile resume
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 p-4 rounded-lg border border-dashed border-[rgba(148,163,184,0.4)] bg-[rgba(15,23,42,0.5)]">
                                                <label className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[rgba(102,126,234,0.2)] border border-[rgba(102,126,234,0.4)] text-sm font-medium text-indigo-200 cursor-pointer hover:bg-[rgba(102,126,234,0.3)] transition-colors">
                                                    {isUploadingResume ? "Uploading…" : "↑ Add new resume (PDF)"}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleResumeFileSelect}
                                                        disabled={isUploadingResume}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {applicationResumeUrl && (
                                                    <a
                                                        href={applicationResumeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-emerald-400 hover:underline"
                                                    >
                                                        View uploaded resume
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2 p-4 rounded-lg border border-dashed border-[rgba(148,163,184,0.4)] bg-[rgba(15,23,42,0.5)]">
                                        <p className="text-sm text-[rgba(148,163,184,0.9)] m-0">No resume in your profile. Upload one for this application.</p>
                                        <label className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[rgba(102,126,234,0.2)] border border-[rgba(102,126,234,0.4)] text-sm font-medium text-indigo-200 cursor-pointer hover:bg-[rgba(102,126,234,0.3)] transition-colors w-fit">
                                            {isUploadingResume ? "Uploading…" : "↑ Add resume (PDF)"}
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleResumeFileSelect}
                                                disabled={isUploadingResume}
                                                className="hidden"
                                            />
                                        </label>
                                        {applicationResumeUrl && (
                                            <a
                                                href={applicationResumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-emerald-400 hover:underline"
                                            >
                                                View uploaded resume
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-[rgba(226,232,240,0.95)] mb-2">
                                    Cover Letter <span className="opacity-70 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={5}
                                    placeholder="Tell us why you're a great fit for this role..."
                                    className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.9)] px-3 py-2.5 text-sm text-slate-100 placeholder:text-[rgba(148,163,184,0.7)] outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.45)] resize-y min-h-[120px]"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancelApplication}
                                    className="inline-flex items-center justify-center rounded-lg border border-[rgba(148,163,184,0.5)] bg-[rgba(15,23,42,0.8)] px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-[rgba(30,41,59,0.9)] transition-colors"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSubmitApplication}
                                    disabled={!applicationResumeUrl || isSubmitting}
                                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary to-brand-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(79,70,229,0.45)] hover:shadow-[0_14px_35px_rgba(79,70,229,0.6)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting…" : "Submit Application"}
                                </Button>
                            </div>

                            <p className="mt-4 text-center text-[11px] sm:text-xs text-[rgba(148,163,184,0.9)]">
                                By submitting, you agree to share your profile information with the employer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    /* ───────────────── Main Split Layout ───────────────── */
    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] overflow-x-hidden lg:h-screen lg:overflow-hidden">
            <div className="min-h-screen w-full bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] flex flex-col lg:h-full lg:overflow-hidden">
                <CandidateNavHeader title="AVAILABLE JOBS" currentPage="jobs" />

                <div className="pt-[72px] flex flex-col lg:flex-row flex-1 lg:overflow-hidden">

                    {/* ─── Left Panel: Job List (fixed, no scroll) ─── */}
                    <div
                        className={`${showMobileDetail ? "hidden lg:flex" : "flex"} w-full lg:w-[55%] flex-col border-b border-[rgba(255,255,255,0.06)] lg:border-b-0 lg:border-r lg:border-[rgba(255,255,255,0.06)] lg:overflow-hidden`}
                    >

                        {/* Filters */}
                        <div className="shrink-0 px-3 py-4 sm:px-5 border-b border-[rgba(255,255,255,0.06)]">
                            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div className="w-full md:max-w-[320px]">
                                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                        Search
                                    </label>
                                    <SearchInput
                                        placeholder="Search jobs..."
                                        onSearch={handleSearch}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto md:flex md:flex-wrap md:items-end">
                                    <div className="w-full sm:w-auto sm:min-w-[160px]">
                                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                            Job type
                                        </label>
                                        <select
                                            value={jobTypeFilter}
                                            onChange={(e) => { setJobTypeFilter(e.target.value); setPage(1); }}
                                            className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Temporary">Temporary</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-auto sm:min-w-[160px]">
                                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                            Date order
                                        </label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => { setSortOrder(e.target.value as "asc" | "desc"); setPage(1); }}
                                            className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
                                        >
                                            <option value="desc">Newest first</option>
                                            <option value="asc">Oldest first</option>
                                        </select>
                                    </div>
                                    {hasActiveFilters && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleClearFilters}
                                            className="inline-flex items-center justify-center rounded-lg border border-[rgba(148,163,184,0.6)] bg-[rgba(15,23,42,0.9)] px-3 py-2 text-xs sm:text-sm font-medium text-slate-100 hover:bg-[rgba(30,41,59,0.95)] transition-colors whitespace-nowrap w-full sm:w-auto"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Job Cards */}
                        <div className="px-3 sm:px-4 py-3 space-y-3 lg:flex-1 lg:overflow-y-auto">
                            {error && (
                                <div className="rounded-lg border border-red-500/50 bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm text-red-200">
                                    Failed to load jobs: {error}
                                </div>
                            )}

                            {!isLoading && total === 0 && !error ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-6 py-14 text-center">
                                    <h3 className="m-0 text-lg font-semibold text-slate-100 mb-2">
                                        {searchQuery || jobTypeFilter !== "all" ? "No jobs found" : "No jobs available"}
                                    </h3>
                                    <p className="m-0 text-sm text-[rgba(148,163,184,0.9)]">
                                        {searchQuery || jobTypeFilter !== "all"
                                            ? "No jobs match your search criteria. Try adjusting your filters."
                                            : "Check back later for new opportunities."}
                                    </p>
                                </div>
                            ) : isLoading && jobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-6 py-14 text-center">
                                    <p className="m-0 text-sm text-[rgba(148,163,184,0.9)]">Loading jobs...</p>
                                </div>
                            ) : (
                                jobs.filter((job) => job.status === "OPEN").map((job) => (
                                    <button
                                        key={job.id}
                                        type="button"
                                        onClick={() => {
                                            handleJobClick(job);
                                            setShowMobileDetail(true);
                                        }}
                                        className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-200 cursor-pointer ${
                                            selectedJob?.id === job.id
                                                ? 'border-brand-primary bg-[rgba(102,126,234,0.08)] border-l-[3px] border-l-brand-primary'
                                                : 'border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.6)] hover:bg-[rgba(30,41,59,0.7)] hover:border-[rgba(255,255,255,0.12)]'
                                        }`}
                                    >
                                        <div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="m-0 text-[14px] font-semibold text-white truncate">
                                                    {job.title}
                                                </h4>
                                                <p className="m-0 mt-0.5 text-[12px] text-[rgba(148,163,184,0.9)] break-words">
                                                    {job.companyName || "Company"}
                                                    <span className="mx-1.5">•</span>
                                                    {job.location}
                                                    {job.jobType && (<><span className="mx-1.5">•</span>{job.jobType}</>)}
                                                    <span className="mx-1.5">•</span>
                                                    {formatPostedTime(job.createdAt)}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {job.jobType && (
                                                        <span className="inline-flex rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-[rgba(16,185,129,0.3)]">
                                                            {job.jobType}
                                                        </span>
                                                    )}
                                                    {job.workMode && (
                                                        <span className="inline-flex rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-[rgba(16,185,129,0.3)]">
                                                            {job.workMode}
                                                        </span>
                                                    )}
                                                    {!job.salaryNonDisclosure && job.salary && (
                                                        <span className="inline-flex rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-[rgba(16,185,129,0.3)]">
                                                            Salary · {job.salary}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Pagination — anchored at bottom of left panel */}
                        <div className="shrink-0 mt-auto px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
                            {totalPages > 0 && jobs.length > 0 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages || 1}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>

                    {/* ─── Right Panel: Job Detail (only scrollable area) ─── */}
                    <div className={`${showMobileDetail ? "block" : "hidden lg:block"} w-full lg:w-[45%] bg-[rgba(10,12,20,0.4)] lg:overflow-y-auto`}>
                        {selectedJob && jobs.some((job) => job.id === selectedJob.id) ? (
                            <div className="px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
                               
                                <h2 className="m-0 text-base font-semibold text-[rgba(226,232,240,0.9)] mb-5">
                                    Job Detail
                                </h2>

                                {/* Job Header Card */}
                                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.7)] px-5 py-5 mb-6">
                                    <h3 className="m-0 text-lg font-bold text-white">{selectedJob.title}</h3>
                                  
                                    
                                    <p className="m-0 mt-1 text-[13px] text-[rgba(148,163,184,0.9)]">
                                        {selectedJob.companyName || "Company"}
                                        <span className="mx-1.5">•</span>
                                        {selectedJob.location}
                                        {selectedJob.jobType && (<><span className="mx-1.5">•</span>{selectedJob.jobType}</>)}
                                    </p>
                                </div>

                                {/* Key Highlights */}
                                <div className="mb-6">
                                    <h4 className="m-0 text-sm font-semibold text-[rgba(226,232,240,0.9)] mb-3">Key Highlights</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.5)] px-3 py-3">
                                            <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.7)] mb-1">Salary</p>
                                            <p className="m-0 text-[13px] font-medium text-emerald-400">
                                                {selectedJob.salaryNonDisclosure ? "Not disclosed" : selectedJob.salary || "-"}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.5)] px-3 py-3">
                                            <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.7)] mb-1">Experience Level</p>
                                            <p className="m-0 text-[13px] font-medium text-[rgba(226,232,240,0.9)]">
                                                {selectedJob.experienceLevel}
                                                {(selectedJob.minExperience || selectedJob.maxExperience) &&
                                                    ` · ${[selectedJob.minExperience, selectedJob.maxExperience].filter(Boolean).join("–")} yrs`}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.5)] px-3 py-3">
                                            <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.7)] mb-1">Location</p>
                                            <p className="m-0 text-[13px] font-medium text-[rgba(226,232,240,0.9)]">{selectedJob.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Job Description */}
                                <div className="space-y-5 text-[14px] leading-relaxed text-[rgba(148,163,184,0.96)]">
                                    <div>
                                        <h4 className="m-0 text-[15px] font-bold text-[rgba(226,232,240,0.96)] mb-1.5">Detailed Job Description</h4>
                                        <h5 className="m-0 text-[14px] font-semibold text-[rgba(226,232,240,0.85)] mb-1">Role Summary</h5>
                                        <p className="m-0 whitespace-pre-wrap">{selectedJob.description || "No description available."}</p>
                                    </div>

                                    {selectedJob.responsibilities && (
                                        <div>
                                            <h5 className="m-0 text-[14px] font-semibold text-[rgba(226,232,240,0.85)] mb-1">Responsibilities</h5>
                                            <p className="m-0 whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                                        </div>
                                    )}

                                    {selectedJob.qualifications && (
                                        <div>
                                            <h5 className="m-0 text-[14px] font-semibold text-[rgba(226,232,240,0.85)] mb-1">Requirements</h5>
                                            <p className="m-0 whitespace-pre-wrap">{selectedJob.qualifications}</p>
                                        </div>
                                    )}

                                    {selectedJob.skills && (
                                        <div>
                                            <h5 className="m-0 text-[14px] font-semibold text-[rgba(226,232,240,0.85)] mb-1">Required Skills</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(selectedJob.skills)
                                                    ? selectedJob.skills
                                                    : String(selectedJob.skills).split(",")
                                                ).map((skill: string, idx: number) => {
                                                    const label = skill.trim();
                                                    if (!label) return null;
                                                    return (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex rounded-full bg-[rgba(129,140,248,0.16)] px-3 py-1.5 text-xs font-semibold text-indigo-200 border border-[rgba(129,140,248,0.45)]"
                                                        >
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {selectedJob.benefits && (
                                        <div>
                                            <h5 className="m-0 text-[14px] font-semibold text-[rgba(226,232,240,0.85)] mb-1">Benefits</h5>
                                            <p className="m-0 whitespace-pre-wrap">{selectedJob.benefits}</p>
                                        </div>
                                    )}

                                    {selectedJob.interviewRounds && selectedJob.interviewRounds.length > 0 && (
                                        <div>
                                            <h5 className="m-0 text-[14px] font-semibold text-[rgba(226,232,240,0.85)] mb-1">Interview Rounds</h5>
                                            <ul className="m-0 pl-5 space-y-1 text-[14px]">
                                                {selectedJob.interviewRounds.map((round, idx) => (
                                                    <li key={idx}>{round}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Apply Button */}
                                <div className="mt-6 flex items-center justify-stretch sm:justify-end">
                                    {buttonn ? (
                                        <Button
                                            type="button"
                                            onClick={handleApplyClick}
                                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark transition-colors"
                                        >
                                            Apply Now
                                        </Button>
                                    ) : (
                                        <span className="inline-flex w-full sm:w-auto justify-center rounded-lg bg-[rgba(148,163,184,0.12)] border border-[rgba(148,163,184,0.3)] px-5 py-2 text-sm font-medium text-[rgba(148,163,184,0.95)]">
                                            Already Applied
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-[rgba(148,163,184,0.7)]">Select a job to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateJobsPage;
