const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email, active: true, deleted: 0 } });
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, public_key: user.public_key, name: user.name, email: user.email, role: user.role }, process.env.AUTH_SECRET, { expiresIn: process.env.AUTH_EXPIRES_IN || '8h' });
    res.json({ success: true, message: 'Login successful', data: { token, user: { public_key: user.public_key, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { next(e); }
};
exports.me = (req, res) => res.json({ success: true, message: 'User retrieved successfully', data: req.user });
