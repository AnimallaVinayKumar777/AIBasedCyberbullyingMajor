const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safenet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SafeNet Backend API is running',
    timestamp: new Date().toISOString(),
    database: 'MongoDB'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'SafeNet Backend API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});