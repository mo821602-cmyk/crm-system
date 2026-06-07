const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();

// Get interactions for a customer
router.get('/:customerId', (req, res) => {
  try {
    const interactions = all(
      'SELECT * FROM contacts WHERE customerId = ? AND userId = ? ORDER BY createdAt DESC',
      [req.params.customerId, req.user.userId]
    );
    res.json({ success: true, interactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add interaction
router.post('/', (req, res) => {
  try {
    const { customerId, type, content } = req.body;
    if (!customerId || !content) return res.status(400).json({ error: 'العميل والمحتوى مطلوبان' });

    const result = run(
      'INSERT INTO contacts (customerId, type, content, userId) VALUES (?, ?, ?, ?)',
      [customerId, type || 'ملاحظة', content, req.user.userId]
    );

    // Log activity
    run('INSERT INTO activities (type, description, customerId, userId) VALUES (?, ?, ?, ?)',
      ['تواصل', `${type || 'ملاحظة'}: ${content.substring(0, 50)}`, customerId, req.user.userId]);

    // Create notification
    run('INSERT INTO notifications (title, message, type, userId) VALUES (?, ?, ?, ?)',
      ['تواصل جديد', `تم تسجيل ${type || 'ملاحظة'} للعميل`, 'info', req.user.userId]);

    res.status(201).json({ success: true, message: 'تم إضافة التواصل', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete interaction
router.delete('/:id', (req, res) => {
  try {
    run('DELETE FROM contacts WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    res.json({ success: true, message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
