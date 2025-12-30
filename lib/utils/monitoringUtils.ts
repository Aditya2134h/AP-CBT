import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export function setupSocketIO(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`Client ${socket.id} left room ${roomId}`);
    });

    socket.on('security-event', (event) => {
      console.log('Security event received:', event);
      io.to('monitoring').emit('security-event', event);
    });

    socket.on('test-progress', (progress) => {
      console.log('Test progress update:', progress);
      io.to(`test-${progress.testId}`).emit('test-progress', progress);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function emitSecurityEvent(io: SocketIOServer, event: any) {
  io.to('monitoring').emit('security-event', event);
}

export function emitTestProgress(io: SocketIOServer, testId: string, progress: any) {
  io.to(`test-${testId}`).emit('test-progress', progress);
}

export function emitTestSessionUpdate(io: SocketIOServer, sessionId: string, update: any) {
  io.to(`session-${sessionId}`).emit('session-update', update);
}

export function getActiveSessions(io: SocketIOServer): string[] {
  const rooms = io.sockets.adapter.rooms;
  const sessionRooms = Array.from(rooms.keys()).filter(key => key.startsWith('session-'));
  return sessionRooms;
}

export function getActiveTestSessions(io: SocketIOServer, testId: string): string[] {
  const rooms = io.sockets.adapter.rooms;
  const testSessionRooms = Array.from(rooms.keys()).filter(key => key === `test-${testId}`);
  return testSessionRooms;
}

export function broadcastToAll(io: SocketIOServer, event: string, data: any) {
  io.emit(event, data);
}

export function broadcastToRoom(io: SocketIOServer, room: string, event: string, data: any) {
  io.to(room).emit(event, data);
}

export function getSocketIOHandler(req: NextApiRequest, res: NextApiResponse) {
  // This would be used in API routes that need Socket.IO
  // In Next.js, you'd typically set this up in a custom server
  // For API routes, you might need a different approach
  
  if ((res as any).socket?.server?.io) {
    console.log('Socket.IO already running');
    return (res as any).socket.server.io;
  }
  
  console.log('Initializing Socket.IO');
  const io = setupSocketIO((res as any).socket.server);
  (res as any).socket.server.io = io;
  
  return io;
}