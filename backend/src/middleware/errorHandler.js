export const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name,
    path: req.path,
    method: req.method
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum allowed size'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file',
      message: 'Unexpected file field'
    });
  }

  // PDF processing errors
  if (err.message && (err.message.includes('PDF') || err.message.includes('pdf'))) {
    return res.status(400).json({
      error: 'PDF processing error',
      message: err.message
    });
  }

  // Module errors (like missing llama-cloud-services)
  if (err.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('Module not found:', err.message);
    return res.status(500).json({
      error: 'Service configuration error',
      message: 'A required service is misconfigured. Please contact support.'
    });
  }

  // AI service errors
  if (err.message && (err.message.includes('AI') || err.message.includes('Gemini'))) {
    return res.status(503).json({
      error: 'AI service unavailable',
      message: 'The AI service is temporarily unavailable. Please try again later.'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};
