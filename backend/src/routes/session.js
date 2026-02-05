const express = require('express');
const sessionStore = require('../services/sessionStore');

const router = express.Router();

/**
 * GET /api/session/:sessionId
 * Get session information
 */
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await sessionStore.get(sessionId);
    if (!session) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      imageInfo: {
        mimeType: session.imageType,
        hasImage: !!session.imageData,
      },
      conversationLength: session.conversationHistory?.length || 0,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/session/:sessionId
 * Delete a session
 */
router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const existed = await sessionStore.delete(sessionId);
    
    res.json({ 
      success: true, 
      existed,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
