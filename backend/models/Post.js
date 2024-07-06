// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  body: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Post', postSchema, 'postDetails');
