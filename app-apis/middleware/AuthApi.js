const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try { req.user = jwt.verify(token, process.env.AUTH_SECRET); return next(); }
  catch { return res.status(401).json({ success: false, message: 'Session is invalid or expired' }); }
};
