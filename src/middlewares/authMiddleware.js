const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token provided' });

    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { 
      user_id: user.user_id,  
      role: user.role, 
      username: user.username, 
      email: user.email 
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

const authorizeRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

module.exports = { authMiddleware, authorizeRole };
