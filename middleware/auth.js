const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'crm-default-secret-change-in-production-2026';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ تحذير: JWT_SECRET غير معيّن في البيئة. استخدم متغير بيئة قوي في الإنتاج!');
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح - يرجى تسجيل الدخول' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'الرمز غير صالح أو منتهي الصلاحية' });
  }
}

module.exports = { verifyToken, JWT_SECRET };
