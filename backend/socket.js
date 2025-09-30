import { Server } from 'socket.io';

let ioInstance = /** @type {import('socket.io').Server | null} */ (null);

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] },
    path: '/socket.io',
  });

  ioInstance.on('connection', (socket) => {
    // Namespace simple; podríamos autenticar en el futuro
    socket.on('disconnect', () => {});
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO no inicializado');
  }
  return ioInstance;
}

