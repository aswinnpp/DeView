import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { io, type Socket } from "socket.io-client";
import {
  interviewsService,
  type InterviewRoomDetails,
} from "../../services/interviews.service";

type Nullable<T> = T | null;

function buildRtcConfig(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [];

  // STUN servers from env (comma-separated), fallback to Google public STUN
  const stunRaw = import.meta.env.VITE_STUN_URLS?.trim();
  const stunUrls = stunRaw
    ? stunRaw.split(",").map((u: string) => u.trim()).filter(Boolean)
    : ["stun:stun.l.google.com:19302"];
  iceServers.push({ urls: stunUrls });

  // TURN servers from env (comma-separated) — only added when configured
  const turnRaw = import.meta.env.VITE_TURN_URLS?.trim();
  if (turnRaw) {
    const turnUrls = turnRaw.split(",").map((u: string) => u.trim()).filter(Boolean);
    const username = import.meta.env.VITE_TURN_USERNAME?.trim() || "";
    const credential = import.meta.env.VITE_TURN_CREDENTIAL?.trim() || "";
    if (turnUrls.length > 0 && username && credential) {
      iceServers.push({ urls: turnUrls, username, credential });
    }
  }

  const poolSize = parseInt(import.meta.env.VITE_ICE_CANDIDATE_POOL_SIZE || "10", 10);

  return {
    iceServers,
    iceCandidatePoolSize: Number.isFinite(poolSize) ? poolSize : 10,
  };
}

const rtcConfig: RTCConfiguration = buildRtcConfig();

export interface ChatMessage {
  message: string;
  senderId: string | null;
  senderName?: string;
  isSelf: boolean;
  createdAt?: string;
}

interface UseInterviewRoomResult {
  localVideoRef: MutableRefObject<Nullable<HTMLVideoElement>>;
  remoteVideoRef: MutableRefObject<Nullable<HTMLVideoElement>>;
  isInRoom: boolean;
  error: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
  isScreenSharing: boolean;
  isRemoteVideoActive: boolean;
  messages: ChatMessage[];
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  sendMessage: (text: string) => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  leaveRoom: () => void;
}

interface UseInterviewRoomDetailsResult {
  details: InterviewRoomDetails | null;
  error: string | null;
  isLoading: boolean;
  roomId: string | undefined;
}


