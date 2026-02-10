// check-models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  const testModels = [
    'gemini-pro-vision',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash-exp'
  ];

  console.log('🔍 Testing which models work with your API key...\n');

  for (const modelName of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello');
      console.log(`✅ ${modelName} - WORKS`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`❌ ${modelName} - NOT AVAILABLE`);
      } else {
        console.log(`⚠️  ${modelName} - ERROR: ${error.message}`);
      }
    }
  }
}


checkModels();