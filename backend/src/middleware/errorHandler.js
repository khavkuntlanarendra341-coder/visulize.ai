/**
 * Global error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'Image must be less than 10MB',
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only JPEG, PNG, WebP, and GIF images are allowed',
    });
  }

  // Gemini API errors
  if (err.message && err.message.includes('Gemini')) {
    return res.status(503).json({
      error: 'AI Service Error',
      message: 'The AI service is temporarily unavailable. Please try again.',
    });
  }

  // API key not configured
  if (err.message && err.message.includes('API_KEY')) {
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'The server is not properly configured. Please contact support.',
    });
  }

  // Session errors
  if (err.message && err.message.includes('Session')) {
    return res.status(404).json({
      error: 'Session Error',
      message: err.message,
    });
  }

  // Default error response
  return res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
  });
};

/**
 * Async route wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
