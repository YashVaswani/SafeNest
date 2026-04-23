/**
 * Auth Middleware – verifies JWT and attaches user payload to req.user
 */
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_123');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
}

/**
 * Role Guard – call after authMiddleware to restrict by role(s)
 * Usage: requireRole('ADMIN') or requireRole('RESIDENT', 'GUARD')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
