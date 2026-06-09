// ✅ Fixed Server with Error Handling, Rate Limiting & Security

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const AIService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 3003;

// ✅ Security Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));

// ✅ CORS - Restrictive configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3003',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ✅ Body Parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Initialize AI Service
let aiService;
(async () => {
  try {
    aiService = new AIService();
    await aiService.initialize();
  } catch (error) {
    logger.error('Failed to initialize AI Service:', error);
    process.exit(1);
  }
})();

// API Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const smartRoutes = require('./routes/smart');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/smart', smartRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    res.json({
      status: 'ok',
      ai_enabled: process.env.AI_ENABLED === 'true',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ API Info endpoint
app.get('/api/info', (req, res) => {
  try {
    res.json({
      name: 'AI-Powered Business Management System',
      version: '1.0.0',
      ai_features: [
        'Smart Employee Management',
        'Intelligent Task Assignment',
        'Predictive Analytics',
        'AI Chatbot',
        'Automated Recommendations',
        'Risk Detection'
      ],
      ai_enabled: process.env.AI_ENABLED === 'true',
      models_status: 'active',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Info endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve dashboard
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ✅ 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ✅ Comprehensive error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', {
    message: err.message,
    status: err.status || 500,
    stack: err.stack
  });

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ✅ Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`\n🤖 AI-Powered Business Management System`);
  logger.info(`🚀 Running on http://localhost:${PORT}`);
  logger.info(`📊 Dashboard: http://localhost:${PORT}/`);
  logger.info(`🔌 API: http://localhost:${PORT}/api/v1`);
  logger.info(`\n⚙️  Configuration:`);
  logger.info(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`  - AI Enabled: ${process.env.AI_ENABLED === 'true' ? 'Yes ✅' : 'No ❌'}`);
  logger.info(`  - Database: ${process.env.DB_NAME}\n`);
});

// ✅ Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// ✅ Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ✅ Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
