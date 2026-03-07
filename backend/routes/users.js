const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user (or update if exists)
router.post('/', async (req, res) => {
  try {
    // Check if user with this id or email already exists
    const existingUser = await User.findOne({ 
      $or: [
        { id: req.body.id },
        { email: req.body.email }
      ]
    });
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await User.findOneAndUpdate(
        { id: req.body.id },
        req.body,
        { new: true }
      );
      return res.json(updatedUser);
    }
    
    // Create new user
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;