import express from 'express';
import ragService from '../services/ragService.js';
import pdfProcessor from '../services/pdfProcessor.js';
import dataStore from '../services/dataStore.js';
import { validateChatRequest } from '../middleware/validation.js';

const router = express.Router();

// Chat with document
router.post('/query', validateChatRequest, async (req, res) => {
  try {
    const { query, documentId, conversationHistory = [] } = req.body;

    console.log(`💬 Chat query received for document: ${documentId}`);

    // Verify document exists
    const document = await pdfProcessor.getDocument(documentId);

    // Generate response using RAG
    const response = await ragService.generateResponse(query, documentId);

    // Save chat message to database
    await dataStore.saveChatMessage(
      documentId,
      query,
      response.answer,
      response.citations
    );

    // Generate follow-up questions
    const followUpQuestions = await ragService.generateFollowUpQuestions(
      documentId, 
      [...conversationHistory, { question: query, answer: response.answer }]
    );

    res.json({
      success: true,
      data: {
        query,
        answer: response.answer,
        citations: response.citations,
        confidence: response.confidence,
        relevantChunks: response.relevantChunks,
        followUpQuestions,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat query error:', error);
    res.status(500).json({
      error: 'Failed to process chat query',
      message: error.message
    });
  }
});

// Get citations for a specific response
router.post('/citations', async (req, res) => {
  try {
    const { query, documentId } = req.body;

    if (!query || !documentId) {
      return res.status(400).json({ 
        error: 'Query and documentId are required' 
      });
    }

    // Get relevant chunks
    const relevantChunks = await pdfProcessor.searchSimilarChunks(query, documentId, 10);

    const citations = relevantChunks.map(chunk => ({
      pageNumber: chunk.pageNumber,
      chunkId: chunk.id,
      content: chunk.content,
      similarity: chunk.similarity,
      snippet: ragService.extractSnippet(chunk.content)
    }));

    res.json({
      success: true,
      data: {
        citations,
        totalFound: citations.length
      }
    });

  } catch (error) {
    console.error('Citations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve citations',
      message: error.message
    });
  }
});

// Search within document
router.post('/search', async (req, res) => {
  try {
    const { query, documentId, limit = 10 } = req.body;

    if (!query || !documentId) {
      return res.status(400).json({ 
        error: 'Query and documentId are required' 
      });
    }

    // Verify document exists
    await pdfProcessor.getDocument(documentId);

    // Search for relevant chunks
    const results = await pdfProcessor.searchSimilarChunks(query, documentId, limit);

    res.json({
      success: true,
      data: {
        query,
        results: results.map(chunk => ({
          pageNumber: chunk.pageNumber,
          content: chunk.content,
          similarity: chunk.similarity,
          snippet: ragService.extractSnippet(chunk.content)
        })),
        totalResults: results.length
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search document',
      message: error.message
    });
  }
});

// Get conversation suggestions
router.get('/suggestions/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await pdfProcessor.getDocument(documentId);

    // Generate initial conversation starters
    const suggestions = await ragService.generateFollowUpQuestions(documentId, []);

    res.json({
      success: true,
      data: {
        suggestions,
        documentName: document.originalName
      }
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      message: error.message
    });
  }
});

// Get chat history for a document
router.get('/history/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { limit = 50 } = req.query;

    const history = await dataStore.getChatHistory(documentId, parseInt(limit));

    res.json({
      success: true,
      data: {
        history,
        count: history.length
      }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history',
      message: error.message
    });
  }
});

export default router;