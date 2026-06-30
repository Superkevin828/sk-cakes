const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'your_super_secret_jwt_signature_key_change_me_in_production', 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @desc    Authenticate User/Admin & Get Token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check if user exists (explicitly select password to compare)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials provided' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials provided' });
    }

    // Send response with JWT token
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new public customer account
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required to create an account.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please login instead.'
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new administrative account
 * @route   POST /api/auth/register
 * @access  Private/Admin
 */
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All registration fields are required' });
    }

    // Check if email already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'This email is already registered' });
    }

    // Save profile (Mongoose handles password pre-save hash)
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'New administrator registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Logged-In User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    // req.user has already been populated by protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
