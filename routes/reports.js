const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get all reports
router.get('/', verifyToken, async (req, res) => {
  try {
    const reports = await db.all('SELECT * FROM reports WHERE user_id = ?', [req.user.id]);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales report
router.get('/sales/summary', verifyToken, async (req, res) => {
  try {
    const summary = await db.get(
      `SELECT 
        COUNT(*) as total_deals,
        SUM(value) as total_value,
        AVG(value) as avg_value
      FROM deals WHERE user_id = ?`,
      [req.user.id]
    );
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer report
router.get('/customers/summary', verifyToken, async (req, res) => {
  try {
    const summary = await db.get(
      `SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers
      FROM customers WHERE user_id = ?`,
      [req.user.id]
    );
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, data } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.run(
      'INSERT INTO reports (user_id, title, data) VALUES (?, ?, ?)',
      [req.user.id, title, JSON.stringify(data) || null]
    );

    res.status(201).json({ id: result.lastID, user_id: req.user.id, title, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
