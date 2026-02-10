require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log('📋 Fetching available models...\n');
    
    // This is a direct API call to list models
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models:\n');
      data.models.forEach(model => {
        const name = model.name.replace('models/', '');
        const methods = model.supportedGenerationMethods || [];
        if (methods.includes('generateContent')) {
          console.log(`  ✓ ${name}`);
        }
      });
    } else {
      console.log('❌ No models found');
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAvailableModels();