import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for AI processing
});

/**
 * Upload and analyze an image
 * @param {File} imageFile - The image file to analyze
 * @param {string} difficulty - The difficulty level (Novice, Beginner, etc.)
 * @returns {Promise<{sessionId: string, analysis: string, components: Array}>}
 */
export const analyzeImage = async (imageFile, difficulty = 'Beginner') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('difficulty', difficulty);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Ask a follow-up question about the image
 * @param {string} sessionId - The session ID from initial analysis
 * @param {string} question - The user's question
 * @param {object|null} tapPoint - The tap coordinates {x, y} if applicable
 * @param {string} difficulty - The difficulty level
 * @returns {Promise<{answer: string}>}
 */
export const askFollowUp = async (sessionId, question, tapPoint = null, difficulty = 'Beginner') => {
  const response = await api.post('/ask', {
    sessionId,
    question,
    tapPoint,
    difficulty,
  });

  return response.data;
};

/**
 * Ask a what-if hypothetical question
 * @param {string} sessionId - The session ID from initial analysis
 * @param {string} scenario - The what-if scenario to explore
 * @param {string} difficulty - The difficulty level
 * @returns {Promise<{answer: string}>}
 */
export const askWhatIf = async (sessionId, scenario, difficulty = 'Beginner') => {
  const response = await api.post('/what-if', {
    sessionId,
    scenario,
    difficulty,
  });

  return response.data;
};

/**
 * Get session information
 * @param {string} sessionId - The session ID
 * @returns {Promise<{exists: boolean, imageInfo: object}>}
 */
export const getSession = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}`);
  return response.data;
};

export default api;
