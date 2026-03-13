import React from "react";
import CandidateNavHeader from "./CandidateNavHeader";
import { Button, SearchInput, Pagination } from "../../components/common";
import { useCandidateJob } from "../../hooks/candidate/useCandidateJob";


const CandidateJobsPage: React.FC = () => {
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







    if (selectedJob && showApplicationConfirm) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
                <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                    <CandidateNavHeader title="CONFIRM APPLICATION" currentPage="jobs" />

                    <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-12 pb-20 max-md:pb-12">
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

    if (selectedJob) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
                <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                    <CandidateNavHeader title="JOB DETAILS" currentPage="jobs" />

                    <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-8 pb-20 max-md:pb-12">
                        <div className="w-full max-w-3xl mx-auto">
                            {/* Header */}
                            <header className="text-center">
                                <p className="m-0 text-xs font-semibold tracking-wide uppercase text-[rgba(148,163,184,0.85)]">
                                    {selectedJob.companyName || "Company"}
                                </p>
                                <h1 className="m-0 mt-2 text-[28px] sm:text-[32px] md:text-[36px] font-extrabold text-[rgba(226,232,240,0.98)] leading-tight tracking-tight">
                                    {selectedJob.title}
                                </h1>
                                <p className="mt-3 mb-1 text-[13px] sm:text-sm text-[rgba(148,163,184,0.9)] flex flex-wrap gap-x-3 gap-y-1 items-center justify-center">
                                    <span>{selectedJob.location}</span>
                                    {selectedJob.jobType && (
                                        <>
                                            <span className="text-[rgba(148,163,184,0.7)]">•</span>
                                            <span>{selectedJob.jobType}</span>
                                        </>
                                    )}
                                    {selectedJob.workMode && (
                                        <>
                                            <span className="text-[rgba(148,163,184,0.7)]">•</span>
                                            <span>{selectedJob.workMode}</span>
                                        </>
                                    )}
                                </p>
                                <p className="m-0 text-[11px] text-[rgba(148,163,184,0.8)]">
                                    Posted on {new Date(selectedJob.createdAt).toLocaleDateString()}
                                    {selectedJob.applicationDeadline && (
                                        <>
                                            {" "}• Apply by{" "}
                                            {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                                        </>
                                    )}
                                </p>
                            </header>

                            {/* Meta row */}
                            <section className="mt-8">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-[rgba(226,232,240,0.9)]">
                                    <div>
                                        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.8)] mb-1">
                                            Experience
                                        </p>
                                        <p className="m-0 text-[13px] text-[rgba(226,232,240,0.9)]">
                                            {selectedJob.experienceLevel}
                                            {(selectedJob.minExperience || selectedJob.maxExperience) &&
                                                ` • ${[selectedJob.minExperience, selectedJob.maxExperience].filter(Boolean).join("–")} yrs`}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.8)] mb-1">
                                            Positions
                                        </p>
                                        <p className="m-0 text-[13px] text-[rgba(226,232,240,0.9)]">
                                            {selectedJob.numberOfPositions ?? "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.8)] mb-1">
                                            Salary
                                        </p>
                                        <p className="m-0 text-[13px] text-[rgba(226,232,240,0.9)]">
                                            {selectedJob.salaryNonDisclosure
                                                ? "Not disclosed"
                                                : selectedJob.salary || "-"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Primary action */}
                            <section className="mt-8 flex justify-center">
                                {buttonn ? (
                                    <Button
                                        type="button"
                                        onClick={handleApplyClick}
                                        className="inline-flex items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-brand-secondary px-8 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(79,70,229,0.5)] hover:shadow-[0_14px_35px_rgba(79,70,229,0.7)] transition-all duration-150"
                                    >
                                        Apply Now
                                    </Button>
                                ) : (
                                    <span className="inline-flex items-center rounded-full border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.9)] px-5 py-2 text-xs font-medium text-[rgba(148,163,184,0.95)]">
                                        Already applied
                                    </span>
                                )}
                            </section>

                            {/* Content sections */}
                            <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[rgba(148,163,184,0.96)] text-left">
                                    <section>
                                        <h2 className="m-0 text-base sm:text-lg font-bold uppercase tracking-wide text-[rgba(226,232,240,0.96)] mb-2">
                                            Job Description
                                        </h2>
                                        <p className="m-0 whitespace-pre-wrap">
                                            {selectedJob.description || "No description available."}
                                        </p>
                                    </section>

                                    {selectedJob.responsibilities && (
                                        <section>
                                            <h2 className="m-0 text-base sm:text-lg font-bold uppercase tracking-wide text-[rgba(226,232,240,0.96)] mb-2">
                                                Key Responsibilities
                                            </h2>
                                            <p className="m-0 whitespace-pre-wrap">
                                                {selectedJob.responsibilities}
                                            </p>
                                        </section>
                                    )}

                                    {selectedJob.qualifications && (
                                        <section>
                                            <h2 className="m-0 text-base sm:text-lg font-bold uppercase tracking-wide text-[rgba(226,232,240,0.96)] mb-2">
                                                Qualifications
                                            </h2>
                                            <p className="m-0 whitespace-pre-wrap">
                                                {selectedJob.qualifications}
                                            </p>
                                        </section>
                                    )}

                                    {selectedJob.skills && (
                                        <section>
                                            <h2 className="m-0 text-base sm:text-lg font-bold uppercase tracking-wide text-[rgba(226,232,240,0.96)] mb-2">
                                                Required Skills
                                            </h2>
                                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                {(Array.isArray(selectedJob.skills)
                                                    ? selectedJob.skills
                                                    : String(selectedJob.skills).split(",")
                                                )
                                                    .map((skill: string, idx: number) => {
                                                        const label = skill.trim();
                                                        if (!label) return null;
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center rounded-full bg-[rgba(129,140,248,0.16)] px-3 py-1.5 text-xs font-semibold text-indigo-200 border border-[rgba(129,140,248,0.45)]"
                                                            >
                                                                {label}
                                                            </span>
                                                        );
                                                    })}
                                            </div>
                                        </section>
                                    )}

                                    {selectedJob.benefits && (
                                        <section>
                                            <h2 className="m-0 text-base sm:text-lg font-bold uppercase tracking-wide text-[rgba(226,232,240,0.96)] mb-2">
                                                Benefits
                                            </h2>
                                            <p className="m-0 whitespace-pre-wrap">
                                                {selectedJob.benefits}
                                            </p>
                                        </section>
                                    )}

                                    {selectedJob.interviewRounds && selectedJob.interviewRounds.length > 0 && (
                                        <section>
                                            <h2 className="m-0 text-base sm:text-lg font-bold uppercase tracking-wide text-[rgba(226,232,240,0.96)] mb-2">
                                                Interview Rounds
                                            </h2>
                                            <ul className="m-0 pl-5 space-y-1 text-[15px] text-left">
                                                {selectedJob.interviewRounds.map((round, idx) => (
                                                    <li key={idx}>{round}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
            <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                <CandidateNavHeader title="AVAILABLE JOBS" currentPage="jobs" />

                <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-12 pb-20 max-md:pb-12">
                    <div className="">
                        <div className="mb-5 sm:mb-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.9)] px-4 py-3.5 sm:px-5 sm:py-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div className="w-full md:max-w-xs">
                                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                        Search
                                    </label>
                                    <SearchInput
                                        placeholder="Search jobs..."
                                        onSearch={handleSearch}
                                    />
                                </div>

                                <div className="flex flex-wrap items-end gap-3">
                                    <div className="w-[120px]">
                                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                            Job type
                                        </label>
                                        <select
                                            value={jobTypeFilter}
                                            onChange={(e) => {
                                                setJobTypeFilter(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-2.5 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Temporary">Temporary</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>

                                    <div className="w-[120px]">
                                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-[rgba(148,163,184,0.9)] mb-1.5">
                                            Date order
                                        </label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => {
                                                setSortOrder(e.target.value as "asc" | "desc");
                                                setPage(1);
                                            }}
                                            className="w-full rounded-lg border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.98)] px-2.5 py-1.5 text-[11px] text-slate-100 outline-none focus:border-brand-primary focus:ring-2 focus:ring-[rgba(102,126,234,0.4)] cursor-pointer"
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
                                            className="inline-flex items-center justify-center rounded-lg border border-[rgba(148,163,184,0.6)] bg-[rgba(15,23,42,0.9)] px-3 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-[rgba(30,41,59,0.95)] transition-colors whitespace-nowrap"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-500/50 bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm text-red-200">
                                Failed to load jobs: {error}
                            </div>
                        )}

                        {(!isLoading && total === 0 && !error) ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.9)] px-6 py-14 text-center">
                                <h3 className="m-0 text-lg font-semibold text-slate-100 mb-2">
                                    {searchQuery || jobTypeFilter !== "all"
                                        ? "No jobs found"
                                        : "No jobs available"}
                                </h3>
                                <p className="m-0 text-sm text-[rgba(148,163,184,0.9)]">
                                    {searchQuery || jobTypeFilter !== "all"
                                        ? "No jobs match your search criteria. Try adjusting your filters."
                                        : "Check back later for new opportunities."}
                                </p>
                            </div>
                        ) : isLoading && jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(148,163,184,0.35)] bg-[rgba(15,23,42,0.9)] px-6 py-14 text-center">
                                <p className="m-0 text-sm text-[rgba(148,163,184,0.9)]">Loading jobs...</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-[rgba(148,163,184,0.4)] bg-[rgba(15,23,42,0.9)]/95 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.7)]">
                                <div className="flex flex-col gap-2 border-b border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.9)] px-4 py-3.5 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="m-0 text-base sm:text-lg font-semibold text-white">
                                            Jobs for you
                                        </h3>
                                        <p className="m-0 text-[11px] sm:text-xs text-[rgba(148,163,184,0.9)] mt-1">
                                            Based on your profile and preferences
                                        </p>
                                    </div>

                                </div>

                                <div>
                                    {jobs.map((job) => (
                                        <button
                                            key={job.id}
                                            type="button"
                                            onClick={() => handleJobClick(job)}
                                            className="flex w-full items-start px-4 py-3.5 sm:px-5 sm:py-4 border-b border-[rgba(148,163,184,0.25)] bg-transparent hover:bg-[rgba(30,41,59,0.9)] transition-colors text-left"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="m-0 text-[13px] sm:text-sm font-semibold text-indigo-200 group-hover:text-indigo-100">
                                                        {job.title}

                                                    </h4>
                                                </div>
                                                <p className="mt-0.5 mb-0 text-[12px] sm:text-xs text-slate-100">
                                                    {job.companyName || "Company"}
                                                    <span className="mx-1.5 text-[rgba(148,163,184,0.9)]">•</span>
                                                    {job.location}
                                                    {job.jobType && (
                                                        <>
                                                            <span className="mx-1.5 text-[rgba(148,163,184,0.9)]">
                                                                •
                                                            </span>
                                                            <span className="text-[rgba(148,163,184,0.95)]">
                                                                {job.jobType}
                                                            </span>
                                                        </>
                                                    )}
                                                    {!job.salaryNonDisclosure && job.salary && (
                                                        <>
                                                            <span className="mx-1.5 text-[rgba(148,163,184,0.9)]">
                                                                •
                                                            </span>
                                                            <span className="text-emerald-400">{job.salary}</span>
                                                        </>
                                                    )}
                                                </p>
                                                <p className="mt-0.5 mb-0 text-[11px] sm:text-[11px] text-[rgba(148,163,184,0.9)]">
                                                    {formatPostedTime(job.createdAt)}
                                                </p>
                                            </div>

                                            <div className="hidden sm:flex items-center text-[rgba(148,163,184,0.9)] text-lg">
                                                →
                                            </div>
                                        </button>
                                    ))}



                                    <Pagination
                                        page={page}
                                        totalPages={totalPages || 1}
                                        onPageChange={handlePageChange}
                                    />
                                </div>


                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateJobsPage;
