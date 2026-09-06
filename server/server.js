require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const companyRoutes = require('./routes/company.routes');
const driveRoutes = require('./routes/drive.routes');
const applicationRoutes = require('./routes/application.routes');
const interviewRoutes = require('./routes/interview.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Ensure MongoDB connection before handling requests in serverless environments
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MongoDB Atlas Network Access has 0.0.0.0/0 enabled.',
      error: err.message,
    });
  }
});

// Security headers (allowing cross-origin for static assets like PDFs & logos)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — dynamic reflection ensures credentials: true works seamlessly across all Vercel domains
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // If no origin (e.g. mobile/same-origin/curl) or allowed or wildcard, allow and reflect origin
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, origin || true);
      }
      // Allow Vercel preview & production domains automatically
      if (origin && (origin.endsWith('.vercel.app') || origin.includes('localhost'))) {
        return callback(null, origin);
      }
      return callback(null, origin || true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting — generous limit to allow smooth development and HMR navigation
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Rize Placement & Internship Management API',
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      students: '/api/students',
      companies: '/api/companies',
      drives: '/api/drives',
      applications: '/api/applications',
      interviews: '/api/interviews',
      notifications: '/api/notifications',
    },
    message: 'Welcome to Rize API. Backend services are fully operational.',
  });
});

// API Gateway Welcome Endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Rize API Gateway is active and healthy.',
    health: '/api/health',
    version: '1.0.0',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Rize API is running.', env: process.env.NODE_ENV || 'production' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Rize API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
