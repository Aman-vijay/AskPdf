import ragService from '../services/ragService.js';
import { processPDF } from '../services/pdfProcessor.js';
import dataStore from '../services/dataStore.js';

export const chatQuery = async (req, res) => {
    try {
        const { query, documentId, conversationHistory = [] } = req.body;

        console.log(`💬 Chat query received for document: ${documentId}`);

        // Get document info
        const document = await dataStore.getDocument(documentId);

        const response = await ragService.generateResponse(query, documentId);

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
};

export const getCitations = async (req, res) => {
    try {
        const { query, documentId } = req.body;

        if (!query || !documentId) {
            return res.status(400).json({ 
                error: 'Query and documentId are required' 
            });
        }

        // Generate embedding for the query
        const queryEmbedding = await ragService.generateEmbedding(query);
        
        // Search for similar chunks
        const relevantChunks = await dataStore.searchSimilarChunks(queryEmbedding, documentId, 10);

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
};

export const searchDocument = async (req, res) => {
    try {
        const { query, documentId, limit = 10 } = req.body;

        if (!query || !documentId) {
            return res.status(400).json({ 
                error: 'Query and documentId are required' 
            });
        }

        // Verify document exists
        await dataStore.getDocument(documentId);

        // Generate embedding for the query
        const queryEmbedding = await ragService.generateEmbedding(query);
        
        // Search for similar chunks
        const results = await dataStore.searchSimilarChunks(queryEmbedding, documentId, limit);

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
};

export const getSuggestions = async (req, res) => {
    try {
        const { documentId } = req.params;

        // Get document info
        const document = await dataStore.getDocument(documentId);

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
};
