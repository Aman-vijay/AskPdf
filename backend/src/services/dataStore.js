import fs from 'fs/promises';
import path from 'path';

class DataStore {
  constructor() {
    this.documents = new Map();
    this.chunks = new Map();
    this.chatHistory = new Map();
    this.dataFile = 'data/store.json';
    this.loadData();
  }

  async loadData() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir('data', { recursive: true });
      
      // Try to load existing data
      const data = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(data);
      
      this.documents = new Map(parsed.documents || []);
      this.chunks = new Map(parsed.chunks || []);
      this.chatHistory = new Map(parsed.chatHistory || []);
      
      console.log('📂 Data loaded from file');
    } catch (error) {
      console.log('📂 Starting with empty data store');
    }
  }

  async saveData() {
    try {
      const data = {
        documents: Array.from(this.documents.entries()),
        chunks: Array.from(this.chunks.entries()),
        chatHistory: Array.from(this.chatHistory.entries())
      };
      
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Document operations
  async createDocument(documentData) {
    const document = {
      ...documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.documents.set(documentData.id, document);
    await this.saveData();
    return document;
  }

  async getDocument(documentId) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }

  async getAllDocuments() {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async updateDocument(documentId, updates) {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    const updated = {
      ...document,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.documents.set(documentId, updated);
    await this.saveData();
    return updated;
  }

  async deleteDocument(documentId) {
    // Delete document
    this.documents.delete(documentId);
    
    // Delete related chunks
    const chunkKeys = Array.from(this.chunks.keys()).filter(key => 
      this.chunks.get(key).documentId === documentId
    );
    chunkKeys.forEach(key => this.chunks.delete(key));
    
    // Delete related chat history
    const chatKeys = Array.from(this.chatHistory.keys()).filter(key => 
      this.chatHistory.get(key).documentId === documentId
    );
    chatKeys.forEach(key => this.chatHistory.delete(key));
    
    await this.saveData();
    return true;
  }

  // Chunk operations
  async saveDocumentChunks(documentId, chunks) {
    chunks.forEach((chunk, index) => {
      const chunkData = {
        id: `${documentId}_chunk_${index}`,
        documentId,
        chunkIndex: index,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        embedding: chunk.embedding,
        metadata: chunk.metadata || {},
        createdAt: new Date().toISOString()
      };
      
      this.chunks.set(chunkData.id, chunkData);
    });
    
    await this.saveData();
    return chunks.length;
  }

  async getDocumentChunks(documentId) {
    const chunks = Array.from(this.chunks.values())
      .filter(chunk => chunk.documentId === documentId)
      .sort((a, b) => a.chunkIndex - b.chunkIndex);
    
    return chunks;
  }

  async searchSimilarChunks(queryEmbedding, documentId = null, limit = 10, threshold = 0.1) {
    let chunks = Array.from(this.chunks.values());
    
    if (documentId) {
      chunks = chunks.filter(chunk => chunk.documentId === documentId);
    }
    
    // Calculate similarity scores
    const results = chunks
      .filter(chunk => chunk.embedding)
      .map(chunk => {
        const similarity = this.calculateSimilarity(queryEmbedding, chunk.embedding);
        return { ...chunk, similarity };
      })
      .filter(chunk => chunk.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  }

  calculateSimilarity(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Chat history operations
  async saveChatMessage(documentId, userMessage, aiResponse, citations = []) {
    const chatId = `${documentId}_${Date.now()}`;
    const chatMessage = {
      id: chatId,
      documentId,
      userMessage,
      aiResponse,
      citations,
      createdAt: new Date().toISOString()
    };
    
    this.chatHistory.set(chatId, chatMessage);
    await this.saveData();
    return chatMessage;
  }

  async getChatHistory(documentId, limit = 50) {
    const history = Array.from(this.chatHistory.values())
      .filter(chat => chat.documentId === documentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-limit);
    
    return history;
  }

  // Statistics
  async getDocumentStats(documentId) {
    const chunks = await this.getDocumentChunks(documentId);
    const chatMessages = await this.getChatHistory(documentId);
    const document = await this.getDocument(documentId);
    
    return {
      totalChunks: chunks.length,
      totalChatMessages: chatMessages.length,
      processingStatus: document.processingStatus,
      pageCount: document.pageCount
    };
  }
}

export default new DataStore();