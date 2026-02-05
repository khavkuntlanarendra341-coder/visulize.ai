const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { analyzeImageWithGemini } = require('../services/gemini');
const sessionStore = require('../services/sessionStore');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

/**
 * POST /api/analyze
 * Upload and analyze an image using Gemini
 */
router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const difficulty = req.body.difficulty || 'Beginner';
    const sessionId = uuidv4();

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const imageMimeType = req.file.mimetype;

    // Analyze image with Gemini
    const analysisResult = await analyzeImageWithGemini(
      imageBase64,
      imageMimeType,
      difficulty
    );

    // Store session data in Supabase
    await sessionStore.set(sessionId, {
      imageData: imageBase64,
      imageType: imageMimeType,
      imageDescription: analysisResult.analysis,
      components: analysisResult.components,
      conversationHistory: [
        {
          role: 'assistant',
          content: analysisResult.analysis,
        }
      ],
      difficulty,
    });

    res.json({
      sessionId,
      analysis: analysisResult.analysis,
      components: analysisResult.components || [],
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
