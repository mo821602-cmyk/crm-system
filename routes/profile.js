const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../database');
const router = express.Router();

// Get profile
router.get('/', (req, res) => {
  try {
    const user = get('SELECT id, username, email, fullName, role, phone, company, avatar, createdAt FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/', (req, res) => {
  try {
    const { fullName, phone, company } = req.body;
    const user = get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    run('UPDATE users SET fullName = ?, phone = ?, company = ? WHERE id = ?',
      [fullName || user.fullName, phone || user.phone, company || user.company, req.user.userId]);

    res.json({ success: true, message: 'تم تحديث الملف الشخصي' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبة' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const user = get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    const hashed = await bcrypt.hash(newPassword, 12);
    run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.userId]);

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
