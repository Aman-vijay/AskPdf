export const validatePDF = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  if (req.file.size > (parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024)) {
    return res.status(400).json({ error: 'File size too large' });
  }

  next();
};

export const validateChatRequest = (req, res, next) => {
  const { query, documentId } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Valid query is required' });
  }

  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json({ error: 'Valid documentId is required' });
  }

  if (query.length > 1000) {
    return res.status(400).json({ error: 'Query too long (max 1000 characters)' });
  }

  next();
};
