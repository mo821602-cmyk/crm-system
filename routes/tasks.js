const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();

// Get all tasks
router.get('/', (req, res) => {
  try {
    const { status, priority } = req.query;
    let sql = `SELECT t.*, c.name as customerName FROM tasks t 
               LEFT JOIN customers c ON t.customerId = c.id 
               WHERE t.userId = ?`;
    let params = [req.user.userId];

    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (priority) { sql += ' AND t.priority = ?'; params.push(priority); }
    sql += ' ORDER BY t.dueDate ASC, t.createdAt DESC';

    const tasks = all(sql, params);
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overdue tasks
router.get('/overdue', (req, res) => {
  try {
    const tasks = all(
      `SELECT t.*, c.name as customerName FROM tasks t 
       LEFT JOIN customers c ON t.customerId = c.id 
       WHERE t.userId = ? AND t.status != 'مكتملة' AND t.dueDate < date('now')
       ORDER BY t.dueDate ASC`,
      [req.user.userId]
    );
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', (req, res) => {
  try {
    const { title, description, customerId, dealId, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: 'عنوان المهمة مطلوب' });

    const result = run(
      'INSERT INTO tasks (title, description, customerId, dealId, priority, dueDate, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, customerId, dealId, priority || 'متوسطة', dueDate, req.user.userId]
    );

    res.status(201).json({ success: true, message: 'تم إنشاء المهمة', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['قيد الانتظار', 'جارية', 'مكتملة', 'ملغاة'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'حالة غير صالحة' });

    const task = get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });

    const completedAt = status === 'مكتملة' ? new Date().toISOString() : null;
    run('UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?', [status, completedAt, req.params.id]);

    res.json({ success: true, message: 'تم تحديث حالة المهمة' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', (req, res) => {
  try {
    const task = get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });
    run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم حذف المهمة' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
