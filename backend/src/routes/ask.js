const express = require('express');
const { askFollowUpQuestion, askWhatIfQuestion } = require('../services/gemini');
const sessionStore = require('../services/sessionStore');

const router = express.Router();

/**
 * POST /api/ask
 * Ask a follow-up question about the analyzed image
 */
router.post('/ask', async (req, res, next) => {
  try {
    const { sessionId, question, tapPoint, difficulty } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const session = await sessionStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: question,
      tapPoint: tapPoint || null,
    });

    // Get answer from Gemini
    const answer = await askFollowUpQuestion(
      session.imageData,
      session.imageType,
      question,
      tapPoint,
      difficulty || 'Beginner',
      session.conversationHistory
    );

    // Add assistant response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: answer,
    });

    // Update session in Supabase
    await sessionStore.update(sessionId, {
      conversationHistory: session.conversationHistory,
    });

    res.json({ answer });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/what-if
 * Ask a hypothetical what-if question about the analyzed image
 */
router.post('/what-if', async (req, res, next) => {
  try {
    const { sessionId, scenario, difficulty } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!scenario) {
      return res.status(400).json({ error: 'Scenario is required' });
    }

    const session = await sessionStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: `[What-If Mode] ${scenario}`,
    });

    // Get answer from Gemini with what-if context
    const answer = await askWhatIfQuestion(
      session.imageData,
      session.imageType,
      scenario,
      difficulty || 'Beginner',
      session.conversationHistory
    );

    // Add assistant response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: answer,
      isWhatIf: true,
    });

    // Update session in Supabase
    await sessionStore.update(sessionId, {
      conversationHistory: session.conversationHistory,
    });

    res.json({ answer });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