export function useInterviewRoomDetails(
  interviewId: string | undefined
): UseInterviewRoomDetailsResult {
  const [details, setDetails] = useState<InterviewRoomDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);

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
      } catch {
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
      if (!cancelled) {
        setRoomId(interviewId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  return { details, error, isLoading, roomId };
}

export function useInterviewRoom(roomId: string | undefined, displayName: string): UseInterviewRoomResult {
  const localVideoRef = useRef<Nullable<HTMLVideoElement>>(null);
  const remoteVideoRef = useRef<Nullable<HTMLVideoElement>>(null);

  const peerConnectionRef = useRef<Nullable<RTCPeerConnection>>(null);
  const socketRef = useRef<Nullable<Socket>>(null);
  const localStreamRef = useRef<Nullable<MediaStream>>(null);
  const screenStreamRef = useRef<Nullable<MediaStream>>(null);

  const [isInRoom, setIsInRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const setupConnection = async () => {
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
        }

        const pc = new RTCPeerConnection(rtcConfig);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          const videoTrack = remoteStream?.getVideoTracks()[0];
          if (videoTrack) {
            setIsRemoteVideoActive(!videoTrack.muted);
            videoTrack.onmute = () => setIsRemoteVideoActive(false);
            videoTrack.onunmute = () => setIsRemoteVideoActive(true);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        
    const socketEnv = import.meta.env.VITE_SOCKET_URL?.trim();
    const apiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
    const socketUrl = (() => {
      if (socketEnv) {
        const raw = socketEnv.includes("://") ? socketEnv : `https://${socketEnv}`;
        return new URL(raw).origin;
      }
      if (apiBase.startsWith("/")) return window.location.origin;
      if (apiBase.startsWith("http")) return new URL(apiBase).origin;
      return window.location.origin;
    })();


      
      

        console.log(socketUrl);
        

        const socket = io(socketUrl, {
          withCredentials: true,
        });
        socketRef.current = socket;

        socket.on("connect_error", (err: Error) => {
          setError(err.message || "Unable to connect to signaling server.");
        });

        socket.on("connect", () => {
          socket.emit("join-room", { roomId, displayName });
          setIsInRoom(true);
        });

        const handleMessage = (data: { message: string; senderId?: string; senderName?: string }) => {
          setMessages((prev) => [
            ...prev,
            {
              message: data.message,
              senderId: data.senderId ?? "remote",
              senderName: data.senderName ?? "Guest",
              isSelf: false,
            },
          ]);
        };

        socket.on("message", handleMessage);

        socket.on("user-joined", async () => {
          if (!peerConnectionRef.current) return;
          try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit("offer", { roomId, offer });
          } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create offer.";
            setError(message);
          }
        });

        socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
          if (!peerConnectionRef.current) return;
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socket.emit("answer", { roomId, answer });
          } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to handle offer.";
            setError(message);
          }
        });

        socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
          if (!peerConnectionRef.current) return;
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to handle answer.";
            setError(message);
          }
        });

        socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
          if (!peerConnectionRef.current || !candidate) return;
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to add ICE candidate.";
            setError(message);
          }
        });
      } catch (err) {
        const message =
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera and microphone permission denied. Please allow access in your browser."
            : err instanceof Error
              ? err.message
              : "Unable to access camera and microphone.";
        setError(message);
      }
    };

    const localVideoEl = localVideoRef.current;
    const remoteVideoEl = remoteVideoRef.current;

    setupConnection();

    return () => {
      cancelled = true;

      try {
        socketRef.current?.emit("leave-room", { roomId, displayName });
        socketRef.current?.disconnect();
      } catch {
        // ignore
      }

      if (socketRef.current) {
        socketRef.current.off("message");
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.getSenders().forEach((sender) => sender.track?.stop());
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      if (localVideoEl) {
        localVideoEl.srcObject = null;
      }
      if (remoteVideoEl) {
        remoteVideoEl.srcObject = null;
      }

      setIsInRoom(false);
    };
  }, [roomId, displayName]);

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const next = !isAudioEnabled;
    audioTracks.forEach((track) => {
      track.enabled = next;
    });
    setIsAudioEnabled(next);
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;

    const next = !isVideoEnabled;
    videoTracks.forEach((track) => {
      track.enabled = next;
    });
    setIsVideoEnabled(next);

    if (localVideoRef.current) {
      if (next) {
        localVideoRef.current.srcObject =
          screenStreamRef.current ?? localStreamRef.current;
      } else {
        localVideoRef.current.srcObject = null;
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled((prev) => {
      const next = !prev;
      if (remoteVideoRef.current) {
        // When speaker is disabled, mute the remote video element locally
        remoteVideoRef.current.muted = !next;
      }
      return next;
    });
  };

  const stopScreenShare = () => {
    const pc = peerConnectionRef.current;
    const screenStream = screenStreamRef.current;
    const localStream = localStreamRef.current;

    if (!pc || !screenStream || !localStream) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      return;
    }

    const cameraTrack = localStream.getVideoTracks()[0];
    const sender = pc
      .getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender && cameraTrack) {
      sender.replaceTrack(cameraTrack);
    }

    screenStream.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = isVideoEnabled ? localStream : null;
    }

    setIsScreenSharing(false);
  };

  const startScreenShare = async () => {
    if (!peerConnectionRef.current) return;
    if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getDisplayMedia) {
      setError("Screen sharing is not supported in this browser.");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        screenStream.getTracks().forEach((t) => t.stop());
        return;
      }

      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (!sender) {
        screenStream.getTracks().forEach((t) => t.stop());
        return;
      }

      screenStreamRef.current = screenStream;
      await sender.replaceTrack(screenTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        // User canceled screen share picker; ignore.
        return;
      }
      const message =
        err instanceof Error ? err.message : "Unable to start screen sharing.";
      setError(message);
    }
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !roomId) return;
    const socket = socketRef.current;
    if (!socket) return;

    const senderId = socket.id ?? null;

    const payload = {
      roomId,
      message: trimmed,
      senderId,
      senderName: displayName,
    };

    socket.emit("message", payload);

    setMessages((prev) => [
      ...prev,
      { message: trimmed, senderId, senderName: displayName, isSelf: true },
    ]);
  };

  const leaveRoom = () => {
    if (!roomId) return;

    try {
      socketRef.current?.emit("leave-room", { roomId, displayName });
      socketRef.current?.disconnect();
    } catch {
      // ignore
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => sender.track?.stop());
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsInRoom(false);
  };

  return {
    localVideoRef,
    remoteVideoRef,
    isInRoom,
    error,
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
  };
}

