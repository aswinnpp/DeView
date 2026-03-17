import type { Server as SocketIOServer, Socket } from 'socket.io';

export const signalingController = (io: SocketIOServer, socket: Socket): void => {
  socket.on('join-company-notifications', ({ companyId }: { companyId: string }) => {
    if (!companyId) return;
    socket.join(`company:${companyId}`);
  });

  socket.on('join-user-notifications', ({ userId }: { userId: string }) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
  });

  socket.on('join-room', ({ roomId, displayName }: { roomId: string; displayName?: string }) => {
    if (!roomId) return;

    socket.join(roomId);

    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      displayName: displayName ?? 'Guest',
    });
  });

  socket.on('offer', ({ roomId, offer }: { roomId: string; offer: unknown }) => {
    if (!roomId || !offer) return;
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }: { roomId: string; answer: unknown }) => {
    if (!roomId || !answer) return;
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }: { roomId: string; candidate: unknown }) => {
    if (!roomId || !candidate) return;
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  socket.on('leave-room', ({ roomId, displayName }: { roomId: string; displayName?: string }) => {
    if (!roomId) return;

    socket.leave(roomId);
    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      displayName: displayName ?? 'Guest',
    });
  });

  socket.on(
    'message',
    ({
      roomId,
      message,
      senderId,
      senderName,
    }: {
      roomId: string;
      message: string;
      senderId?: string;
      senderName?: string;
    }) => {
      if (!roomId || !message) return;

      socket.to(roomId).emit('message', {
        message,
        senderId: senderId ?? socket.id,
        senderName: senderName ?? 'Guest',
      });
    },
  );
};

