const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();

// Get all customers
router.get('/', (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = 'SELECT * FROM customers WHERE userId = ?';
    let params = [req.user.userId];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY createdAt DESC';

    const customers = all(sql, params);
    res.json({ success: true, count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', (req, res) => {
  try {
    const customer = get('SELECT * FROM customers WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!customer) return res.status(404).json({ error: 'العميل غير موجود' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer
router.post('/', (req, res) => {
  try {
    const { name, email, phone, company, category, notes, source, value } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم العميل مطلوب' });

    const result = run(
      'INSERT INTO customers (name, email, phone, company, category, notes, source, value, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, company, category || 'عميل جديد', notes, source, value || 0, req.user.userId]
    );

    // Log activity
    run('INSERT INTO activities (type, description, customerId, userId) VALUES (?, ?, ?, ?)',
      ['إضافة عميل', `تم إضافة العميل: ${name}`, result.lastInsertRowid, req.user.userId]);

    res.status(201).json({ success: true, message: 'تم إضافة العميل', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', (req, res) => {
  try {
    const { name, email, phone, company, category, status, notes, source, value } = req.body;
    const existing = get('SELECT * FROM customers WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!existing) return res.status(404).json({ error: 'العميل غير موجود' });

    run(
      'UPDATE customers SET name=?, email=?, phone=?, company=?, category=?, status=?, notes=?, source=?, value=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?',
      [name || existing.name, email || existing.email, phone || existing.phone, company || existing.company,
       category || existing.category, status || existing.status, notes || existing.notes, source || existing.source,
       value !== undefined ? value : existing.value, req.params.id]
    );

    res.json({ success: true, message: 'تم تحديث العميل' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', (req, res) => {
  try {
    const existing = get('SELECT * FROM customers WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!existing) return res.status(404).json({ error: 'العميل غير موجود' });

    run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم حذف العميل' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
