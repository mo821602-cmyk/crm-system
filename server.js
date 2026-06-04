/**
 * نظام CRM لإدارة العملاء - الخادم الرئيسي
 * CRM System - Main Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initializeDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const customersRoutes = require('./routes/customers');
const dealsRoutes = require('./routes/deals');
const tasksRoutes = require('./routes/tasks');
const reportsRoutes = require('./routes/reports');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' }
});
app.use(limiter);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/customers', verifyToken, customersRoutes);
app.use('/api/deals', verifyToken, dealsRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
app.use('/api/reports', verifyToken, reportsRoutes);

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود', path: req.path });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ CRM System running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server start error:', error);
    process.exit(1);
  }
}

startServer();
module.exports = app;
