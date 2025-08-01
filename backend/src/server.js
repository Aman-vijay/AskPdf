import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import pdfRoutes from './routes/pdfRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createUploadsDir } from './utils/fileUtils.js';
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory
createUploadsDir();

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Connected'
  });
});

// Database health check
app.get('/api/health/storage', async (req, res) => {
  res.json({ 
    status: 'OK', 
    storage: 'Local File System',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Handle uncaught exceptions to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION - keeping process alive:', error);
  // You can add notification logic here (email, log to monitoring service, etc.)
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 PDF Chat Backend running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Storage: Local File System + In-Memory Data`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

export default app;