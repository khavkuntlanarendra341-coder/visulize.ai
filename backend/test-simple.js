require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  console.log('Testing basic text generation...\n');
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    console.log('✅ SUCCESS! Response:', response.text());
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error message:', error.message);
    console.log('Error status:', error.status);
    console.log('\nFull error details:');
    console.log(error);
  }
}

test();