const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model - using gemini-1.5-flash for multimodal capabilities
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

/**
 * Get difficulty-specific prompt instructions
 */
const getDifficultyInstructions = (difficulty) => {
  const levels = {
    'Novice': `
      Explain like I'm a complete beginner with no technical background.
      Use simple everyday analogies and comparisons.
      Avoid all technical jargon - if you must use a term, explain it immediately.
      Keep sentences short and clear.
      Focus on "what it does" rather than "how it works technically."
    `,
    'Beginner': `
      Explain for someone with basic knowledge who is learning.
      Introduce simple technical terms with brief explanations.
      Use relatable examples from everyday life.
      Balance simplicity with accuracy.
    `,
    'Intermediate': `
      Explain for a hobbyist or someone with moderate technical knowledge.
      Use appropriate technical terminology.
      Include relevant details about how things work.
      Assume familiarity with basic concepts.
    `,
    'Advanced': `
      Explain for someone with strong technical background.
      Use precise technical language and specifications.
      Include detailed explanations of mechanisms and principles.
      Reference relevant standards or best practices.
    `,
    'Expert': `
      Explain for a professional or specialist in the field.
      Use full technical depth with specifications.
      Include theoretical principles and advanced concepts.
      Discuss edge cases, optimizations, and professional considerations.
    `,
  };

  return levels[difficulty] || levels['Beginner'];
};

/**
 * Analyze an image and provide initial understanding
 */
async function analyzeImageWithGemini(imageBase64, imageMimeType, difficulty) {
  const difficultyInstructions = getDifficultyInstructions(difficulty);

  const prompt = `You are Visualize.AI, an expert multimodal learning assistant that helps people understand how things work by analyzing images.

TASK: Analyze this image and provide a comprehensive yet accessible explanation.

DIFFICULTY LEVEL: ${difficulty}
${difficultyInstructions}

ANALYSIS STRUCTURE:
1. **Overview**: What is this image showing? Identify the main subject.
2. **Key Components**: List the main visible parts/components (number them).
3. **How It Works**: Explain the basic function or purpose.
4. **Interesting Facts**: Share 1-2 interesting details about what's shown.
5. **Next Steps**: Suggest what the user might want to explore by clicking on specific parts.

IMPORTANT GUIDELINES:
- Be engaging and educational
- Match your language complexity to the difficulty level
- If you can identify specific components, mention their approximate positions (left, right, top, bottom, center)
- Encourage the user to tap/click on specific parts to learn more
- Keep the response focused and not too long (aim for 200-400 words)

Analyze the image now:`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const analysis = response.text();

    // Try to extract component positions (simplified - in production you'd use vision API)
    const components = extractComponentMentions(analysis);

    return {
      analysis,
      components,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze image with AI');
  }
}

/**
 * Ask a follow-up question about the image
 */
async function askFollowUpQuestion(imageBase64, imageMimeType, question, tapPoint, difficulty, conversationHistory) {
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  
  let contextPrompt = `You are Visualize.AI, continuing a conversation about an image.

DIFFICULTY LEVEL: ${difficulty}
${difficultyInstructions}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

`;

  if (tapPoint) {
    contextPrompt += `
USER CLICKED ON THE IMAGE:
The user clicked at position (${Math.round(tapPoint.x)}%, ${Math.round(tapPoint.y)}%) of the image.
- If x is 0-33%: LEFT side of image
- If x is 34-66%: CENTER of image  
- If x is 67-100%: RIGHT side of image
- If y is 0-33%: TOP of image
- If y is 34-66%: MIDDLE of image
- If y is 67-100%: BOTTOM of image

Focus your answer on what is visible at or near this position.
`;
  }

  contextPrompt += `
NEW QUESTION: ${question}

INSTRUCTIONS:
- Answer the question directly and helpfully
- Reference the specific part of the image if relevant
- Maintain the appropriate difficulty level
- Keep your response focused (150-300 words unless the question requires more detail)
- If you cannot determine exactly what the user clicked on, describe what you can see in that general area

Respond now:`;

  try {
    const result = await model.generateContent([
      contextPrompt,
      {
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to process question with AI');
  }
}

/**
 * Ask a what-if hypothetical question
 */
async function askWhatIfQuestion(imageBase64, imageMimeType, scenario, difficulty, conversationHistory) {
  const difficultyInstructions = getDifficultyInstructions(difficulty);

  const prompt = `You are Visualize.AI in "What-If Mode" - exploring hypothetical scenarios about an image.

DIFFICULTY LEVEL: ${difficulty}
${difficultyInstructions}

CONVERSATION HISTORY:
${conversationHistory.slice(-6).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

WHAT-IF SCENARIO: ${scenario}

WHAT-IF ANALYSIS STRUCTURE:
1. **Scenario Understanding**: Briefly restate the hypothetical situation
2. **Immediate Effects**: What would happen right away?
3. **Chain Reactions**: What secondary effects might occur?
4. **Real-World Implications**: Why does this matter? What could go wrong?
5. **Prevention/Solution**: How to avoid this issue or fix it?

GUIDELINES:
- Be educational and thought-provoking
- Ground your analysis in the actual image components
- Explain cause and effect relationships clearly
- Match complexity to the difficulty level
- Keep response focused (200-350 words)
- If the scenario doesn't apply to the image, politely redirect

Analyze this what-if scenario:`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to process what-if scenario with AI');
  }
}

/**
 * Extract component mentions from analysis (simplified version)
 * In production, you would use a separate vision API call for object detection
 */
function extractComponentMentions(analysis) {
  // This is a simplified extraction - in production you'd use proper vision detection
  const components = [];
  
  // Look for numbered items that might be component mentions
  const numberedPattern = /(\d+)\.\s*\*\*([^*]+)\*\*/g;
  let match;
  
  while ((match = numberedPattern.exec(analysis)) !== null) {
    // Assign rough positions based on order (would be replaced with actual detection)
    const positions = [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
      { x: 50, y: 50 },
    ];
    
    const index = parseInt(match[1]) - 1;
    if (index < positions.length) {
      components.push({
        name: match[2].trim(),
        ...positions[index],
      });
    }
  }

  return components;
}

module.exports = {
  analyzeImageWithGemini,
  askFollowUpQuestion,
  askWhatIfQuestion,
};
