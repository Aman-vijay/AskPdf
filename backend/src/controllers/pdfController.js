import fs from 'fs/promises';
import fsSync from 'fs';  
import { processPDF } from '../services/pdfProcessor.js';
import dataStore from '../services/dataStore.js';

export const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`📤 Received PDF upload: ${req.file.originalname}`);

   
    const result = await processPDF(req.file.path, req.file.originalname);

    res.json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      data: {
        documentId: result.documentId,
        filename: req.file.originalname,
        totalPages: result.totalPages,
        chunksCount: result.chunksCount,
        summary: result.summary,
        fileSize: req.file.size
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Failed to process PDF',
      message: error.message
    });
  }
};

// Get document information
export const getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await dataStore.getDocument(documentId);

    res.json({
      success: true,
      data: {
        id: document.id,
        originalName: document.originalName,
        pageCount: document.pageCount,
        processingStatus: document.processingStatus,
        createdAt: document.createdAt,
        fileSize: document.fileSize,
      }
    });

  } catch (error) {
    console.error('Error retrieving document:', error);
    res.status(500).json({
      error: 'Failed to retrieve document',
      message: error.message
    });
  }
};

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await processPDF.getAllDocuments();
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });

  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({
      error: 'Failed to retrieve documents',
      message: error.message
    });
  }
};

// Get document content (markdown)
export const getDocumentContent = async (req, res) => {
  try {
    const { documentId } = req.params;
    const chunks = await dataStore.getDocumentChunks(documentId);

    res.json({
      success: true,
      data: {
        chunks: chunks.map(chunk => ({
          id: chunk.id,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          content: chunk.content,
          contentLength: chunk.content.length
        }))
      }
    });

  } catch (error) {
    console.error('Error retrieving document content:', error);
    res.status(500).json({
      error: 'Failed to retrieve document content',
      message: error.message
    });
  }
};

// Get specific page content
export const getPageContent = async (req, res) => {
  try {
    const { documentId, pageNumber } = req.params;
    const chunks = await dataStore.getDocumentChunks(documentId);
    const pageChunks = chunks.filter(chunk => chunk.pageNumber === parseInt(pageNumber));
    
    if (pageChunks.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      success: true,
      data: {
        pageNumber: parseInt(pageNumber),
        chunks: pageChunks
      }
    });

  } catch (error) {
    console.error('Error retrieving page:', error);
    res.status(500).json({
      error: 'Failed to retrieve page',
      message: error.message
    });
  }
};

// Get PDF file
export const getPdfFile = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Get document to find file path
    const document = await dataStore.getDocument(documentId);
  
    try {
      await fs.access(document.storagePath);
    } catch (error) {
      return res.status(404).json({ error: 'PDF file not found' });
    }
    
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);

    const fileStream = fsSync.createReadStream(document.storagePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error retrieving PDF file:', error);
    res.status(500).json({
      error: 'Failed to retrieve PDF file',
      message: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Get document to find file path
    const document = await dataStore.getDocument(documentId);
    
    // Delete from data store
    await dataStore.deleteDocument(documentId);
    
    // Delete physical file
    try {
      await fs.unlink(document.storagePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: error.message
    });
  }
};
