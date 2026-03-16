import { useEffect, useState } from "react";

import OfferLetterModal from "../../components/applications/OfferLetterModal";
import RejectionEmailModal from "../../components/applications/RejectionEmailModal";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import { useApplication, COMPANY_PLACEHOLDER } from "../../hooks/application/useApplication";
import Pagination from "../../components/common/Pagination";
import { ToastContainer } from "../../components/common/Toast";
import { applicationsService } from "../../services/applications.service";
import { companyTeamService, type TeamMember } from "../../services/companyTeam.service";
import { interviewerSlotsService } from "../../services/interviewerSlots.service";
import { extractApiError } from "../../api/axios";

// ==================== TYPE DEFINITIONS ====================
interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
    description?: string;
    requirements?: string;
    applicantCount?: number;
    department?: string;
    salary?: string;
    jobType?: string;
}

interface Interviewer {
    id: string;
    name: string;
    email: string;
}

interface CompletedRound {
    roundName: string;
    interviewer: string;
    date: string;
    score: number;
    result: 'PASSED' | 'FAILED';
    feedback: string;
}

interface Candidate {
    id: string;
    applicationId: string;
    jobId: string;
    candidateId: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    education: string;
    skills: string;
    status: 'PENDING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETE' | 'COMPLETED' | 'HIRED' | 'REJECTED' | 'RESCHEDULE_REQUESTED';
    appliedDate: string;
    resume: string | null;
    coverLetter: string | null;
    aiScore?: number;
    currentRound?: string;
    attemptedRounds?: string[];
    completedRounds?: CompletedRound[];
    interviewDetails?: {
        interviewer: string;
        interviewerEmail?: string;
        scheduledDate: string;
        scheduledTime: string;
        round: string;
    };
    // Reschedule request fields
    rescheduleRequest?: {
        originalDate: string;
        originalTime: string;
        requestedDate: string;
        requestedTime: string;
        reason: string;
        requestedAt: string;
    };
    // Extended profile fields
    title?: string;
    currentCompany?: string;
    currentSalary?: string;
    bio?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    preferredWorkMode?: string;
    preferredJobType?: string;
    willingToRelocate?: boolean;
    skillsArray?: string[];
    languages?: string[];
    university?: string;
    graduationYear?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    dateOfBirth?: string;
    resumeUrl?: string;
}



type WorkflowTab = 'PENDING' | 'SHORTLISTED' | 'INTERVIEW_ATTENDEES' | 'INTERVIEW_COMPLETE' | 'HIRED' | 'REJECTED' | 'RESCHEDULE_REQUESTS';

// ==================== DUMMY DATA ====================


