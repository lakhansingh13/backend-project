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

// ===== DAY 9: Virtual Field (Summary) =====
PostSchema.virtual('summary').get(function () {
  return this.content.substring(0, 20) + '...';
});

// Enable virtuals in JSON
PostSchema.set('toJSON', { virtuals: true });

// Export model
module.exports = mongoose.model('Post', PostSchema);