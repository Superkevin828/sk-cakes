const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by verifying JWT Bearer Token
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Token inside Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract Token String
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_signature_key_change_me_in_production');

      // Fetch user profile from database excludingpassword salt hashes
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, administrator account not found.'
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token signature expired or invalid.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authorization credentials supplied.'
    });
  }
};

/**
 * Gatekeeper checking for explicit Administrative account roles
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrative privileges are required.'
    });
  }
};

module.exports = { protect, adminOnly };
