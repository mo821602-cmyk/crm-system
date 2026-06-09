const jwt = require('jwt-simple');
const SECRET = process.env.JWT_SECRET || 'your-strong-secret-key-here';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.decode(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const generateToken = (user) => {
  return jwt.encode({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  }, SECRET);
};

module.exports = {
  verifyToken,
  generateToken
};
