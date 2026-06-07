/**
 * نظام CRM لإدارة العملاء - الخادم الرئيسي
 * CRM System - Main Server v2.0
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
const profileRoutes = require('./routes/profile');
const notificationsRoutes = require('./routes/notifications');
const contactsRoutes = require('./routes/contacts');
const exportRoutes = require('./routes/export');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'محاولات كثيرة، حاول بعد 15 دقيقة' }
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
    version: '2.0.0',
    uptime: process.uptime(),
    features: ['auth', 'customers', 'deals', 'tasks', 'reports', 'notifications', 'export', 'contacts']
  });
});

// Public routes
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/customers', verifyToken, customersRoutes);
app.use('/api/deals', verifyToken, dealsRoutes);
app.use('/api/tasks', verifyToken, tasksRoutes);
app.use('/api/reports', verifyToken, reportsRoutes);
app.use('/api/profile', verifyToken, profileRoutes);
app.use('/api/notifications', verifyToken, notificationsRoutes);
app.use('/api/contacts', verifyToken, contactsRoutes);
app.use('/api/export', verifyToken, exportRoutes);

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'خطأ في الخادم', details: err.message });
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
      console.log(`✅ CRM System v2.0 running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server start error:', error);
    process.exit(1);
  }
}

startServer();
module.exports = app;
