const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    if (token.startsWith('Bearer ')) token = token.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = protect;
