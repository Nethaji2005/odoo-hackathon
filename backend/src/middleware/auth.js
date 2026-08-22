const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

/**
 * protect middleware — verifies JWT and attaches decoded payload to req.user.
 * JWT payload shape: { id, role, name, email }
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required. Please log in.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, name, email, iat, exp }
    next();
  } catch (err) {
    return sendError(res, 401, 'Invalid or expired token. Please log in again.');
  }
};

module.exports = { protect };