// ==================== MAIN COMPONENT ====================
const HRApplicationsPage = () => {
    const {
        jobs,
        jobsPage,
        jobsTotalPages,
        candidatesPage,
        candidatesTotalPages,
        setCandidatePipelineTab,
        pendingApplications,
        paginatedCandidates,
        selectedJob,
        selectedCandidate,  
        handleViewApplications,
        handleReject,
        handleConfirmRejection,
        handleShortlist,
        handleSelectCandidate,
        handleAIScorePendingCandidates,
        getStatusBadge,
        isScoringPendingCandidates,
        scoredCandidateIds,
        candidateScores,
        setJobsPage,
        setCandidatesPage,
        refreshSelectedJobApplications,
    } = useApplication();

    const handleViewResume = async (jobId: string, applicationId: string) => {
        try {
            const url = await applicationsService.getResumeViewUrl(jobId, applicationId);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch {
            // noop
        }
    };

    const [activeTab, setActiveTab] = useState<WorkflowTab>('PENDING');

    // Modal states (pure UI)
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showInterviewerModal, setShowInterviewerModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCandidateDetail, setShowCandidateDetail] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showInterviewLimitModal, setShowInterviewLimitModal] = useState(false);
    const [showFeedbackPendingModal, setShowFeedbackPendingModal] = useState(false);
    const [showScheduleSuccessModal, setShowScheduleSuccessModal] = useState(false);
    const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string>("");
    const [latestInterviewerFeedback, setLatestInterviewerFeedback] = useState<{
        interviewerName: string;
        totalScore: number;
        feedback: string;
        createdAt: string;
    } | null>(null);
    const [isLoadingLatestFeedback, setIsLoadingLatestFeedback] = useState(false);
    const [latestFeedbackError, setLatestFeedbackError] = useState<string | null>(null);

    // Schedule interview step state
    const [scheduleStep, setScheduleStep] = useState(1); // 1 = select interviewer, 2 = select date/time/round

    // Slot-based interview scheduling states
    const [selectedRound, setSelectedRound] = useState('HR Screening');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Legacy states (kept for compatibility)
    const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
    const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
    const [isLoadingInterviewers, setIsLoadingInterviewers] = useState(false);

    const [isLoadingInterviewerSlots, setIsLoadingInterviewerSlots] = useState(false);
    const [interviewerSlotTimes, setInterviewerSlotTimes] = useState<string[]>([]);
    const [interviewerSlotsError, setInterviewerSlotsError] = useState<string | null>(null);

    // Map workflow tab to underlying pipeline tab in useApplication()
    const workflowToPipelineMap: Record<WorkflowTab, "pending" | "shortlist" | "interview" | "interview_complete" | "complete"> = {
        PENDING: "pending",
        SHORTLISTED: "shortlist",
        INTERVIEW_ATTENDEES: "interview",
        INTERVIEW_COMPLETE: "interview_complete",
        HIRED: "interview",
        RESCHEDULE_REQUESTS: "interview",
        REJECTED: "complete",
    };

    const workflowTabs = [
        { key: 'PENDING' as WorkflowTab, label: 'Pending Applications', color: '#f59e0b' },
        { key: 'SHORTLISTED' as WorkflowTab, label: 'Shortlisted', color: '#3b82f6' },
        { key: 'INTERVIEW_ATTENDEES' as WorkflowTab, label: 'Scheduled Interviews', color: '#8b5cf6' },
        { key: 'RESCHEDULE_REQUESTS' as WorkflowTab, label: 'Reschedule Requests', color: '#f97316' },
        { key: 'INTERVIEW_COMPLETE' as WorkflowTab, label: 'Interview Complete', color: '#06b6d4' },
        { key: 'HIRED' as WorkflowTab, label: 'Hired', color: '#10b981' },
        { key: 'REJECTED' as WorkflowTab, label: 'Rejected', color: '#ef4444' },
    ];

    const handleSendOffer = (candidate: Candidate) => {
        handleSelectCandidate(candidate);
        setShowOfferModal(true);
    };

    const handleScheduleInterview = (candidate: Candidate) => {
        handleSelectCandidate(candidate);
        setSelectedInterviewer(null);
        setSelectedDate('');
        setSelectedTime('');
        const jobRounds = selectedJob?.interviewRounds ?? ['HR Screening'];
        const attempted = candidate.attemptedRounds ?? [];
        const available = jobRounds.filter((r: string) => !attempted.includes(r));
        setSelectedRound(available[0] ?? jobRounds[0] ?? 'HR Screening');
        setScheduleStep(1);
        setShowInterviewerModal(true);
    };

    const loadInterviewers = async () => {
        setIsLoadingInterviewers(true);
        try {
            const res = await companyTeamService.listInterviewers();
            const list = (res.data as { data?: TeamMember[] })?.data ?? [];
            setInterviewers(
                list.map((m) => ({
                    id: m.id,
                    name: m.fullName,
                    email: m.email,
                }))
            );
        } catch {
            setInterviewers([]);
        } finally {
            setIsLoadingInterviewers(false);
        }
    };

  
    

    useEffect(() => {
        if (!showInterviewerModal) return;
        if (scheduleStep !== 2) return;
        if (interviewers.length > 0) return;
         loadInterviewers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showInterviewerModal, scheduleStep]);

    function toDDMMYYYYFromYYYYMMDD(s: string): string {
        const [yyyy, mm, dd] = s.split("-");
        return `${dd}-${mm}-${yyyy}`;
    }

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const addMinutes = (iso: string, minutes: number) => {
        const d = new Date(iso);
        d.setMinutes(d.getMinutes() + minutes);
        return d.toISOString();
    };

    useEffect(() => {
        if (!showInterviewerModal) return;
        if (scheduleStep !== 3) return;
        if (!selectedInterviewer?.id) return;
        if (!selectedDate) {
            setInterviewerSlotTimes([]);
            setInterviewerSlotsError(null);
            return;
        }

        const slotDateApi = toDDMMYYYYFromYYYYMMDD(selectedDate);

        let cancelled = false;
        (async () => {
            setIsLoadingInterviewerSlots(true);
            setInterviewerSlotsError(null);
            try {
                const docs = await interviewerSlotsService.getInterviewerSlots(selectedInterviewer.id, {
                    slotDate: slotDateApi,
                });
                const doc = docs?.[0] ?? null;
                if (cancelled) return;
                setInterviewerSlotTimes(doc?.times ?? []);
            } catch (e) {
                if (cancelled) return;
                setInterviewerSlotTimes([]);
                setInterviewerSlotsError(extractApiError(e));
            } finally {
                if (!cancelled) setIsLoadingInterviewerSlots(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [showInterviewerModal, scheduleStep, selectedInterviewer?.id, selectedDate]);

    useEffect(() => {
        if (!showCandidateDetail || !selectedJob || !selectedCandidate) return;
        const isInterviewComplete =
            selectedCandidate.status === 'INTERVIEW_COMPLETE' || selectedCandidate.status === 'COMPLETED';
        if (!isInterviewComplete) return;

        let cancelled = false;
        setIsLoadingLatestFeedback(true);
        setLatestFeedbackError(null);
        setLatestInterviewerFeedback(null);

        (async () => {
            try {
                const fb = await applicationsService.getLatestInterviewerFeedback(
                    selectedJob.id,
                    selectedCandidate.applicationId
                );
                if (!cancelled) setLatestInterviewerFeedback(fb);
            } catch (e) {
                if (cancelled) return;
                const msg = extractApiError(e);
                // If backend returns 404 or "not submitted", treat it as pending (no error).
                const lower = msg.toLowerCase();
                if (lower.includes('not submitted') || lower.includes('not found')) {
                    setLatestInterviewerFeedback(null);
                    setLatestFeedbackError(null);
                } else {
                    setLatestFeedbackError(msg);
                }
            } finally {
                if (!cancelled) setIsLoadingLatestFeedback(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [showCandidateDetail, selectedJob?.id, selectedCandidate?.applicationId, selectedCandidate?.status]);

    // Helper function to format slot date
 

    const handleConfirmOffer = async (data: unknown) => {
        console.log('Sending offer:', data);
        alert(`Offer letter sent to ${selectedCandidate?.name}!`);
        setShowOfferModal(false);
    };



    const handleAssignNextRound = (candidate: Candidate) => {
        const jobRounds = selectedJob?.interviewRounds ?? ['HR Screening'];
        const attempted = candidate.attemptedRounds ?? [];
        const available = jobRounds.filter((r: string) => !attempted.includes(r));
        if (available.length === 0) return; // All rounds done - use Send Offer or Reject instead
        handleSelectCandidate(candidate);
        setSelectedRound(available[0]);
        setScheduleStep(1);
        setShowInterviewerModal(true);
    };

    
   

    // ==================== TABLE COLUMN CONFIG ====================
    const jobColumns = [
        {
            header: "Job Title",
            render: (job: Job) => (
                <div className="text-slate-50 font-semibold text-sm">
                    {job.title}
                </div>
            ),
        },
        {
            header: "Location",
            render: (job: Job) => (
                <span className="text-slate-400 text-sm">
                    {job.location}
                </span>
            ),
        },
        {
            header: "Type",
            render: (job: Job) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${job.type === "Full-time"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-amber-500/10 text-amber-400"
                        }`}
                >
                    {job.type}
                </span>
            ),
        },
        {
            header: "Department",
            render: (job: Job) => (
                <span className="text-slate-400 text-sm">
                    {job.department}
                </span>
            ),
        },
        {
            header: "Salary",
            cellClassName: "text-emerald-400 font-medium text-sm",
            render: (job: Job) => job.salary,
        },
        {
            header: "Applications",
            cellClassName: "text-center",
            render: (job: Job) => (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-500/10 text-blue-400">
                    {job.applicantCount ?? 0}
                </span>
            ),
        },
        {
            header: "Actions",
            cellClassName: "text-right",
            render: (job: Job) => (
                <Button
                    variant="primary"
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-500"
                    onClick={() => handleViewApplications(job)}
                >
                    View Applications
                </Button>
            ),
        },
    ];

    const buildCandidateColumns = (status: WorkflowTab) => {
        const baseColumns = [
            {
                header: "Candidate",
                render: (candidate: Candidate) => (
                    <div>
                        <div className="text-slate-50 font-semibold text-sm">
                            {candidate.name}
                        </div>
                        <div className="text-slate-500 text-xs mt-1">
                            {candidate.email}
                        </div>
                    </div>
                ),
            },
            {
                header: "Experience",
                render: (candidate: Candidate) => (
                    <span className="text-slate-100 text-sm">
                        {candidate.experience}
                    </span>
                ),
            },
            {
                header: "Location",
                render: (candidate: Candidate) => (
                    <span className="text-slate-400 text-sm">
                        {candidate.location}
                    </span>
                ),
            },
            {
                header: "AI Score",
                headerClassName: "text-center w-[120px]",
                cellClassName: "text-center w-[120px]",
                render: (candidate: Candidate) => {
                    const effectiveScore = candidate.aiScore ?? candidateScores[candidate.id];
                    const showScore =
                        status !== "PENDING" ||
                        scoredCandidateIds.has(candidate.id) ||
                        effectiveScore != null;

                    if (!showScore) {
                        return (
                            <div className="flex justify-center">
                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700/40 text-slate-500">
                                    --
                                </span>
                            </div>
                        );
                    }

                    const score = effectiveScore ?? 0;
                    const colorClasses =
                        score >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : score >= 60
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400";

                    return (
                        <div className="flex justify-center">
                            <span
                                className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${colorClasses}`}
                            >
                                {score}%
                            </span>
                        </div>
                    );
                },
            },
        ];

        if (status !== "RESCHEDULE_REQUESTS") {
            baseColumns.push({
                header: "Applied",
                render: (candidate: Candidate) => (
                    <span className="text-slate-500 text-[13px]">
                        {candidate.appliedDate}
                    </span>
                ),
            });
        }

      

        baseColumns.push({
            header: "Actions",
            render: (candidate: Candidate) => (
                <div className="flex gap-2 items-center justify-start flex-wrap">
                    <Button
                        variant="secondary"
                        className="bg-slate-700 hover:bg-slate-600 text-xs font-semibold px-3 py-1.5 rounded-md"
                        onClick={() => {
                            handleSelectCandidate(candidate);
                            setShowCandidateDetail(true);
                        }}
                    >
                        View
                    </Button>
                    {status === "INTERVIEW_COMPLETE" && (() => {
                        const jobRounds = selectedJob?.interviewRounds ?? [];
                        const attempted = candidate.attemptedRounds ?? [];
                        const hasMoreRounds = jobRounds.length > 0 && attempted.length < jobRounds.length;
                        return hasMoreRounds ? (
                            <Button
                                variant="primary"
                                className="bg-violet-600 hover:bg-violet-500 text-xs font-semibold px-3 py-1.5 rounded-md"
                                onClick={() => handleAssignNextRound(candidate)}
                            >
                                Assign Next Round
                            </Button>
                        ) : null;
                    })()}
                </div>
            ),
        });

        return baseColumns;
    };

    // ==================== RENDER ====================
    return (
        <>


            {/* JOBS LIST VIEW */}
            {!selectedJob && (
                <>
                    <h1 className="text-[28px] font-bold text-slate-50 mb-6">
                        Job Applications
                    </h1>
                    <Table<Job>
                        columns={jobColumns}
                        data={jobs}
                        rowKey={(job) => job.id}
                        emptyMessage="No jobs available."
                    />
                    <Pagination
                        page={jobsPage}
                        totalPages={jobsTotalPages}
                        onPageChange={setJobsPage}
                    />
                </>
            )}

            {/* WORKFLOW VIEW (when job is selected) */}
            {selectedJob && (
                <>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-50 m-0">
                                {selectedJob.title}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 mb-0">
                                {selectedJob.location} • {selectedJob.type}
                            </p>
                        </div>
                    </div>

                 
                    {/* Workflow Tabs */}
                    <div className="flex gap-3 mb-6 flex-wrap">
                        {workflowTabs.map(tab => {

                            return (
                                <Button
                                    key={tab.key}
                                    variant={activeTab === tab.key ? "primary" : "secondary"}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setCandidatePipelineTab(workflowToPipelineMap[tab.key]);
                                    }}
                                    className={`rounded-xl text-sm font-semibold flex items-center gap-2 border-2 px-5 py-2.5 ${activeTab === tab.key
                                        ? "bg-transparent"
                                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    {tab.label}

                                </Button>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div>

                        {/* AI Score Button - show only when there are unscored pending candidates */}
                        {activeTab === 'PENDING' && pendingApplications.some(c => c.status === 'PENDING' && (c.aiScore == null || c.aiScore === undefined)) && (
                            <div className="mb-4 flex justify-end">
                                <Button
                                    onClick={handleAIScorePendingCandidates}
                                    disabled={isScoringPendingCandidates}
                                    className={`px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${isScoringPendingCandidates
                                        ? "bg-slate-600 cursor-wait opacity-70"
                                        : "bg-gradient-to-br from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400"
                                        }`}
                                >
                                    {isScoringPendingCandidates ? 'Scoring Candidates...' : 'AI Score Candidates'}
                                </Button>
                            </div>
                        )}

                        {/* Candidates Table */}
                        <Table<Candidate>
                            columns={buildCandidateColumns(activeTab)}
                            data={
                                selectedJob
                                    ? paginatedCandidates
                                        .filter((c) => {
                                            if (activeTab === 'PENDING') return c.status === 'PENDING';
                                            if (activeTab === 'SHORTLISTED') return c.status === 'SHORTLISTED';
                                            if (activeTab === 'INTERVIEW_ATTENDEES') return c.status === 'INTERVIEW_SCHEDULED';
                                            if (activeTab === 'RESCHEDULE_REQUESTS') return c.status === 'RESCHEDULE_REQUESTED';
                                            if (activeTab === 'INTERVIEW_COMPLETE') return c.status === 'COMPLETED' || c.status === 'INTERVIEW_COMPLETE';
                                            if (activeTab === 'HIRED') return c.status === 'HIRED';
                                            if (activeTab === 'REJECTED') return c.status === 'REJECTED';
                                            return true;
                                        })
                                        .map((c) => ({
                                            ...c,
                                            aiScore: c.aiScore ?? candidateScores[c.id],
                                        }))
                                    : []
                            }
                            rowKey={(candidate) => candidate.id}
                            emptyMessage="No candidates in this stage"
                        />
                        <Pagination
                            page={candidatesPage}
                            totalPages={candidatesTotalPages}
                            onPageChange={setCandidatesPage}
                        />
                    </div>
                </>
            )}

            {/* CANDIDATE DETAIL MODAL */}
            {showCandidateDetail && selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, maxWidth: 700, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#e2e8f0', margin: 0 }}>Candidate Details</h3>
                            </div>
                            <button onClick={() => setShowCandidateDetail(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 24 }}>×</button>
                        </div>

                        {/* Header with Avatar */}
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 24
                            }}>
                                {selectedCandidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedCandidate.name}</h3>
                                {selectedCandidate.title && <p style={{ color: '#8b5cf6', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>{selectedCandidate.title}</p>}
                                {selectedCandidate.currentCompany && <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>@ {selectedCandidate.currentCompany}</p>}
                        <div style={{ marginTop: 8 }}>
                            {(() => {
                                const badge = getStatusBadge(selectedCandidate.status);
                                return (
                                    <span className={badge.className}>
                                        {badge.label}
                                    </span>
                                );
                            })()}
                        </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Personal Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Full Name</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.name}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Email</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.email}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Phone</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.phone}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Location</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.location}</p>
                                </div>
                                {selectedCandidate.dateOfBirth && (
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Date of Birth</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.dateOfBirth}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Information (Optional) */}
                        {(selectedCandidate.title || selectedCandidate.currentCompany || selectedCandidate.currentSalary || selectedCandidate.experience) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Professional Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {selectedCandidate.title && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Job Title</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.title}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.currentCompany && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Current Company</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.currentCompany}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Experience</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.experience}</p>
                                    </div>
                                    {selectedCandidate.currentSalary && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Current Salary</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.currentSalary}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* About & Availability */}
                        {(selectedCandidate.bio || selectedCandidate.expectedSalary || selectedCandidate.noticePeriod) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>About & Availability</h4>
                                {selectedCandidate.bio && (
                                    <div style={{ marginBottom: 12 }}>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Bio</span>
                                        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>{selectedCandidate.bio}</p>
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {selectedCandidate.expectedSalary && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Expected Salary</span>
                                            <p style={{ color: '#10b981', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.expectedSalary}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.noticePeriod && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Notice Period</span>
                                            <p style={{ color: '#f59e0b', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.noticePeriod}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Job Preferences */}
                        {(selectedCandidate.preferredWorkMode || selectedCandidate.preferredJobType || selectedCandidate.willingToRelocate !== undefined) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Job Preferences</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    {selectedCandidate.preferredWorkMode && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Preferred Work Mode</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.preferredWorkMode}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.preferredJobType && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Preferred Job Type</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.preferredJobType}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.willingToRelocate !== undefined && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Willing to Relocate</span>
                                            <p style={{ color: selectedCandidate.willingToRelocate ? '#10b981' : '#ef4444', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>
                                                {selectedCandidate.willingToRelocate ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Skills</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {(selectedCandidate.skillsArray || selectedCandidate.skills.split(', ')).map((skill, idx) => (
                                    <span key={idx} style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#8b5cf620',
                                        color: '#a78bfa',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        fontWeight: 500
                                    }}>{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        {selectedCandidate.languages && selectedCandidate.languages.length > 0 && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Languages</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {selectedCandidate.languages.map((lang, idx) => (
                                        <span key={idx} style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#3b82f620',
                                            color: '#60a5fa',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}>{lang}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Education</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Highest Qualification</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.education}</p>
                                </div>
                                {selectedCandidate.university && (
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>University/School</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.university}</p>
                                    </div>
                                )}
                                {selectedCandidate.graduationYear && (
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Graduation Year</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.graduationYear}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Links (Optional) */}
                        {(selectedCandidate.linkedinUrl || selectedCandidate.githubUrl || selectedCandidate.resumeUrl) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Links</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {selectedCandidate.linkedinUrl && (
                                        <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#0077b5',
                                            color: '#fff',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>LinkedIn</a>
                                    )}
                                    {selectedCandidate.githubUrl && (
                                        <a href={selectedCandidate.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#333',
                                            color: '#fff',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>GitHub</a>
                                    )}
                                    {selectedCandidate.resumeUrl && (
                                        <button type="button" onClick={() => handleViewResume(selectedCandidate.jobId, selectedCandidate.applicationId)} style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#ef4444',
                                            color: '#fff',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}>View Resume</button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Application Info */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Application Info</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Applied Date</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.appliedDate}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>AI Score</span>
                                    <p style={{ color: selectedCandidate.aiScore == null ? '#64748b' : selectedCandidate.aiScore >= 80 ? '#10b981' : selectedCandidate.aiScore >= 60 ? '#f59e0b' : '#ef4444', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.aiScore == null ? '--' : `${selectedCandidate.aiScore}%`}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ongoing Interview (for INTERVIEW_SCHEDULED) */}
                        {selectedCandidate.status === 'INTERVIEW_SCHEDULED' && selectedCandidate.interviewDetails && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#8b5cf620', borderRadius: 12, border: '1px solid #8b5cf6' }}>
                                <h4 style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Ongoing Interview</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Round</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 600 }}>{selectedCandidate.interviewDetails.round}</p></div>
                                    <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Interviewer</span><p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>{selectedCandidate.interviewDetails.interviewer}</p></div>
                                    <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Date & Time</span><p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>{selectedCandidate.interviewDetails.scheduledDate} at {selectedCandidate.interviewDetails.scheduledTime}</p></div>
                                </div>
                            </div>
                        )}

                        {/* Completed Rounds */}
                        {selectedCandidate.completedRounds && selectedCandidate.completedRounds.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Completed Interview Rounds</h4>
                                {selectedCandidate.completedRounds.map((round, idx) => (
                                    <div key={idx} style={{ padding: 12, backgroundColor: '#0f172a', borderRadius: 8, marginBottom: 8, border: `1px solid ${round.result === 'PASSED' ? '#10b981' : '#ef4444'}40` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{round.roundName}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, backgroundColor: round.result === 'PASSED' ? '#10b98120' : '#ef444420', color: round.result === 'PASSED' ? '#10b981' : '#ef4444' }}>{round.result}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ color: '#64748b', fontSize: 12 }}>Interviewer: {round.interviewer}</span>
                                            <span style={{ color: '#64748b', fontSize: 12 }}>{round.date}</span>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <span style={{ color: '#94a3b8', fontSize: 12 }}>Score: </span>
                                            <span style={{ color: round.score >= 4 ? '#10b981' : round.score >= 3 ? '#f59e0b' : '#ef4444', fontSize: 12, fontWeight: 600 }}>{round.score.toFixed(1)}/5</span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, fontStyle: 'italic' }}>"{round.feedback}"</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hired - Show Offer Info */}
                        {selectedCandidate.status === 'HIRED' && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#10b98120', borderRadius: 12, border: '1px solid #10b981' }}>
                                <h4 style={{ color: '#10b981', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Offer Letter Sent</h4>
                                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Offer letter has been sent to the candidate. Awaiting response.</p>
                            </div>
                        )}

                        {/* Rejected - Show Rejection Info */}
                        {selectedCandidate.status === 'REJECTED' && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#ef444420', borderRadius: 12, border: '1px solid #ef4444' }}>
                                <h4 style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Rejected</h4>
                                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Candidate has been notified of the rejection.</p>
                            </div>
                        )}

                        {/* Reschedule Request Info */}
                        {selectedCandidate.status === 'RESCHEDULE_REQUESTED' && selectedCandidate.rescheduleRequest && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f9731620', borderRadius: 12, border: '1px solid #f97316' }}>
                                <h4 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    ⏰ Reschedule Request
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: '#0f172a', borderRadius: 8 }}>
                                        <h5 style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' }}>Original Schedule</h5>
                                        <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14, fontWeight: 500 }}>
                                            {new Date(selectedCandidate.rescheduleRequest.originalDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
                                            {selectedCandidate.rescheduleRequest.originalTime}
                                        </p>
                                    </div>
                                    <div style={{ padding: 12, backgroundColor: '#10b98120', borderRadius: 8, border: '1px solid #10b981' }}>
                                        <h5 style={{ color: '#10b981', fontSize: 11, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' }}>Requested Schedule</h5>
                                        <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14, fontWeight: 500 }}>
                                            {new Date(selectedCandidate.rescheduleRequest.requestedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
                                            {selectedCandidate.rescheduleRequest.requestedTime}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Reason</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.rescheduleRequest.reason}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Requested At</span>
                                    <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13 }}>
                                        {new Date(selectedCandidate.rescheduleRequest.requestedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Interviewer Feedback (for completed interviews) */}
                        {(selectedCandidate.status === 'INTERVIEW_COMPLETE' || selectedCandidate.status === 'COMPLETED') && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>
                                    Interviewer Feedback
                                </h4>
                                {isLoadingLatestFeedback ? (
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>Loading feedback...</p>
                                ) : latestFeedbackError ? (
                                    <p style={{ color: '#fca5a5', margin: 0, fontSize: 14 }}>{latestFeedbackError}</p>
                                ) : latestInterviewerFeedback ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Interviewer</span>
                                                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>
                                                    {latestInterviewerFeedback.interviewerName}
                                                </p>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Score</span>
                                                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>
                                                    {latestInterviewerFeedback.totalScore}/5
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Feedback</span>
                                            <p style={{ color: '#e2e8f0', margin: '6px 0 0', fontSize: 14, whiteSpace: 'pre-wrap' }}>
                                                {latestInterviewerFeedback.feedback}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: '#fbbf24', margin: 0, fontSize: 14, fontWeight: 600 }}>
                                        Interviewer feedback: PENDING
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons based on status */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                            {selectedCandidate.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleShortlist(selectedCandidate);
                                            setShowCandidateDetail(false);
                                        }}
                                        style={{ flex: 1, padding: 14, backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                    >
                                        Shortlist
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedCandidate);
                                            setShowCandidateDetail(false);
                                            setShowRejectionModal(true);
                                        }}
                                        style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {selectedCandidate.status === 'SHORTLISTED' && (
                                <button
                                    onClick={() => {
                                        handleScheduleInterview(selectedCandidate);
                                        setShowCandidateDetail(false);
                                    }}
                                    style={{ flex: 1, padding: 14, backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                >
                                    Schedule Interview
                                </button>
                            )}
                            {selectedCandidate.status === 'INTERVIEW_SCHEDULED' && (
                                <button
                                    onClick={() => {
                                        setShowCandidateDetail(false);
                                        handleScheduleInterview(selectedCandidate);
                                    }}
                                    style={{ flex: 1, padding: 14, backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                >
                                    Reschedule Interview
                                </button>
                            )}
                            {(selectedCandidate.status === 'INTERVIEW_COMPLETE' || selectedCandidate.status === 'COMPLETED') && (
                                <>
                                    <button onClick={() => { setShowCandidateDetail(false); handleSendOffer(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Send Offer</button>
                                    <button onClick={() => { setShowCandidateDetail(false); handleReject(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Reject</button>
                                </>
                            )}
                            {selectedCandidate.status === 'RESCHEDULE_REQUESTED' && (
                                <>
                                    <button
                                        onClick={async () => {
                                            try {
                                                if (!selectedJob) return;
                                                await applicationsService.declineRescheduleRequest(selectedJob.id, selectedCandidate.applicationId);
                                                await refreshSelectedJobApplications();
                                                setShowCandidateDetail(false);
                                            } catch {
                                                alert('Could not decline reschedule request. Please try again.');
                                            }
                                        }}
                                        style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                    >
                                        ✗ Decline
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleScheduleInterview(selectedCandidate);
                                            setShowCandidateDetail(false);
                                        }}
                                        style={{ flex: 1, padding: 14, backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                    >
                                        Propose New Time
                                    </button>
                                </>
                            )}
                            <button onClick={() => setShowCandidateDetail(false)} style={{ flex: 1, padding: 14, backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SCHEDULE INTERVIEW MODAL - Three Step Flow */}
            {showInterviewerModal && selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, maxWidth: 800, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#e2e8f0', margin: 0 }}>Schedule Interview</h3>
                                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>for {selectedCandidate.name}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, backgroundColor: scheduleStep === 1 ? '#3b82f620' : scheduleStep === 2 ? '#8b5cf620' : '#10b98120', color: scheduleStep === 1 ? '#3b82f6' : scheduleStep === 2 ? '#8b5cf6' : '#10b981' }}>
                                    Step {scheduleStep} of 3
                                </span>
                            <button onClick={() => { setShowInterviewerModal(false); setSelectedInterviewer(null); setScheduleStep(1); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 24 }}>×</button>
                            </div>
                        </div>

                        {/* STEP 1: Select Round */}
                        {scheduleStep === 1 && (
                            <>
                                <div style={{ marginBottom: 24 }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Select Interview Round</h4>
                                    <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>Choose the type of interview round for this candidate (already attempted rounds are hidden):</p>
                                    {(() => {
                                        const allRounds = selectedJob?.interviewRounds?.length ? selectedJob.interviewRounds : ['HR Screening'];
                                        const availableRounds = allRounds.filter((r: string) => !selectedCandidate.attemptedRounds?.includes(r));
                                        if (availableRounds.length === 0) {
                                            return (
                                                <div style={{ padding: 16, backgroundColor: '#0f172a', borderRadius: 10, border: '1px solid #334155', color: '#94a3b8' }}>
                                                    All rounds completed. Use Send Offer or Reject instead.
                                                </div>
                                            );
                                        }
                                        return (
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {availableRounds.map((round: string) => (
                                            <div
                                                key={round}
                                                onClick={() => setSelectedRound(round)}
                                                style={{
                                                    padding: 16,
                                                    backgroundColor: selectedRound === round ? '#334155' : '#0f172a',
                                                    border: selectedRound === round ? '2px solid #3b82f6' : '1px solid #334155',
                                                    borderRadius: 10,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12
                                                }}
                                            >
                                                <div style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    border: selectedRound === round ? '6px solid #3b82f6' : '2px solid #64748b',
                                                    backgroundColor: selectedRound === round ? '#fff' : 'transparent'
                                                }} />
                                                <span style={{ color: selectedRound === round ? '#3b82f6' : '#e2e8f0', fontWeight: 500, fontSize: 15 }}>{round}</span>
                                            </div>
                                        ))}
                                    </div>
                                        );
                                    })()}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => setScheduleStep(2)}
                                    disabled={!selectedRound || (selectedJob?.interviewRounds?.length ? selectedJob.interviewRounds : ['HR Screening']).filter((r: string) => !selectedCandidate.attemptedRounds?.includes(r)).length === 0}
                                    style={{
                                        width: '100%',
                                        padding: 14,
                                        backgroundColor: !selectedRound ? '#475569' : '#3b82f6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: !selectedRound ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        fontSize: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    Next: Select Interviewer →
                                </button>
                            </>
                        )}

                        {/* STEP 2: Select Interviewer */}
                        {scheduleStep === 2 && (
                            <>
                                {/* Selected Round Summary */}
                                <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Selected Round</span>
                                            <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: 16, margin: '4px 0 0' }}>{selectedRound}</p>
                                        </div>
                                        <button
                                            onClick={loadInterviewers}
                                            disabled={isLoadingInterviewers}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: isLoadingInterviewers ? 'wait' : 'pointer',
                                                fontWeight: 600,
                                                fontSize: 13,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                opacity: isLoadingInterviewers ? 0.7 : 1
                                            }}
                                        >
                                            {isLoadingInterviewers ? 'Loading...' : 'Refresh'}
                                        </button>
                                    </div>
                                </div>

                                {/* Interviewers List */}
                                <div style={{ marginBottom: 20 }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Select Interviewer</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 350, overflowY: 'auto' }}>
                                        {!isLoadingInterviewers && interviewers.length === 0 && (
                                            <div style={{ padding: 16, color: '#94a3b8', backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                                                No interviewers found. Please add interviewers in Company → Interviewers.
                                            </div>
                                        )}
                                        {interviewers.map(interviewer => (
                                            <div
                                                key={interviewer.id}
                                                onClick={() => setSelectedInterviewer(interviewer)}
                                                style={{
                                                    padding: '12px 16px',
                                                    backgroundColor: selectedInterviewer?.id === interviewer.id ? '#1e293b' : '#0f172a',
                                                    border: selectedInterviewer?.id === interviewer.id ? '2px solid #8b5cf6' : '1px solid #334155',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{interviewer.name}</span>
                                                    <span style={{ color: '#64748b', fontSize: 13, marginLeft: 12 }}>{interviewer.email}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    {selectedInterviewer?.id === interviewer.id && (
                                                        <span style={{ color: '#8b5cf6', fontSize: 16, fontWeight: 700 }}>✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Buttons */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => setScheduleStep(1)}
                                        style={{
                                            flex: 1,
                                            padding: 14,
                                            backgroundColor: '#334155',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: 15
                                        }}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => setScheduleStep(3)}
                                        disabled={!selectedInterviewer}
                                        style={{
                                            flex: 2,
                                            padding: 14,
                                            backgroundColor: !selectedInterviewer ? '#475569' : '#8b5cf6',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: !selectedInterviewer ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: 15,
                                            opacity: !selectedInterviewer ? 0.6 : 1
                                        }}
                                    >
                                        Next: Select Date & Time →
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 3: Select Date & Time */}
                        {scheduleStep === 3 && selectedInterviewer && (
                            <>
                                {/* Selection Summary */}
                                <div style={{ marginBottom: 20, padding: 12, backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #334155', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Round</span>
                                        <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: 14, margin: '4px 0 0' }}>{selectedRound}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Interviewer</span>
                                        <p style={{ color: '#8b5cf6', fontWeight: 600, fontSize: 14, margin: '4px 0 0' }}>{selectedInterviewer.name}</p>
                                    </div>
                                </div>

                                {/* Select Date */}
                                <div className="mb-6">
                                    <h4 className="text-[14px] font-semibold text-slate-100 mb-3 uppercase tracking-wide">
                                        Select Date
                                    </h4>
                                    <p className="text-[12px] text-slate-400 mb-3">
                                        Choose a date to see available time slots:
                                    </p>
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedTime('');
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-[15px] cursor-pointer focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.4)]"
                                    />
                                </div>

                                {/* Select Time (only show if date is selected) */}
                                {selectedDate && (
                                    <div style={{ marginBottom: 24 }}>
                                        <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Select Time</h4>
                                        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
                                            {selectedInterviewer.name}'s available slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:
                                        </p>
                                        {isLoadingInterviewerSlots ? (
                                            <div style={{ padding: 16, color: '#94a3b8', backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                                                Loading available slots...
                                            </div>
                                        ) : interviewerSlotsError ? (
                                            <div style={{ padding: 16, color: '#fca5a5', backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                                                {interviewerSlotsError}
                                            </div>
                                        ) : interviewerSlotTimes.length === 0 ? (
                                            <div style={{ padding: 16, color: '#94a3b8', backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                                                No slots available for this date.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                                {[...interviewerSlotTimes]
                                                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                                                    .map((startIso) => {
                                                        const startLabel = formatTime(startIso);
                                                        const endLabel = formatTime(addMinutes(startIso, 60));
                                                        const key = startIso;
                                                        const value = startLabel;
                                                        return (
                                                            <div
                                                                key={key}
                                                                onClick={() => setSelectedTime(value)}
                                                                style={{
                                                                    padding: '14px 16px',
                                                                    backgroundColor: selectedTime === value ? '#334155' : '#0f172a',
                                                                    border: selectedTime === value ? '2px solid #10b981' : '1px solid #334155',
                                                                    borderRadius: 10,
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center'
                                                                }}
                                                            >
                                                                <span style={{ color: selectedTime === value ? '#10b981' : '#e2e8f0', fontWeight: 600, fontSize: 15 }}>
                                                                    {startLabel} - {endLabel}
                                                                </span>
                                                                <p style={{ color: '#64748b', fontSize: 11, margin: '4px 0 0' }}>60 min</p>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Summary */}
                                {selectedDate && selectedTime && (
                                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#10b98120', borderRadius: 12, border: '1px solid #10b981' }}>
                                        <h4 style={{ color: '#10b981', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Interview Summary</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Candidate</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>{selectedCandidate.name}</p></div>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Interviewer</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>{selectedInterviewer.name}</p></div>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Round</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>{selectedRound}</p></div>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Date & Time</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>
                                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                                            </p></div>
                                        </div>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => { setScheduleStep(2); setSelectedDate(''); setSelectedTime(''); }}
                                        style={{
                                            flex: 1,
                                            padding: 14,
                                            backgroundColor: '#334155',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: 16
                                        }}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!selectedDate || !selectedTime) {
                                                alert('Please select a date and time');
                                                return;
                                            }
                                            try {
                                                if (!selectedJob) {
                                                    alert("No job selected");
                                                    return;
                                                }

                                                await applicationsService.scheduleInterview(
                                                    selectedJob.id,
                                                    selectedCandidate.applicationId,
                                                    {
                                                        round: selectedRound,
                                                        interviewerUserId: selectedInterviewer.id,
                                                        interviewerName: selectedInterviewer.name,
                                                        interviewerEmail: selectedInterviewer.email,
                                                        scheduledDate: selectedDate,
                                                        scheduledTime: selectedTime,
                                                    }
                                                );

                                                await refreshSelectedJobApplications();

                                                setScheduleSuccessMessage(
                                                    `Interview scheduled with ${selectedInterviewer.name} on ${new Date(
                                                        selectedDate
                                                    ).toLocaleDateString()} at ${selectedTime}`
                                                );
                                                setShowScheduleSuccessModal(true);

                                                setShowInterviewerModal(false);
                                                setSelectedInterviewer(null);
                                                setSelectedDate('');
                                                setSelectedTime('');
                                                setScheduleStep(1);
                                            } catch (e: unknown) {
                                                const err = e as { response?: { data?: { message?: string } } };
                                                const rawMsg =
                                                    typeof err?.response?.data?.message === 'string'
                                                        ? err.response.data.message
                                                        : e instanceof Error
                                                            ? e.message
                                                            : 'Failed to schedule interview';

                                                const normalized = rawMsg.toLowerCase();
                                                const isLimit =
                                                    normalized.includes('interview scheduling limit') ||
                                                    normalized.includes('interview limit') ||
                                                    normalized.includes('schedule more interviews');
                                                const isFeedbackPending =
                                                    normalized.includes('interviewer feedback pending') ||
                                                    normalized.includes('feedback pending');

                                                if (isLimit) {
                                                    // Close schedule modal and reset its state, then show limit modal
                                                    setShowInterviewerModal(false);
                                                    setSelectedInterviewer(null);
                                                    setSelectedDate('');
                                                    setSelectedTime('');
                                                    setScheduleStep(1);
                                                    setShowInterviewLimitModal(true);
                                                } else if (isFeedbackPending) {
                                                    // Close schedule modal and reset its state, then show pending modal
                                                    setShowInterviewerModal(false);
                                                    setSelectedInterviewer(null);
                                                    setSelectedDate('');
                                                    setSelectedTime('');
                                                    setScheduleStep(1);
                                                    setShowFeedbackPendingModal(true);
                                                } else {
                                                    alert(rawMsg);
                                                }
                                            }
                                        }}
                                        disabled={!selectedDate || !selectedTime}
                                        style={{
                                            flex: 2,
                                            padding: 14,
                                            backgroundColor: (!selectedDate || !selectedTime) ? '#475569' : '#10b981',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: 16
                                        }}
                                    >
                                        Schedule Interview
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* INTERVIEW LIMIT REACHED MODAL */}
            {showInterviewLimitModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15,23,42,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 60,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 460,
                            backgroundColor: '#020617',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #1f2937',
                            boxShadow: '0 25px 50px -12px rgba(15,23,42,0.9)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e5e7eb' }}>
                                Interview limit reached
                            </h2>
                            <button
                                onClick={() => setShowInterviewLimitModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: 22,
                                    lineHeight: 1,
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
                            You’ve reached the maximum number of interviews allowed on your current subscription
                            plan. Upgrade your plan to schedule more interviews
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                onClick={() => setShowInterviewLimitModal(false)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #4b5563',
                                    background: 'transparent',
                                    color: '#e5e7eb',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INTERVIEWER FEEDBACK PENDING MODAL */}
            {showFeedbackPendingModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15,23,42,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 60,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 460,
                            backgroundColor: '#020617',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #1f2937',
                            boxShadow: '0 25px 50px -12px rgba(15,23,42,0.9)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e5e7eb' }}>
                                Interviewer feedback pending
                            </h2>
                            <button
                                onClick={() => setShowFeedbackPendingModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: 22,
                                    lineHeight: 1,
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
                            You can’t assign the next round until the interviewer submits feedback for the previous
                            completed interview.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                onClick={() => setShowFeedbackPendingModal(false)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #4b5563',
                                    background: 'transparent',
                                    color: '#e5e7eb',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INTERVIEW SCHEDULED CONFIRM MODAL */}
            {showScheduleSuccessModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15,23,42,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 60,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 460,
                            backgroundColor: '#020617',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #1f2937',
                            boxShadow: '0 25px 50px -12px rgba(15,23,42,0.9)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e5e7eb' }}>
                                Interview scheduled
                            </h2>
                            <button
                                onClick={() => setShowScheduleSuccessModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: 22,
                                    lineHeight: 1,
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
                            {scheduleSuccessMessage || 'Interview scheduled successfully.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                onClick={() => setShowScheduleSuccessModal(false)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #4b5563',
                                    background: 'transparent',
                                    color: '#e5e7eb',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500,
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXISTING OFFER LETTER MODAL */}
            <OfferLetterModal
                isOpen={showOfferModal}
                onClose={() => { setShowOfferModal(false); }}
                onConfirm={handleConfirmOffer}
                candidate={selectedCandidate ? { name: selectedCandidate.name, email: selectedCandidate.email } : null}
                job={selectedJob ? { title: selectedJob.title, location: selectedJob.location, jobType: selectedJob.jobType || 'Full-time', salary: selectedJob.salary, department: selectedJob.department } : null}
                company={COMPANY_PLACEHOLDER}
                isLoading={false}
            />

            {/* EXISTING REJECTION EMAIL MODAL */}
            <RejectionEmailModal
                isOpen={showRejectionModal}
                onClose={() => setShowRejectionModal(false)}
                onConfirm={async (content) => {
                    await handleConfirmRejection(content);
                    setShowRejectionModal(false);
                }}
                candidate={selectedCandidate ? { name: selectedCandidate.name, email: selectedCandidate.email } : null}
                job={selectedJob ? { title: selectedJob.title } : null}
                company={COMPANY_PLACEHOLDER}
                isLoading={false}
            />

            {/* INTERVIEW FEEDBACK MODAL */}
            {showFeedbackModal && selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, maxWidth: 700, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#e2e8f0', margin: 0 }}>Interview Progress</h3>
                                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.name}</p>
                            </div>
                            <button onClick={() => { setShowFeedbackModal(false); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 24 }}>×</button>
                        </div>

                        {/* Candidate Summary */}
                        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#0f172a', borderRadius: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>Email</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.email}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>Experience</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.experience}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>Location</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.location}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>AI Score</span>
                                    <p style={{ color: selectedCandidate.aiScore == null ? '#64748b' : selectedCandidate.aiScore >= 80 ? '#10b981' : '#f59e0b', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.aiScore == null ? '--' : `${selectedCandidate.aiScore}%`}</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Rounds */}
                        <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase' }}>Completed Interview Rounds</h4>

                        {selectedCandidate.completedRounds && selectedCandidate.completedRounds.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {selectedCandidate.completedRounds.map((round, idx) => (
                                    <div key={idx} style={{
                                        padding: 16,
                                        backgroundColor: '#0f172a',
                                        borderRadius: 12,
                                        border: `1px solid ${round.result === 'PASSED' ? '#10b981' : '#ef4444'}40`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{
                                                    width: 32, height: 32,
                                                    borderRadius: 8,
                                                    backgroundColor: round.result === 'PASSED' ? '#10b98120' : '#ef444420',
                                                    color: round.result === 'PASSED' ? '#10b981' : '#ef4444',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 14, fontWeight: 700
                                                }}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{round.roundName}</span>
                                                    <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{round.date}</p>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                backgroundColor: round.result === 'PASSED' ? '#10b98120' : '#ef444420',
                                                color: round.result === 'PASSED' ? '#10b981' : '#ef4444'
                                            }}>
                                                {round.result}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: 12 }}>Interviewer</span>
                                                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{round.interviewer}</p>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: 12 }}>Score</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <div style={{ width: 100, height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${(round.score / 5) * 100}%`,
                                                            height: '100%',
                                                            backgroundColor: round.score >= 4 ? '#10b981' : round.score >= 3 ? '#f59e0b' : '#ef4444',
                                                            borderRadius: 4
                                                        }} />
                                                    </div>
                                                    <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{round.score.toFixed(1)}/5</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ backgroundColor: '#1e293b', borderRadius: 8, padding: 12 }}>
                                            <span style={{ color: '#64748b', fontSize: 12 }}>Feedback</span>
                                            <p style={{ color: '#e2e8f0', margin: '6px 0 0', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}>"{round.feedback}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', backgroundColor: '#0f172a', borderRadius: 12 }}>
                                No interview rounds completed yet
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => { setShowFeedbackModal(false); handleAssignNextRound(selectedCandidate); }}
                                style={{ flex: 1, padding: 14, backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                Assign Next Round
                            </button>
                            <button
                                onClick={() => { setShowFeedbackModal(false); handleSendOffer(selectedCandidate); }}
                                style={{ flex: 1, padding: 14, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                Send Offer
                            </button>
                            <button
                                onClick={() => { setShowFeedbackModal(false); handleReject(selectedCandidate); }}
                                style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

      <ToastContainer />

        </>

    );
};

export default HRApplicationsPage;
