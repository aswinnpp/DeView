import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { interviewsService } from "../../services/interviews.service";
import type { RootState } from "../../context/store";import { APP_ROUTES } from "../../constants/routes";
import { useInterviewRoom, useInterviewRoomDetails } from "./hooks/useInterviewRoom";
import { useJudge0Runner } from "./hooks/useJudge0Runner";

const InterviewRoom = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
const adminUser = useSelector(
  (state: RootState) => state.auth.adminUser
);

const normalUser = useSelector(
  (state: RootState) => state.auth.normalUser
);

const user = adminUser ?? normalUser;
  const displayName = user?.fullName || "Guest";
  const { details, error, isLoading, roomId } = useInterviewRoomDetails(interviewId);
  const {
    localVideoRef,
    remoteVideoRef,
    error: rtcError,
    isAudioEnabled,
    isVideoEnabled,
    isSpeakerEnabled,
    isScreenSharing,
    isRemoteVideoActive,
    messages,
    toggleAudio,
    toggleVideo,
    toggleSpeaker,
    sendMessage,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
  } = useInterviewRoom(roomId, displayName);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [code, setCode] = useState<string>(
    `// Write your solution here`
  );
  const { languages, selectedLanguageId, setSelectedLanguageId, isRunning, output, runCode } =
    useJudge0Runner(interviewId);
  const [isLocalPrimary, setIsLocalPrimary] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState("");

  const handleTogglePrimary = () => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;
    setIsLocalPrimary((prev) => !prev);
  };

  const doLeave = () => {
    leaveRoom();
    const role = user?.role?.toLowerCase();
    if (role === "candidate") {
      navigate(APP_ROUTES.CANDIDATE_INTERVIEWS);
    } else if (role === "interviewer") {
      navigate(APP_ROUTES.INTERVIEWER_ASSIGNMENTS);
    } else {
      navigate(APP_ROUTES.ROOT);
    }
  };

  const handleLeave = () => {
    const role = user?.role?.toLowerCase();
    if (role === "interviewer") {
      setShowLeaveModal(true);
    } else {
      doLeave();
    }
  };

  const handleLeaveWithStatus = async (status: "COMPLETED" | "CANCELLED") => {
    if (!interviewId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await interviewsService.updateStatus(interviewId, status);
      setShowLeaveModal(false);
      doLeave();
    } catch {
      setShowLeaveModal(false);
      doLeave();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/90 px-6 py-4 text-sm text-slate-300 shadow-xl">
          Joining your interview room...
        </div>
      </div>
    );
  }

  const combinedError = error || rtcError;


  console.log("ss" ,combinedError , details);
  

  if (combinedError || !details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md rounded-2xl border border-rose-500/40 bg-slate-950/95 px-6 py-5 text-center shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
          <h2 className="mb-2 text-lg font-semibold text-white">Unable to join interview</h2>
          <p className="mb-4 text-sm text-slate-300">
            {combinedError ||
              "Something went wrong while loading this interview. Please try again from your scheduled interviews list."}
          </p>
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/40 transition hover:bg-violet-500"
          >
            Back to my interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-950 px-6 py-5 shadow-2xl shadow-black/60">
            <h3 className="mb-2 text-lg font-semibold text-white">Leave interview</h3>
            <p className="mb-4 text-sm text-slate-400">
              How would you like to mark this interview?
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleLeaveWithStatus("COMPLETED")}
                disabled={isUpdatingStatus}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? "Updating..." : "Complete"}
              </button>
              <button
                type="button"
                onClick={() => handleLeaveWithStatus("CANCELLED")}
                disabled={isUpdatingStatus}
                className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-500/40 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? "Updating..." : "Not Attempt"}
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={isUpdatingStatus}
                className="mt-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditorMaximized && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Code Editor</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Write and run your solution.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedLanguageId ?? ""}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSelectedLanguageId(Number.isFinite(next) ? next : null);
                  }}
                  disabled={languages.length === 0}
                  className="h-9 w-36 rounded-lg border border-slate-600 bg-slate-950 px-2 text-xs text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {languages.length === 0 ? (
                    <option value="" disabled>
                      Loading languages...
                    </option>
                  ) : null}
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => runCode(code)}
                  disabled={isRunning || !selectedLanguageId}
                  className="inline-flex h-9 gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRunning ? "Running..." : "▶ Run code"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorMaximized(false)}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Exit full width
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-slate-900/40 bg-slate-950/60 p-3 md:flex-row">
              <div className="min-h-0 flex-1">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-full w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 outline-none ring-0 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                  placeholder="Write your code here..."
                />
              </div>
              <div className="flex h-40 min-h-0 w-full flex-col rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs md:h-full md:max-w-sm">
                <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Output
                </h4>
                <div className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-900/70 p-2 text-[11px] text-slate-100">
                  {output || "No output yet. Run your code to see results."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen w-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950/95 via-slate-950 to-slate-950/95 shadow-[0_22px_80px_rgba(15,23,42,0.95)]">        <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold text-white md:text-base">
              {details.jobTitle} • {details.companyName}
            </h1>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Interview with <span className="font-medium text-slate-200">{details.interviewerName}</span>{" "}
              • Candidate: <span className="font-medium text-slate-200">{details.candidateName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-emerald-400 sm:inline-flex">
            ● {displayName}
          </span>
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-rose-500/40 transition hover:bg-rose-500"
          >
            <span>Leave</span>
          </button>
        </div>
      </header>

        <div className="flex flex-1 flex-col border-t border-slate-900/60 md:flex-row">
          <div
            className={`flex-1 flex-col border-b border-slate-900/60 md:border-b-0 md:border-r ${!isChatOpen ? "hidden md:flex" : "flex"
              }`}
          >
            <div className="relative flex flex-1 flex-col bg-slate-950/50 p-3 md:p-4">
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-black"
                onClick={handleTogglePrimary}
              >
                {/* Remote video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-200 ${!isRemoteVideoActive ? "opacity-0" : ""
                    } ${isLocalPrimary
                      ? "bottom-3 right-3 h-24 w-32 rounded-xl border border-slate-800 bg-black/90 p-0.5 shadow-lg shadow-black/70 sm:h-32 sm:w-40 sm:inset-auto"
                      : "rounded-2xl"
                    }`}
                />
                <div
                  className={`pointer-events-none absolute text-xs font-medium text-slate-100 transition-all duration-200 ${isLocalPrimary
                      ? "left-3 top-3 rounded-full bg-black/60 px-3 py-1"
                      : "left-3 top-3 rounded-full bg-black/60 px-3 py-1"
                    }`}
                >
                  Interviewer
                </div>

                {/* Local video */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-200 ${!isVideoEnabled && !isScreenSharing ? "opacity-0" : ""
                    } ${isLocalPrimary
                      ? "rounded-2xl"
                      : "bottom-3 right-3 h-24 w-32 rounded-xl border border-slate-800 bg-black/90 p-0.5 shadow-lg shadow-black/70 sm:h-32 sm:w-40 sm:inset-auto"
                    }`}
                />
                <div
                  className={`pointer-events-none absolute text-[10px] font-medium text-slate-100 transition-all duration-200 ${isLocalPrimary
                      ? "left-3 top-3 rounded-full bg-black/60 px-3 py-1"
                      : "left-2 top-2 rounded-full bg-black/60 px-2 py-0.5"
                    }`}
                >
                  You ({displayName})
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${isAudioEnabled
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-rose-600 text-white hover:bg-rose-500"
                    }`}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M10 12a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
                      <path d="M5 9a.75.75 0 0 0-1.5 0A6.5 6.5 0 0 0 9.25 15.47V17H7.5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5H10.75v-1.53A6.5 6.5 0 0 0 16.5 9a.75.75 0 0 0-1.5 0 5 5 0 1 1-10 0Z" />
                    </svg>
                  </span>
                  <span>{isAudioEnabled ? "Mute" : "Unmute"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${isVideoEnabled
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-amber-600 text-white hover:bg-amber-500"
                    }`}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6A1.5 1.5 0 0 1 12.5 5v1.38l3.16-1.81A1 1 0 0 1 17 5.45v9.1a1 1 0 0 1-1.34.93L12.5 13.66V15A1.5 1.5 0 0 1 11 16.5H5A1.5 1.5 0 0 1 3.5 15V5Z" />
                    </svg>
                  </span>
                  <span>{isVideoEnabled ? "Camera off" : "Camera on"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSpeaker}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${isSpeakerEnabled
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-sky-600 text-white hover:bg-sky-500"
                    }`}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3.25 7A2.25 2.25 0 0 1 5.5 4.75h1.382a2.25 2.25 0 0 1 1.59.659l2.829 2.828a.75.75 0 0 1 0 1.06l-2.83 2.829a2.25 2.25 0 0 1-1.589.659H5.5A2.25 2.25 0 0 1 3.25 11V7Z" />
                      <path d="M13.5 5.75a.75.75 0 0 1 1.06-.06A5.73 5.73 0 0 1 16.75 10c0 1.61-.652 3.067-1.69 4.135a.75.75 0 1 1-1.07-1.05A4.23 4.23 0 0 0 15.25 10a4.23 4.23 0 0 0-1.26-3.085.75.75 0 0 1-.06-1.165Z" />
                    </svg>
                  </span>
                  <span>{isSpeakerEnabled ? "Speaker off" : "Speaker on"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3.5 4.75A1.75 1.75 0 0 1 5.25 3h9.5A1.75 1.75 0 0 1 16.5 4.75v5.5A1.75 1.75 0 0 1 14.75 12H11l-2.7 2.7A.75.75 0 0 1 7 14.75V12H5.25A1.75 1.75 0 0 1 3.5 10.25v-5.5Z" />
                    </svg>
                  </span>
                  <span>Messages</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M4.75 5.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5H6.56l-.53 3.182a.75.75 0 0 1-.74.618H4.25a.75.75 0 0 1 0-1.5h.61l.39-2.343V5.5Zm5.5 0a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-3.25v2h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-6.5Z" />
                    </svg>
                  </span>
                  <span>Code editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => (isScreenSharing ? stopScreenShare() : startScreenShare())}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3.25 4A1.25 1.25 0 0 1 4.5 2.75h11A1.25 1.25 0 0 1 16.75 4v8A1.25 1.25 0 0 1 15.5 13.25h-11A1.25 1.25 0 0 1 3.25 12V4Z" />
                      <path d="M6 15.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 15.25Z" />
                    </svg>
                  </span>
                  <span>{isScreenSharing ? "Stop sharing" : "Screen share"}</span>
                </button>
              </div>




            </div>
          </div>

          <aside className="flex w-full md:max-w-sm flex-col border-l border-slate-900/60 bg-slate-950/95">
            <div className="flex h-full flex-col">
              <header className="flex items-center justify-between border-b border-slate-900/80 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isChatOpen ? "Messages" : "Code Editor"}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {isChatOpen
                      ? "Chat with the other participant."
                      : "Write and run your solution."}
                  </p>
                </div>
              </header>
              <div className="flex flex-1 flex-col border-t border-slate-900/60 bg-slate-950/80 p-3">
                {isChatOpen ? (
                  <>
                    <div className="mb-2 flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-[11px] text-slate-200">
                      {messages.length === 0 ? (
                        <p className="text-slate-400">
                          Chat history will appear here once someone sends a message.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {messages.map((msg, index) => (
                            <li
                              key={index}
                              className={`flex ${msg.isSelf ? "justify-end" : "justify-start"
                                }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-2 py-1 text-[11px] ${msg.isSelf
                                    ? "bg-violet-600 text-white"
                                    : "bg-slate-800 text-slate-100"
                                  }`}
                              >
                                <span className="block text-[10px] font-semibold text-slate-300">
                                  {msg.isSelf ? "You" : msg.senderName ?? "Guest"}
                                </span>
                                <span className="block break-words">{msg.message}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && chatMessage.trim()) {
                            e.preventDefault();
                            sendMessage(chatMessage);
                            setChatMessage("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!chatMessage.trim()) return;
                          sendMessage(chatMessage);
                          setChatMessage("");
                        }}
                        disabled={!chatMessage.trim()}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-violet-500/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-0 flex-col gap-2">
                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedLanguageId ?? ""}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            setSelectedLanguageId(Number.isFinite(next) ? next : null);
                          }}
                          disabled={languages.length === 0}
                          className="h-8 w-40 rounded-lg border border-slate-600 bg-slate-950 px-2 text-[11px] text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {languages.length === 0 ? (
                            <option value="" disabled>
                              Loading languages...
                            </option>
                          ) : null}
                          {languages.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                       
                        <button
                          type="button"
                          onClick={() => setIsEditorMaximized(true)}
                          className="rounded-lg border border-slate-600 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                        >
                          Full width
                        </button>
                        <button
                          type="button"
                          onClick={() => runCode(code)}
                          disabled={isRunning || !selectedLanguageId}
                          className="inline-flex h-8 gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isRunning ? "Running..." : "  Run Code "}
                        </button>
                      </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-2">
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 outline-none ring-0 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                        placeholder="Write your code here..."
                      />
                      <div className="flex h-32 min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs">
                        <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Output
                        </h4>
                        <div className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-900/70 p-2 text-[11px] text-slate-100">
                          {output || "No output yet. Run your code to see results."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>



  );
};

export default InterviewRoom;
