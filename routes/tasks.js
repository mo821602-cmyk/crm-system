const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get all tasks
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM tasks WHERE user_id = ?', [req.user.id]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await db.get(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.run(
      'INSERT INTO tasks (title, description, status, priority, user_id, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || null, status || 'pending', priority || 'medium', req.user.id, due_date || null]
    );

    res.status(201).json({ id: result.lastID, title, description, status: status || 'pending', priority: priority || 'medium', user_id: req.user.id, due_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const { id } = req.params;

    const task = await db.get(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?',
      [title || task.title, description || task.description, status || task.status, priority || task.priority, due_date || task.due_date, id]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const task = await db.get(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
