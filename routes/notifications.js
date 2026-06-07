const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();

// Get all notifications
router.get('/', (req, res) => {
  try {
    const notifications = all(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
      [req.user.userId]
    );
    const unreadCount = get('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0', [req.user.userId]);
    res.json({ success: true, notifications, unreadCount: unreadCount.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.patch('/:id/read', (req, res) => {
  try {
    run('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    res.json({ success: true, message: 'تم التحديث' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.patch('/read-all', (req, res) => {
  try {
    run('UPDATE notifications SET isRead = 1 WHERE userId = ?', [req.user.userId]);
    res.json({ success: true, message: 'تم قراءة جميع الإشعارات' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', (req, res) => {
  try {
    run('DELETE FROM notifications WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    res.json({ success: true, message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
