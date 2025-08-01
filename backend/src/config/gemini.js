import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the API client
const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
  
  return { genAI, model, embeddingModel };
};

const { genAI, model, embeddingModel } = initializeGemini();

const generateResponse = async (prompt, context = '') => {
  try {
    const fullPrompt = context 
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a detailed answer based on the context provided. If you reference specific information, indicate which part of the context it comes from.`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate AI response');
  }
};

const createSimpleEmbedding = (text) => {
  // Simple TF-IDF like approach for demonstration
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Create a simple vector representation
  const vector = [];
  const commonWords = Object.keys(wordFreq).slice(0, 100);
  
  for (let i = 0; i < 768; i++) {
    const word = commonWords[i % commonWords.length];
    vector.push(wordFreq[word] || 0);
  }

  return vector;
};

const generateEmbedding = async (text) => {
  try {
    // For now, we'll use a simple text-based similarity approach
    // In production, you might want to use a dedicated embedding service
    return createSimpleEmbedding(text);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

const calculateSimilarity = (vector1, vector2) => {
  if (vector1.length !== vector2.length) return 0;
  
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
};

export default {
  generateResponse,
  generateEmbedding,
  calculateSimilarity
};