import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { io, type Socket } from "socket.io-client";

type Nullable<T> = T | null;

const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
    {
      urls: ["turn:turn.yourdomain.com:3478"],
      username: "webrtc",
      credential: "strongpassword",
    },
  ],
};

interface UseInterviewRoomResult {
  localVideoRef: MutableRefObject<Nullable<HTMLVideoElement>>;
  remoteVideoRef: MutableRefObject<Nullable<HTMLVideoElement>>;
  isInRoom: boolean;
  error: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  leaveRoom: () => void;
}

const getSocketUrl = () => {
  const configured =
    (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
    (import.meta.env.VITE_WS_URL as string | undefined);

  if (configured && configured.length > 0) return configured;
  return window.location.origin;
};

export function useInterviewRoom(roomId: string | undefined, displayName: string): UseInterviewRoomResult {
  const localVideoRef = useRef<Nullable<HTMLVideoElement>>(null);
  const remoteVideoRef = useRef<Nullable<HTMLVideoElement>>(null);

  const peerConnectionRef = useRef<Nullable<RTCPeerConnection>>(null);
  const socketRef = useRef<Nullable<Socket>>(null);
  const localStreamRef = useRef<Nullable<MediaStream>>(null);

  const [isInRoom, setIsInRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

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
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        const socket = io(getSocketUrl(), {
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

    setupConnection();

    return () => {
      cancelled = true;

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

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
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
    toggleAudio,
    toggleVideo,
    toggleSpeaker,
    leaveRoom,
  };
}

