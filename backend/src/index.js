require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const analyzeRoutes = require('./routes/analyze');
const askRoutes = require('./routes/ask');
const sessionRoutes = require('./routes/session');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeTables } = require('./services/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', analyzeRoutes);
app.use('/api', askRoutes);
app.use('/api', sessionRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Initialize Supabase tables
  await initializeTables();

  app.listen(PORT, () => {
    console.log(`🚀 Visualize.AI Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? 'Configured' : 'NOT CONFIGURED'}`);
  });
};

startServer().catch(console.error);

module.exports = app;
