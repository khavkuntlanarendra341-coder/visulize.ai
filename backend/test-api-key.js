require('dotenv').config();

console.log('🔍 API Key Diagnostics:\n');
console.log('1. API Key exists in env?', !!process.env.GEMINI_API_KEY);
console.log('2. API Key length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('3. API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10) || 'NONE');
console.log('4. Full API Key:', process.env.GEMINI_API_KEY || 'NOT FOUND');