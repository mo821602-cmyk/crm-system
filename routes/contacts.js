const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get contacts for customer
router.get('/customer/:customer_id', verifyToken, async (req, res) => {
  try {
    const contacts = await db.all(
      'SELECT * FROM contacts WHERE customer_id = ?',
      [req.params.customer_id]
    );
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contact by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const contact = await db.get(
      'SELECT * FROM contacts WHERE id = ?',
      [req.params.id]
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create contact
router.post('/', verifyToken, async (req, res) => {
  try {
    const { customer_id, name, email, phone, position } = req.body;

    if (!customer_id || !name) {
      return res.status(400).json({ error: 'Customer ID and name are required' });
    }

    const result = await db.run(
      'INSERT INTO contacts (customer_id, name, email, phone, position) VALUES (?, ?, ?, ?, ?)',
      [customer_id, name, email || null, phone || null, position || null]
    );

    res.status(201).json({ id: result.lastID, customer_id, name, email, phone, position });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update contact
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, position } = req.body;
    const { id } = req.params;

    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [id]);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await db.run(
      'UPDATE contacts SET name = ?, email = ?, phone = ?, position = ? WHERE id = ?',
      [name || contact.name, email || contact.email, phone || contact.phone, position || contact.position, id]
    );

    res.json({ message: 'Contact updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await db.run('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
