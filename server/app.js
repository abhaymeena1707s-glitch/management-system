const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const globalErrorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const issueRoutes = require('./routes/issueRoutes');
const returnRoutes = require('./routes/returnRoutes');
const fineRoutes = require('./routes/fineRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const reportRoutes = require('./routes/reportRoutes');
const activityRoutes = require('./routes/activityRoutes');
const settingRoutes = require('./routes/settingRoutes');
const itemRoutes = require('./routes/itemRoutes');
const billRoutes = require('./routes/billRoutes');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev
      }
    },
    credentials: true,
  })
);

// Request Loggers & Parsers
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply global rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Library Management System API operational' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/inventory/items', itemRoutes);
app.use('/api/inventory/bills', billRoutes);

// Handle 404 Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find path ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
