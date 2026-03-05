import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateNavHeader from "./CandidateNavHeader";
import { candidateJobsService, type InterviewItem } from "../../services/candidateJobs.service";
import { APP_ROUTES } from "../../constants/routes";

const CandidateInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "company">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchInterviews = async () => {
      try {
        const data = await candidateJobsService.listMyInterviews();
        if (!cancelled) setInterviews(data);
      } catch {
        if (!cancelled) setInterviews([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchInterviews();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  console.log("interviews", interviews);

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

  const filteredInterviews = useMemo(() => {
    let result = [...interviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        (item.companyName || "").toLowerCase().includes(q) ||
        item.interviewerName.toLowerCase().includes(q) ||
        item.jobTitle.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date") {
        const aTime = new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime();
        const bTime = new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }
      const compA = (a.companyName || "").toLowerCase();
      const compB = (b.companyName || "").toLowerCase();
      return sortOrder === "asc" ? compA.localeCompare(compB) : compB.localeCompare(compA);
    });

    return result;
  }, [interviews, searchQuery, sortBy, sortOrder]);

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
      // TODO: hook up to reschedule API when available
      console.log("Reschedule request", {
        interviewId: selectedInterview.id,
        newDate: rescheduleDate,
        reason: rescheduleReason,
      });
      closeRescheduleModal();
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)]">
      <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
        <CandidateNavHeader title="SCHEDULED INTERVIEWS" currentPage="interviews" />

        <div className="pt-[72px] py-7 px-4 sm:px-6 lg:px-12 pb-20 max-md:pb-12">
          <div className="mb-6 max-md:mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-white text-2xl max-md:text-xl font-semibold flex items-center gap-3">
                Upcoming Interviews
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-xl">
                View and join your scheduled interviews. Search and sort to find the right one quickly.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
              <div className="w-full sm:w-56">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Company, interviewer, or job title"
                  className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-32">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "company")}
                    className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-2 py-2 text-xs text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                  >
                    <option value="date">Date &amp; time</option>
                    <option value="company">Company</option>
                  </select>
                </div>

                <div className="w-32">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-2 py-2 text-xs text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                  >
                    <option value="asc">Earliest first</option>
                    <option value="desc">Latest first</option>
                  </select>
                </div>

                {(searchQuery || sortBy !== "date" || sortOrder !== "asc") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSortBy("date");
                      setSortOrder("asc");
                    }}
                    className="h-[38px] self-end rounded-lg border border-slate-600/70 bg-slate-800/70 px-3 text-xs font-medium text-slate-100 transition hover:bg-slate-700/80"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading interviews...</div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-10 max-md:py-8 text-[#94a3b8]">
              <p className="text-base max-md:text-sm">
                {searchQuery ? "No interviews match your search." : "No scheduled interviews yet."}
              </p>
              <p className="text-[#64748b] text-sm max-md:text-xs mt-2">
                When HR schedules an interview for you, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 md:p-7 hover:bg-white/[0.04] transition-colors"
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
                          <span className="text-sm">📅</span>
                          <span className="font-medium">
                            {formatDate(interview.scheduledDate)}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5">
                          <span className="text-sm">⏰</span>
                          <span className="font-medium">
                            {formatTime(interview.scheduledTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-amber-400/70 bg-amber-500/20 px-3 py-1.5 text-[11px] md:text-xs font-semibold text-amber-100 uppercase tracking-wide shadow-sm hover:bg-amber-500/30 transition"
                      onClick={() => openRescheduleModal(interview)}
                    >
                      Reschedule
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="rounded-xl bg-slate-900/70 px-4 py-2.5 text-xs md:text-sm text-slate-200">
                      <span className="text-slate-400">Starts in:</span>{" "}
                      <span className="font-semibold text-emerald-300">
                        {formatCountdown(interview.scheduledDate, interview.scheduledTime)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow-md shadow-violet-500/40 transition hover:from-violet-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:ring-offset-1 focus:ring-offset-slate-900"
                      onClick={() => {
                        navigate(APP_ROUTES.INTERVIEW_ROOM(interview.id));
                      }}
                    >
                      Join Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              <button
                type="button"
                onClick={closeRescheduleModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
              >
                <span className="block text-lg leading-none">×</span>
              </button>
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
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReschedule}
                  disabled={isSubmittingReschedule || !rescheduleDate || !rescheduleReason.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-amber-500/40 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingReschedule ? "Submitting..." : "Submit request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;
