import express from 'express';
import { validateChatRequest } from '../middleware/validation.js';
import { 
  chatQuery, 
  getCitations, 
  searchDocument, 
  getSuggestions 
} from '../controllers/chatController.js';

const router = express.Router();

// Chat routes
router.post('/query', validateChatRequest, chatQuery);
router.post('/citations', getCitations);
router.post('/search', searchDocument);
router.get('/suggestions/:documentId', getSuggestions);

export default router;