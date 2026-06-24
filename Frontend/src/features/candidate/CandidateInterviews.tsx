import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateNavHeader from "./CandidateNavHeader";
import { candidateJobsService, type InterviewItem } from "../../services/candidateJobs.service";
import { APP_ROUTES } from "../../constants/routes";
import SearchBar from "../../components/common/SearchBar";
import { Button, Pagination } from "../../components/common";
import { showToast } from "../../components/common/toastService";

const ITEMS_PER_PAGE = 2;

const CandidateInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "RESCHEDULED">("UPCOMING");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const fetchInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await candidateJobsService.listMyInterviews({
        search: searchQuery.trim() || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortOrder,
      });
      setInterviews(data);
      setTotalInterviews(total);
    } catch {
      setInterviews([]);
      setTotalInterviews(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, sortOrder]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };
  const getInterviewTypeLabel = (type?: string) => {
    if (type === "CALL") return "Call";
    if (type === "F2F") return "Face to Face";
    return "Online";
  };

  const formatCountdown = (dateStr: string, startTime: string): string => {
    const date = new Date(dateStr);
    const [hours, minutes] = startTime.split(":");
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const timeLeft = date.getTime() - currentTime.getTime();
    if (timeLeft <= 0) return "Interview starting now!";

    const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };


  const openRescheduleModal = (interview: InterviewItem) => {
    setSelectedInterview(interview);
    setRescheduleDate("");
    setRescheduleReason("");
    setShowRescheduleModal(true);
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedInterview(null);
    setRescheduleDate("");
    setRescheduleReason("");
  };

  const submitReschedule = async () => {
    if (!selectedInterview || !rescheduleDate || !rescheduleReason.trim()) {
      return;
    }
    try {
      setIsSubmittingReschedule(true);
      await candidateJobsService.requestInterviewReschedule(selectedInterview.id, {
        requestedDate: rescheduleDate,
        reason: rescheduleReason,
      });

      const { data } = await candidateJobsService.listMyInterviews({
        search: searchQuery.trim() || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortOrder,
      });
      setInterviews(data);
      setActiveTab("RESCHEDULED");
      showToast("Reschedule request submitted", "success");
      closeRescheduleModal();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not submit reschedule request";
      showToast(message, "error");
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

 const tabbedInterviews = useMemo(() => {
  return interviews.filter((i) => {
    if (activeTab === "UPCOMING") {
      const interviewDateTime = new Date(
        `${i.scheduledDate}T${i.scheduledTime}:00`
      );

      const expiryTime =
        interviewDateTime.getTime() + 5 * 60 * 1000; // start time + 5 min

      return (
        i.status === "SCHEDULED" &&
        !isNaN(interviewDateTime.getTime()) &&
        Date.now() <= expiryTime
      );
    }

    return i.status === "RESCHEDULED";
  });
}, [interviews, activeTab]);

  const totalPages = Math.max(1, Math.ceil(totalInterviews / ITEMS_PER_PAGE));

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
      <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
        <CandidateNavHeader title="SCHEDULED INTERVIEWS" currentPage="interviews" />

        <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-12 pb-20 max-md:pb-12">
          <div className="mb-6 max-md:mb-4 space-y-4">
            <div>
              <h2 className="text-white text-2xl max-md:text-xl font-semibold flex items-center gap-3">
                {activeTab === "UPCOMING" ? "Upcoming Interviews" : "Reschedule Requests"}
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-xl">
                {activeTab === "UPCOMING"
                  ? "View your scheduled interviews. Online interviews show join, call and face-to-face show details only."
                  : "Track your reschedule requests and their status."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("UPCOMING")}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide border transition-colors ${
                  activeTab === "UPCOMING"
                    ? "bg-violet-500/20 text-violet-200 border-violet-500/40"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("RESCHEDULED")}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide border transition-colors ${
                  activeTab === "RESCHEDULED"
                    ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                Reschedule Requests
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:flex-wrap">
              <SearchBar
                label="Search by company"
                value={searchQuery}
                onChange={(v) => {
                  setSearchQuery(v);
                  setPage(1);
                }}
                placeholder="Search by company name..."
                className="w-full sm:max-w-xs lg:max-w-sm"
              />
              <div className="min-w-[160px]">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Filter
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc");
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/70"
                >
                  <option value="asc">Earliest first</option>
                  <option value="desc">Latest first</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading interviews...</div>
          ) : tabbedInterviews.length === 0 ? (
            <div className="text-center py-10 max-md:py-8 text-[#94a3b8]">
              <p className="text-base max-md:text-sm">
                {searchQuery
                  ? "No interviews match your search."
                  : activeTab === "UPCOMING"
                    ? "No scheduled interviews yet."
                    : "No reschedule requests yet."}
              </p>
              <p className="text-[#64748b] text-sm max-md:text-xs mt-2">
                {activeTab === "UPCOMING"
                  ? "When HR schedules an interview for you, it will appear here."
                  : "When you request a reschedule, it will appear here for review."}
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                tabbedInterviews.length === 1
                  ? "grid-cols-1"
                  : tabbedInterviews.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : tabbedInterviews.length === 3
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {tabbedInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className={`flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:bg-white/[0.04] transition-colors ${
                    tabbedInterviews.length === 1 ? "p-8 md:p-10 lg:p-12" : "p-6 md:p-7"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-[65%]">
                      <h3 className="text-lg md:text-xl font-semibold text-white leading-snug">
                        {interview.jobTitle}
                      </h3>
                      <p className="mt-2 text-sm md:text-base font-medium text-slate-200">
                        {interview.companyName}
                      </p>
                      <p className="mt-1 text-xs md:text-sm text-slate-400">
                        Round <span className="font-medium text-slate-200">{interview.round}</span> • Interviewer{" "}
                        <span className="font-medium text-slate-200">{interview.interviewerName}</span>
                      </p>

                      <div className="mt-4 space-y-2 text-xs md:text-sm text-slate-100">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5">
                          <span className="font-medium">
                            {getInterviewTypeLabel(interview.interviewType)}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5">
                          <span className="font-medium">
                            {formatDate(interview.scheduledDate)}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5">
                          <span className="font-medium">
                            {formatTime(interview.scheduledTime)}
                          </span>
                        </div>
                        {interview.interviewType === "F2F" && interview.interviewLocation ? (
                          <div className="rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Location</p>
                            <p className="mt-1 text-xs md:text-sm text-slate-100">{interview.interviewLocation}</p>
                          </div>
                        ) : null}
                      </div>

                      {activeTab === "RESCHEDULED" && interview.candidateRejection && (
                        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs md:text-sm text-slate-100">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300 mb-2">
                            Requested reschedule{" "}
                            {interview.candidateRejectionStatus === "DECLINED" ? (
                              <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                                Cancelled
                              </span>
                            ) : (
                              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                                Pending
                              </span>
                            )}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-[11px] text-slate-400 uppercase">New date</p>
                              <p className="mt-1">{formatDate(interview.candidateRejection.date)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 uppercase">Reason</p>
                              <p className="mt-1">{interview.candidateRejection.reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {activeTab === "UPCOMING" && (
                      <div className="rounded-xl bg-slate-900/70 px-4 py-2.5 text-xs md:text-sm text-slate-200">
                        <span className="text-slate-400">Starts in:</span>{" "}
                        <span className="font-semibold text-emerald-300">
                          {formatCountdown(interview.scheduledDate, interview.scheduledTime)}
                        </span>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {activeTab === "UPCOMING" && (
                        <>
                          <Button variant="amber" onClick={() => openRescheduleModal(interview)}>
                            Reschedule
                          </Button>
                          {(interview.interviewType ?? "ONLINE") === "ONLINE" ? (
                            <Button
                              variant="violet"
                              onClick={() => navigate(APP_ROUTES.INTERVIEW_ROOM(interview.id))}
                            >
                              Join Interview
                            </Button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && tabbedInterviews.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              leftContent={
                <span>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, totalInterviews)} of {totalInterviews}
                </span>
              }
            />
          )}
        </div>
      </div>
      {showRescheduleModal && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#020617] p-5 sm:p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-50">Request reschedule</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">
                  {selectedInterview.jobTitle} • {selectedInterview.companyName}
                </p>
              </div>
              <Button variant="icon" onClick={closeRescheduleModal}>
                <span className="block text-lg leading-none">×</span>
              </Button>
            </div>

            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Current schedule
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-100">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase">Date</p>
                  <p className="mt-1">
                    {formatDate(selectedInterview.scheduledDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase">Time</p>
                  <p className="mt-1">
                    {formatTime(selectedInterview.scheduledTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-200">
                  Preferred new date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-200">
                  Reason for reschedule <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Explain why you need to reschedule this interview..."
                  className="min-h-[90px] w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="ghostOutline" onClick={closeRescheduleModal}>
                  Cancel
                </Button>
                <Button
                  variant="amberGradient"
                  onClick={submitReschedule}
                  disabled={isSubmittingReschedule || !rescheduleDate || !rescheduleReason.trim()}
                >
                  {isSubmittingReschedule ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;
