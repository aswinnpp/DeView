import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { interviewsService, type InterviewRoomDetails } from "../../services/interviews.service";
import { useInterviewSocket } from "../../hooks/useInterviewSocket";
import { selectUser } from "../../context/authSlice";
import { APP_ROUTES } from "../../constants/routes";

const InterviewRoom = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [details, setDetails] = useState<InterviewRoomDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);

  const displayName = user?.fullName || "Guest";

  const socketState = useMemo(
    () =>
      details && interviewId && displayName
        ? {
            interviewId,
            roomName: details.roomName,
            displayName,
          }
        : null,
    [details?.roomName, details?.interviewId, interviewId, displayName]
  );

  const { messages, sendMessage, socket } = useInterviewSocket(socketState);

  // UI state for controls / editor (ported from old design)
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [code, setCode] = useState<string>(
    `// Write your solution here
function solution() {
  // Your code goes here
  return "Hello World!";
}`
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

    load();

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  useEffect(() => {
    if (!details || !socket) return;

    let cancelled = false;

    const setupLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          void localVideoRef.current.play().catch(() => undefined);
        }
      } catch {
        setError("Unable to access camera/microphone");
      }
    };

    const createPeerConnection = () => {
      if (peerConnectionRef.current) {
        return peerConnectionRef.current;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && details && remoteSocketIdRef.current) {
          socket.emit("webrtc-ice-candidate", {
            interviewId: details.interviewId,
            roomName: details.roomName,
            candidate: event.candidate,
            to: remoteSocketIdRef.current,
          });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          void remoteVideoRef.current.play().catch(() => undefined);
        }
      };

      const localStream = localStreamRef.current;
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      peerConnectionRef.current = pc;
      return pc;
    };

    const handleUserJoined = async (payload: { socketId?: string }) => {
      if (!details || !payload.socketId) return;

      remoteSocketIdRef.current = payload.socketId;
      const pc = createPeerConnection();

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        interviewId: details.interviewId,
        roomName: details.roomName,
        sdp: offer,
        to: payload.socketId,
      });
    };

    const handleOffer = async (payload: { sdp: RTCSessionDescriptionInit; from: string }) => {
      if (!details) return;

      remoteSocketIdRef.current = payload.from;
      const pc = createPeerConnection();

      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        interviewId: details.interviewId,
        roomName: details.roomName,
        sdp: answer,
        to: payload.from,
      });
    };

    const handleAnswer = async (payload: { sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    };

    const handleIceCandidate = async (payload: { candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch {
        // ignore candidate errors
      }
    };

    setupLocalMedia().catch(() => undefined);

    const onUserJoined = (p: { displayName: string; at: string; socketId?: string }) =>
      void handleUserJoined(p);
    const onOffer = (p: { interviewId: string; roomName: string; sdp: RTCSessionDescriptionInit; from: string }) =>
      void handleOffer(p);
    const onAnswer = (p: { interviewId: string; roomName: string; sdp: RTCSessionDescriptionInit }) =>
      void handleAnswer(p);
    const onIce = (p: { interviewId: string; roomName: string; candidate: RTCIceCandidateInit }) =>
      void handleIceCandidate(p);

    socket.on("user-joined", onUserJoined);
    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("webrtc-ice-candidate", onIce);

    return () => {
      cancelled = true;

      socket.off("user-joined", onUserJoined);
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer);
      socket.off("webrtc-ice-candidate", onIce);

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [details, socket]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Simple simulation only; no real code execution
      const preview = code.split("\n").slice(0, 4).join("\n");
      setOutput(
        preview
          ? `Previewing your code (first lines):\n${preview}`
          : "No code yet. Start typing above to see a preview here."
      );
      setIsRunning(false);
    }, 500);
  };

  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/90 px-6 py-4 text-sm text-slate-300 shadow-xl">
          Joining your interview room...
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md rounded-2xl border border-rose-500/40 bg-slate-950/95 px-6 py-5 text-center shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
          <h2 className="mb-2 text-lg font-semibold text-white">Unable to join interview</h2>
          <p className="mb-4 text-sm text-slate-300">
            {error ||
              "Something went wrong while loading this interview. Please try again from your scheduled interviews list."}
          </p>
          <button
            type="button"
            onClick={() => navigate(APP_ROUTES.CANDIDATE_INTERVIEWS)}
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
      {/* Optional full-width editor overlay */}
      {isEditorMaximized && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-3 py-4">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Code Editor</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Write and run your solution while staying on the call.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runCode}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950/95 via-slate-950 to-slate-950/95 shadow-[0_22px_80px_rgba(15,23,42,0.95)]">
          {/* Header */}
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
                ● Connected as {displayName}
              </span>
              <button
                type="button"
                onClick={() => navigate(APP_ROUTES.CANDIDATE_INTERVIEWS)}
                className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-rose-500/40 transition hover:bg-rose-500"
              >
                <span>End call</span>
              </button>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 flex-col border-t border-slate-900/60 md:flex-row">
            {/* Video area */}
            <div className="flex flex-1 flex-col border-b border-slate-900/60 md:border-b-0 md:border-r">
              <div className="relative flex-1 bg-black">
                <video
                  ref={remoteVideoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  autoPlay
                />

                {/* Live badge & overlay info */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 py-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-rose-300 ring-1 ring-rose-500/60 backdrop-blur">
                    <span className="text-[10px] text-rose-400">●</span>
                    Live interview
                  </div>
                  <div className="hidden rounded-full bg-black/50 px-3 py-1 text-[11px] text-slate-200 ring-1 ring-slate-700/70 backdrop-blur sm:inline-flex">
                    Room: <span className="ml-1 font-mono text-[10px] text-slate-300">{details.roomName}</span>
                  </div>
                </div>

                {/* Local preview bottom-right */}
                <div className="pointer-events-none absolute bottom-3 right-3 h-24 w-36 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg shadow-black/70 sm:h-28 sm:w-40">
                  <video
                    ref={localVideoRef}
                    className="h-full w-full object-cover"
                    playsInline
                    autoPlay
                    muted
                  />
                  <div className="pointer-events-none absolute bottom-1 left-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-slate-100">
                    You
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="border-t border-slate-900/70 bg-slate-950/95 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAudioOn((v) => !v)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                        isAudioOn
                          ? "bg-slate-800 text-emerald-300 hover:bg-slate-700"
                          : "bg-rose-600 text-white hover:bg-rose-500"
                      }`}
                      aria-pressed={isAudioOn}
                    >
                      {isAudioOn ? "🎙" : "🔇"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVideoOn((v) => !v)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                        isVideoOn
                          ? "bg-slate-800 text-sky-300 hover:bg-slate-700"
                          : "bg-rose-600 text-white hover:bg-rose-500"
                      }`}
                      aria-pressed={isVideoOn}
                    >
                      {isVideoOn ? "📷" : "🚫"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScreenSharing((v) => !v)}
                      className={`hidden h-9 rounded-full px-3 text-[11px] font-medium md:inline-flex ${
                        isScreenSharing
                          ? "bg-emerald-600/80 text-emerald-50 hover:bg-emerald-500"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                      aria-pressed={isScreenSharing}
                    >
                      {isScreenSharing ? "Stop sharing" : "Present screen"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCodeEditorOpen(false)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                        !isCodeEditorOpen
                          ? "bg-slate-800 text-slate-100"
                          : "bg-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      💬 Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCodeEditorOpen(true)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                        isCodeEditorOpen
                          ? "bg-violet-600 text-white"
                          : "bg-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      💻 Code editor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side panel: chat or editor */}
            <aside className="flex w-full max-w-sm flex-col border-l border-slate-900/60 bg-slate-950/95">
              {isCodeEditorOpen ? (
                <div className="flex h-full flex-col">
                  <header className="flex items-center justify-between border-b border-slate-900/80 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Code editor</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Draft your solution while staying in the call.
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
              ) : (
                <div className="flex h-full flex-col">
                  <header className="flex items-center justify-between border-b border-slate-900/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💬</span>
                      <div>
                        <h2 className="text-sm font-semibold text-white">Interview chat</h2>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Messages are visible only to participants.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400">● Online</span>
                  </header>

                  <div className="flex-1 space-y-2 overflow-y-auto border-t border-slate-900/60 px-3 py-3 text-xs">
                    {messages.length === 0 ? (
                      <p className="mt-4 text-center text-slate-500">
                        Start the conversation by sending a message.
                      </p>
                    ) : (
                      messages.map((msg, index) => (
                        <div
                          key={`${msg.timestamp}-${index}`}
                          className="rounded-lg bg-slate-900/80 p-2"
                        >
                          <div className="mb-0.5 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-violet-300">
                              {msg.displayName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-100">{msg.message}</p>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="border-t border-slate-900/80 bg-slate-950/95 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-500/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;

