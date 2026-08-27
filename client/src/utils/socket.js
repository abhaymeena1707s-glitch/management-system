import { io } from 'socket.io-client';

// Create a single shared socket instance
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('⚡ Connected to Real-Time Socket Server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from Real-Time Socket Server');
});

export default socket;
