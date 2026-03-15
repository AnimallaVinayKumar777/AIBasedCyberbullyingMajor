const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { detectCyberbullying } = require('../utils/cyberbullyingDetection');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new post
router.post('/', async (req, res) => {
  try {
    const content = req.body.content || '';

    // Use proper cyberbullying detection
    const detectionResult = await detectCyberbullying(content);

    // Set moderation action based on detection
    const moderationAction = detectionResult.isCyberbullying ? 'hide' : 'none';
    const isHidden = detectionResult.isCyberbullying;
    const isBully = detectionResult.isCyberbullying;

    req.body.cyberbullying_detected = detectionResult.isCyberbullying;
    req.body.cyberbullying_severity = detectionResult.severity;
    req.body.cyberbullying_categories = detectionResult.categories;
    req.body.cyberbullying_confidence = detectionResult.confidence;
    req.body.detected_language = detectionResult.detectedLanguage;
    req.body.moderation_action = moderationAction;
    req.body.is_hidden = isHidden;
    req.body.is_bully = isBully;

    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;