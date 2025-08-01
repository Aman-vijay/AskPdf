import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';  // For synchronous and stream operations
import {processPDF} from '../services/pdfProcessor.js';
import dataStore from '../services/dataStore.js';
import { validatePDF } from '../middleware/validation.js';

const router = express.Router();

// multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pdf-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});


router.post('/upload', upload.single('pdf'), validatePDF, async (req, res) => {
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
});

// Get document information
router.get('/documents/:documentId', async (req, res) => {
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
});

// Get all documents
router.get('/documents', async (req, res) => {
  try {
    const documents = await pdfProcessor.getAllDocuments();
    
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
});

router.get('/documents/:documentId/content', async (req, res) => {
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
});


router.get('/documents/:documentId/page/:pageNumber', async (req, res) => {
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
});


router.get('/documents/:documentId/file', async (req, res) => {
  try {
    const { documentId } = req.params;
   
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
});



export default router;