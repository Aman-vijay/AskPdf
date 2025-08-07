import express from 'express';
import multer from 'multer';
import path from 'path';
import { validatePDF } from '../middleware/validation.js';
import { 
  uploadPdf, 
  getDocument, 
  getAllDocuments, 
  getDocumentContent, 
  getPageContent, 
  getPdfFile, 
  deleteDocument
} from '../controllers/pdfController.js';

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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Define routes
router.post('/upload', upload.single('pdf'), validatePDF, uploadPdf);
router.get('/documents/:documentId', getDocument);
router.get('/documents', getAllDocuments);
router.get('/documents/:documentId/content', getDocumentContent);
router.get('/documents/:documentId/page/:pageNumber', getPageContent);
router.get('/documents/:documentId/file', getPdfFile);
router.delete('/documents/:documentId', deleteDocument);

export default router;