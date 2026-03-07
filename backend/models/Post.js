const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author_id: { type: String, required: true },
  author_name: { type: String, required: true },
  author_handle: { type: String, required: true },
  author_email: { type: String, required: true },
  author_avatar: { type: String },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  is_moderated: { type: Boolean, default: false },
  moderation_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  tags: [String],
  media_urls: [String],
  location: String,
  language: String,
  sentiment_score: Number,
  cyberbullying_detected: { type: Boolean, default: false },
  cyberbullying_severity: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
  cyberbullying_categories: [String],
  cyberbullying_confidence: Number,
  detected_language: String,
  moderation_action: { type: String, enum: ['none', 'hide', 'flag'], default: 'none' },
  is_hidden: { type: Boolean, default: false },
  is_bully: { type: Boolean, default: false },
  is_reported: { type: Boolean, default: false },
});

module.exports = mongoose.model('Post', postSchema);