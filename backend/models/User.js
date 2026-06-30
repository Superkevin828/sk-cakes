const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide a contact email address'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email format',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please define a secure password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Prevents leaking password hashes in general queries
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

// Pre-save Mongoose hook to encrypt password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare incoming login strings with hashes
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
