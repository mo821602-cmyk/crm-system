const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get all notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread notifications
router.get('/unread', verifyToken, async (req, res) => {
  try {
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create notification
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await db.run(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [req.user.id, message, type || 'info']
    );

    res.status(201).json({ id: result.lastID, user_id: req.user.id, message, type: type || 'info', read: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await db.get(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db.run('UPDATE notifications SET read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await db.get(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db.run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
