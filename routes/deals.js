const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();

const STAGES = ['تواصل أولي', 'عرض سعر', 'تفاوض', 'مراجعة', 'مغلقة - ربح', 'مغلقة - خسارة'];

// Get all deals
router.get('/', (req, res) => {
  try {
    const { stage, customerId } = req.query;
    let sql = `SELECT d.*, c.name as customerName FROM deals d 
               LEFT JOIN customers c ON d.customerId = c.id 
               WHERE d.userId = ?`;
    let params = [req.user.userId];

    if (stage) { sql += ' AND d.stage = ?'; params.push(stage); }
    if (customerId) { sql += ' AND d.customerId = ?'; params.push(customerId); }
    sql += ' ORDER BY d.createdAt DESC';

    const deals = all(sql, params);
    res.json({ success: true, count: deals.length, deals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pipeline summary
router.get('/pipeline/summary', (req, res) => {
  try {
    const pipeline = STAGES.map(stage => {
      const deals = all('SELECT * FROM deals WHERE stage = ? AND userId = ?', [stage, req.user.userId]);
      const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
      return { stage, count: deals.length, totalValue };
    });
    res.json({ success: true, pipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create deal
router.post('/', (req, res) => {
  try {
    const { title, customerId, value, stage, probability, expectedCloseDate, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'عنوان الصفقة مطلوب' });

    const result = run(
      'INSERT INTO deals (title, customerId, value, stage, probability, expectedCloseDate, notes, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, customerId, value || 0, stage || 'تواصل أولي', probability || 10, expectedCloseDate, notes, req.user.userId]
    );

    run('INSERT INTO activities (type, description, dealId, customerId, userId) VALUES (?, ?, ?, ?, ?)',
      ['صفقة جديدة', `تم إنشاء صفقة: ${title}`, result.lastInsertRowid, customerId, req.user.userId]);

    res.status(201).json({ success: true, message: 'تم إنشاء الصفقة', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update deal stage
router.patch('/:id/stage', (req, res) => {
  try {
    const { stage } = req.body;
    if (!STAGES.includes(stage)) return res.status(400).json({ error: 'مرحلة غير صالحة' });

    const deal = get('SELECT * FROM deals WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!deal) return res.status(404).json({ error: 'الصفقة غير موجودة' });

    run('UPDATE deals SET stage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [stage, req.params.id]);

    run('INSERT INTO activities (type, description, dealId, userId) VALUES (?, ?, ?, ?)',
      ['تحديث صفقة', `تم نقل الصفقة "${deal.title}" إلى: ${stage}`, req.params.id, req.user.userId]);

    res.json({ success: true, message: 'تم تحديث المرحلة' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update deal
router.put('/:id', (req, res) => {
  try {
    const { title, value, stage, probability, expectedCloseDate, notes } = req.body;
    const deal = get('SELECT * FROM deals WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!deal) return res.status(404).json({ error: 'الصفقة غير موجودة' });

    run('UPDATE deals SET title=?, value=?, stage=?, probability=?, expectedCloseDate=?, notes=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?',
      [title || deal.title, value !== undefined ? value : deal.value, stage || deal.stage,
       probability !== undefined ? probability : deal.probability, expectedCloseDate || deal.expectedCloseDate,
       notes || deal.notes, req.params.id]);

    res.json({ success: true, message: 'تم تحديث الصفقة' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete deal
router.delete('/:id', (req, res) => {
  try {
    const deal = get('SELECT * FROM deals WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!deal) return res.status(404).json({ error: 'الصفقة غير موجودة' });
    run('DELETE FROM deals WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم حذف الصفقة' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
