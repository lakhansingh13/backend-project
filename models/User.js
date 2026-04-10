const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===== DAY 5: Basic User Schema =====
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // ===== DAY 6: Password (for authentication) =====
  password: { type: String, required: true },

  age: Number,
  createdAt: { type: Date, default: Date.now }
});

// ===== DAY 6: Password Hashing (Pre-save Hook - FIXED) =====
UserSchema.pre('save', async function() {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Export model
module.exports = mongoose.model('User', UserSchema);