const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Real-Time Client Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client Disconnected: ${socket.id}`);
  });
});

// Connect Database & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 Library Management System Server Running!`);
    console.log(`⚡ Real-Time Socket.io Enabled!`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Listening on: http://localhost:${PORT}`);
    console.log(`================================================`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection! Shutting down server gracefully...', err);
    server.close(() => process.exit(1));
  });
});

