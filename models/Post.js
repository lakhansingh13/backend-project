const mongoose = require('mongoose');

// ===== DAY 8: Post Schema (Reference to User) =====
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },

  // 🔗 Reference to User (important)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);