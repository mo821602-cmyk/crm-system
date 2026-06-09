const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get all deals
router.get('/', verifyToken, async (req, res) => {
  try {
    const deals = await db.all('SELECT * FROM deals WHERE user_id = ?', [req.user.id]);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get deal by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const deal = await db.get(
      'SELECT * FROM deals WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create deal
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, value, stage, customer_id, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.run(
      'INSERT INTO deals (title, value, stage, customer_id, user_id, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title, value || null, stage || 'prospect', customer_id || null, req.user.id, due_date || null]
    );

    res.status(201).json({ id: result.lastID, title, value, stage: stage || 'prospect', customer_id, user_id: req.user.id, due_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update deal
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, value, stage, customer_id, due_date } = req.body;
    const { id } = req.params;

    const deal = await db.get(
      'SELECT * FROM deals WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await db.run(
      'UPDATE deals SET title = ?, value = ?, stage = ?, customer_id = ?, due_date = ? WHERE id = ?',
      [title || deal.title, value !== undefined ? value : deal.value, stage || deal.stage, customer_id || deal.customer_id, due_date || deal.due_date, id]
    );

    res.json({ message: 'Deal updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete deal
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deal = await db.get(
      'SELECT * FROM deals WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await db.run('DELETE FROM deals WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
