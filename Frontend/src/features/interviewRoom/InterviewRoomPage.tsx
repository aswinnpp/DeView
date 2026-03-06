import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { interviewsService, type InterviewRoomDetails } from "../../services/interviews.service";
import { selectUser } from "../../context/authSlice";
import { APP_ROUTES } from "../../constants/routes";
import { useInterviewRoom } from "./useInterviewRoom";

const InterviewRoom = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [details, setDetails] = useState<InterviewRoomDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = user?.fullName || "Guest";

  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const {
    localVideoRef,
    remoteVideoRef,
    error: rtcError,
    isAudioEnabled,
    isVideoEnabled,
    isSpeakerEnabled,
    toggleAudio,
    toggleVideo,
    toggleSpeaker,
    leaveRoom,
  } = useInterviewRoom(roomId, displayName);

  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [code, setCode] = useState<string>(
    `// Write your solution here
function solution() {
  // Your code goes here
  return "Hello World!";
}`
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!interviewId) {
      setError("Invalid interview");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const roomDetails = await interviewsService.getRoomDetails(interviewId);
        if (!roomDetails) {
          if (!cancelled) {
            setError("Interview not found");
          }
          return;
        }
        if (!cancelled) {
          setDetails(roomDetails);
        }
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          setError("You are not allowed to join this interview yet.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load().then(() => {
      setRoomId(interviewId ?? undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      const preview = code.split("\n").slice(0, 4).join("\n");
      setOutput(
        preview
          ? `Previewing your code (first lines):\n${preview}`
          : "No code yet. Start typing above to see a preview here."
      );
      setIsRunning(false);
    }, 500);
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
            onClick={() => {
              leaveRoom();
              navigate(APP_ROUTES.CANDIDATE_INTERVIEWS);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/40 transition hover:bg-violet-500"
          >
            Back to my interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] text-slate-100">
      {isEditorMaximized && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-3 py-4">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Code Editor</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Write and run your solution.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runCode}
                  disabled={isRunning}
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
            <div className="flex flex-1 flex-col gap-3 border-t border-slate-900/40 bg-slate-950/60 p-3 md:flex-row">
              <div className="flex-1">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-full w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 outline-none ring-0 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                  placeholder="Write your code here..."
                />
              </div>
              <div className="flex h-40 w-full flex-col rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs md:h-full md:max-w-sm">
                <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Output
                </h4>
                <div className="flex-1 overflow-auto rounded-lg bg-slate-900/70 p-2 text-[11px] text-slate-100">
                  {output || "No output yet. Run your code to see results."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen items-center justify-center px-2 py-4 sm:px-4">
        <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950/95 via-slate-950 to-slate-950/95 shadow-[0_22px_80px_rgba(15,23,42,0.95)]">
          <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-lg">
                <span className="text-violet-400">📹</span>
              </div>
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
                onClick={() => {
                  leaveRoom();
                  navigate(APP_ROUTES.CANDIDATE_INTERVIEWS);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-rose-500/40 transition hover:bg-rose-500"
              >
                <span>Leave</span>
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col border-t border-slate-900/60 md:flex-row">
            <div className="flex flex-1 flex-col border-b border-slate-900/60 md:border-b-0 md:border-r">
              <div className="flex flex-1 flex-col bg-slate-950/50 p-3 md:p-4">
                <div className="flex h-full w-full flex-col gap-3 md:flex-row">
                  <div className="flex-1 rounded-2xl border border-slate-800 bg-black">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl">
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-slate-100">
                        Interviewer
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl border border-slate-800 bg-black">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-slate-100">
                        You ({displayName})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                      isAudioEnabled
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
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                      isVideoEnabled
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
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                      isSpeakerEnabled
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
                </div>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Room: <span className="font-mono text-slate-300">{details.roomName}</span>
                </p>
                <p className="mt-1 text-center text-[11px] text-slate-500">
                  Your camera and microphone are used only for this interview session.
                </p>
              </div>
            </div>

            <aside className="flex w-full max-w-sm flex-col border-l border-slate-900/60 bg-slate-950/95">
              <div className="flex h-full flex-col">
                <header className="flex items-center justify-between border-b border-slate-900/80 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Code editor</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Draft your solution here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditorMaximized(true)}
                    className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Full width
                  </button>
                </header>
                <div className="flex-1 space-y-3 overflow-hidden border-t border-slate-900/60 bg-slate-950/80 p-3">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-40 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 outline-none ring-0 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                    placeholder="Write your code here..."
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={runCode}
                      disabled={isRunning}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRunning ? "Running..." : "Run code"}
                    </button>
                    <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-[11px] text-slate-100">
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Output
                      </div>
                      <div className="max-h-40 overflow-auto text-[11px]">
                        {output || "No output yet. Run your code to see results."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
