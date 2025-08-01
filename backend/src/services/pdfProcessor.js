import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('../utils/pdf-parse-wrapper.cjs');
import MarkdownIt from 'markdown-it';
import { v4 as uuidv4 } from 'uuid';
import geminiService from '../config/gemini.js';
import llamaParseService from '../config/llamaparse.js';
import dataStore from './dataStore.js';
class PDFProcessor {
  constructor() {
    this.md = new MarkdownIt();
    this.processedDocuments = new Map();
  }

  async processPDF(filePath, originalName) {
    try {
      console.log(`📄 Processing PDF: ${originalName}`);
      
      // Create document record first
      const documentId = uuidv4();
      const fileStats = await fs.stat(filePath);
      
      const document = await dataStore.createDocument({
        id: documentId,
        filename: path.basename(filePath),
        originalName,
        fileSize: fileStats.size,
        mimeType: 'application/pdf',
        storagePath: filePath,
        processingStatus: 'processing'
      });

      // Read and parse PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      // Extract text and metadata
      const { text, numpages, info } = pdfData;
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      // Split text into pages (approximate)
      const pages = this.splitIntoPages(text, numpages);
      
      // Convert to markdown format
      const markdownContent = this.convertToMarkdown(text, info);
      
      // Create document chunks for vectorization
      const chunks = this.createChunks(pages);
      
      // Generate embeddings for each chunk
      const vectorizedChunks = await this.vectorizeChunks(chunks);
      
      // Save chunks to database
      await dataStore.saveDocumentChunks(documentId, vectorizedChunks);
      
      // Update document status
      await dataStore.updateDocument(documentId, {
        processingStatus: 'completed',
        pageCount: numpages,
      });
      
      console.log(`✅ PDF processed successfully: ${originalName} (${numpages} pages)`);
      
      return {
        documentId,
        totalPages: numpages,
        chunksCount: vectorizedChunks.length,
        summary: this.generateSummary(text)
      };
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  splitIntoPages(text, totalPages) {
    // Simple page splitting based on text length
    const avgCharsPerPage = Math.ceil(text.length / totalPages);
    const pages = [];
    
    for (let i = 0; i < totalPages; i++) {
      const start = i * avgCharsPerPage;
      const end = Math.min((i + 1) * avgCharsPerPage, text.length);
      pages.push({
        pageNumber: i + 1,
        content: text.slice(start, end).trim()
      });
    }
    
    return pages;
  }

  convertToMarkdown(text, metadata) {
    let markdown = '';
    
    // Add metadata header
    if (metadata.Title) {
      markdown += `# ${metadata.Title}\n\n`;
    }
    
    if (metadata.Author) {
      markdown += `**Author:** ${metadata.Author}\n\n`;
    }
    
    if (metadata.Subject) {
      markdown += `**Subject:** ${metadata.Subject}\n\n`;
    }
    
    // Process text content
    const paragraphs = text.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed.length > 0) {
        // Simple heuristics for markdown formatting
        if (this.isHeading(trimmed)) {
          markdown += `## ${trimmed}\n\n`;
        } else if (this.isList(trimmed)) {
          const listItems = trimmed.split('\n');
          listItems.forEach(item => {
            if (item.trim()) {
              markdown += `- ${item.trim()}\n`;
            }
          });
          markdown += '\n';
        } else {
          markdown += `${trimmed}\n\n`;
        }
      }
    });
    
    return markdown;
  }

  isHeading(text) {
    // Simple heading detection
    return text.length < 100 && 
           (text.match(/^[A-Z][^.!?]*$/) || 
            text.match(/^\d+\.?\s+[A-Z]/));
  }

  isList(text) {
    // Simple list detection
    return text.includes('\n') && 
           text.split('\n').some(line => 
             line.trim().match(/^[-•*]\s+/) || 
             line.trim().match(/^\d+\.\s+/)
           );
  }

  createChunks(pages) {
    const chunks = [];
    const chunkSize = 1000; // characters
    const overlap = 200; // character overlap between chunks
    
    pages.forEach(page => {
      const content = page.content;
      
      if (content.length <= chunkSize) {
        chunks.push({
          id: uuidv4(),
          content,
          pageNumber: page.pageNumber,
          startChar: 0,
          endChar: content.length
        });
      } else {
        // Split large pages into smaller chunks
        for (let i = 0; i < content.length; i += chunkSize - overlap) {
          const end = Math.min(i + chunkSize, content.length);
          const chunkContent = content.slice(i, end);
          
          chunks.push({
            id: uuidv4(),
            content: chunkContent,
            pageNumber: page.pageNumber,
            startChar: i,
            endChar: end
          });
          
          if (end >= content.length) break;
        }
      }
    });
    
    return chunks;
  }

  async vectorizeChunks(chunks) {
    const vectorizedChunks = [];
    
    for (const chunk of chunks) {
      try {
        const embedding = await geminiService.generateEmbedding(chunk.content);
        vectorizedChunks.push({
          ...chunk,
          embedding
        });
      } catch (error) {
        console.error(`Error vectorizing chunk ${chunk.id}:`, error);
        // Continue with other chunks
      }
    }
    
    return vectorizedChunks;
  }

  generateSummary(text) {
    // Simple extractive summary
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ');
    return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  }

  async getDocument(documentId) {
    return await dataStore.getDocument(documentId);
  }

  async getAllDocuments() {
    return await dataStore.getAllDocuments();
  }

  async searchSimilarChunks(query, documentId, limit = 5) {
    const queryEmbedding = await geminiService.generateEmbedding(query);
    
    return await dataStore.searchSimilarChunks(
      queryEmbedding, 
      documentId, 
      limit, 
      parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.1
    );
  }
}

export default new PDFProcessor();