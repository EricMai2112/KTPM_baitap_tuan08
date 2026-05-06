require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tourRoutes = require('./routes/tourRoutes');
const { connectDatabase, getConnectionStatus } = require('./db');

const app = express();
const PORT = process.env.PORT || 8082;
const HOST = process.env.HOST || '172.16.35.42';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const isConnected = getConnectionStatus();
  res.status(isConnected ? 200 : 503).json({
    service: 'Tour Service',
    status: isConnected ? 'running' : 'degraded',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    ipAddress: HOST,
    port: PORT
  });
});

// Routes
app.use('/api', tourRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Tour Service',
    version: '1.0.0',
    description: 'Tour Service for Travel Booking System (MongoDB)',
    endpoints: {
      health: 'GET /health',
      getAllTours: 'GET /api/tours',
      getTourById: 'GET /api/tours/:id'
    },
    ipAddress: HOST,
    port: PORT,
    database: 'MongoDB'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Tour Service] Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, HOST, async () => {
  console.log('\n========================================');
  console.log('[Tour Service] Started Successfully');
  console.log('========================================');
  
  // Connect to MongoDB
  const dbConnected = await connectDatabase();
  
  console.log(`Host: ${HOST}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://${HOST}:${PORT}`);
  console.log(`Database: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}`);
  console.log('========================================\n');
  console.log('Available endpoints:');
  console.log(`  - GET  http://${HOST}:${PORT}/health`);
  console.log(`  - GET  http://${HOST}:${PORT}/api/tours`);
  console.log(`  - GET  http://${HOST}:${PORT}/api/tours/:id`);
  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Tour Service] SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Tour Service] SIGINT signal received: closing HTTP server');
  process.exit(0);
});
