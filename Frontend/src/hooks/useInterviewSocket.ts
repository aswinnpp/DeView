import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export interface ChatMessage {
  displayName: string;
  message: string;
  timestamp: string;
}

interface UseInterviewSocketOptions {
  interviewId: string;
  roomName: string;
  displayName: string;
}

export function useInterviewSocket(options: UseInterviewSocketOptions | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    if (!options) return;

    const { interviewId, roomName, displayName } = options;

    const baseUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    const socket = io(baseUrl + "/interview", {
      withCredentials: true,
    });

    socketRef.current = socket;
    setSocketInstance(socket);

    socket.on("connect", () => {
      socket.emit("join-room", { interviewId, roomName, displayName });
    });

    socket.on("chat-message", (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    });

    socket.on("user-joined", (payload: { displayName: string; at: string; socketId?: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          displayName: "System",
          message: `${payload.displayName} joined the room`,
          timestamp: payload.at,
        },
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [options]);

  const sendMessage = (text: string) => {
    const socket = socketRef.current;
    if (!socket || !options || !text.trim()) return;

    const { interviewId, roomName, displayName } = options;
    socket.emit("chat-message", {
      interviewId,
      roomName,
      message: text,
      displayName,
    });
  };

  return {
    messages,
    sendMessage,
    socket: socketInstance,
  };
}

