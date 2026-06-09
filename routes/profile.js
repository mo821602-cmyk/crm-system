const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');
const crypto = require('crypto');

// Get user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name || user.name, email || user.email, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const hashedOldPassword = crypto.createHash('sha256').update(oldPassword).digest('hex');

    if (user.password !== hashedOldPassword) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }

    const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
