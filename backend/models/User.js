const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  bio: String,
  avatar: String,
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  posts_count: { type: Number, default: 0 },
  joined_date: { type: Date, default: Date.now },
  is_verified: { type: Boolean, default: false },
  is_moderator: { type: Boolean, default: false },
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
  },
  last_login: Date,
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
});

module.exports = mongoose.model('User', userSchema);