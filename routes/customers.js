const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get all customers
router.get('/', verifyToken, async (req, res) => {
  try {
    const customers = await db.all('SELECT * FROM customers WHERE user_id = ?', [req.user.id]);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const customer = await db.get(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await db.run(
      'INSERT INTO customers (name, email, phone, company, status, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email || null, phone || null, company || null, status || 'active', req.user.id]
    );

    res.status(201).json({ id: result.lastID, name, email, phone, company, status: status || 'active', user_id: req.user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;
    const { id } = req.params;

    const customer = await db.get(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await db.run(
      'UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ? WHERE id = ?',
      [name || customer.name, email || customer.email, phone || customer.phone, company || customer.company, status || customer.status, id]
    );

    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const customer = await db.get(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await db.run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
