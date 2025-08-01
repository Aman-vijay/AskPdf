import geminiService from '../config/gemini.js';
import {processPDF} from './pdfProcessor.js';
import dataStore from './dataStore.js';

class RAGService {
  async generateResponse(query, documentId) {
    try {
      console.log(`🔍 Processing query: "${query}" for document: ${documentId}`);
      
      // Retrieve relevant chunks from the document
      const relevantChunks = await processPDF.searchSimilarChunks(query, documentId, 5);
      
      if (relevantChunks.length === 0) {
        return {
          answer: "I couldn't find relevant information in the document to answer your question. Please try rephrasing your query or ask about different topics covered in the document.",
          citations: [],
          confidence: 0
        };
      }

      // Prepare context from relevant chunks
      const context = this.prepareContext(relevantChunks);
      
      // Generate response using Gemini
      const answer = await geminiService.generateResponse(query, context);
      
      // Extract citations
      const citations = this.extractCitations(relevantChunks, answer);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(relevantChunks);
      
      console.log(`✅ Generated response with ${citations.length} citations`);
      
      return {
        answer,
        citations,
        confidence,
        relevantChunks: relevantChunks.length
      };
      
    } catch (error) {
      console.error('Error in RAG service:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  prepareContext(chunks) {
    let context = '';
    
    chunks.forEach((chunk, index) => {
      context += `[Source ${index + 1} - Page ${chunk.pageNumber}]:\n`;
      context += `${chunk.content}\n\n`;
    });
    
    return context;
  }

  extractCitations(chunks, answer) {
    const citations = [];
    const usedPages = new Set();
    
    chunks.forEach((chunk, index) => {
      // Simple citation extraction based on content similarity
      const chunkWords = chunk.content.toLowerCase().split(/\W+/);
      const answerWords = answer.toLowerCase().split(/\W+/);
      
      // Check if significant portion of chunk content appears in answer
      const commonWords = chunkWords.filter(word => 
        word.length > 3 && answerWords.includes(word)
      );
      
      const relevanceScore = commonWords.length / Math.max(chunkWords.length, 1);
      
      if (relevanceScore > 0.1 && !usedPages.has(chunk.pageNumber)) {
        citations.push({
          pageNumber: chunk.pageNumber,
          chunkId: chunk.id,
          relevanceScore,
          snippet: this.extractSnippet(chunk.content),
          sourceIndex: index + 1
        });
        usedPages.add(chunk.pageNumber);
      }
    });
    
    // Sort citations by page number
    return citations.sort((a, b) => a.pageNumber - b.pageNumber);
  }

  extractSnippet(content, maxLength = 150) {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Find a good breaking point near the max length
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  calculateConfidence(chunks) {
    if (chunks.length === 0) return 0;
    
    // Calculate average similarity score
    const avgSimilarity = chunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / chunks.length;
    
    // Normalize to 0-1 scale
    return Math.min(avgSimilarity * 2, 1);
  }

  async generateFollowUpQuestions(documentId, conversationHistory = []) {
    try {
      const document = await processPDF.getDocument(documentId);

      // Get some sample chunks for context
      const chunks = await dataStore.getDocumentChunks(documentId);
      const documentSummary = chunks.slice(0, 3).map(chunk => chunk.content).join('\n\n').substring(0, 1000);
      
      const prompt = `Based on this document summary and conversation history, suggest 3 relevant follow-up questions:

Document Summary:
${documentSummary}

Conversation History:
${conversationHistory.map(msg => `Q: ${msg.question}\nA: ${msg.answer}`).join('\n\n')}

Please provide 3 concise, specific questions that would help explore the document further:`;

      const response = await geminiService.generateResponse(prompt);
      
      // Parse the response to extract questions
      const questions = this.parseFollowUpQuestions(response);
      
      return questions;
      
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  parseFollowUpQuestions(response) {
    // Simple parsing to extract questions
    const lines = response.split('\n').filter(line => line.trim());
    const questions = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./) || trimmed.includes('?')) {
        const question = trimmed.replace(/^\d+\.\s*/, '').trim();
        if (question.length > 10 && questions.length < 3) {
          questions.push(question);
        }
      }
    });
    
    return questions.slice(0, 3);
  }
}

export default new RAGService();