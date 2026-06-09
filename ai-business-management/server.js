const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// AI Services
const AIService = require('./services/aiService');
const MLService = require('./services/mlService');
const NLPService = require('./services/nlpService');
const ChatbotService = require('./services/chatbotService');
const PredictionService = require('./services/predictionService');

// Initialize AI
const aiService = new AIService();
aiService.initialize();

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ai_enabled: process.env.AI_ENABLED === 'true',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'AI-Powered Business Management System',
    version: '1.0.0',
    ai_features: [
      'Smart Employee Management',
      'Intelligent Task Assignment',
      'Predictive Analytics',
      'AI Chatbot',
      'Automated Recommendations',
      'Risk Detection',
      'Performance Prediction'
    ],
    ai_enabled: process.env.AI_ENABLED === 'true',
    models_status: 'active'
  });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🤖 AI-Powered Business Management System`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
  console.log(`\n⚙️  Configuration:`);
  console.log(`  - AI Enabled: ${process.env.AI_ENABLED === 'true' ? 'Yes ✅' : 'No ❌'}`);
  console.log(`  - NLP Enabled: ${process.env.NLP_SENTIMENT_ENABLED === 'true' ? 'Yes ✅' : 'No ❌'}`);
  console.log(`  - ML Models: Ready`);
  console.log(`  - Database: ${process.env.DB_NAME}\n`);
});

module.exports = app;
