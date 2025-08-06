import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini models
const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });

  return { model, embeddingModel };
};

const { model, embeddingModel } = initializeGemini();

// Generate answer from context using Gemini
const generateResponse = async (prompt, context = '') => {
  try {
    const systemPrompt = `
You are an AI assistant specialized in information retrieval from documents. Your task is to:

1. Extract precise information from the provided document context
2. Answer the user's question directly using ONLY the information in the context
3. If the exact information isn't in the context, say "This information is not found in the document"

IMPORTANT GUIDELINES:
- Be precise and factual - only use information explicitly stated in the context
- Use direct quotes when appropriate with page/section references
- Format responses clearly with bullet points or numbered lists
- Maintain the original terminology used in the document
- For numerical data, provide exact figures as shown in the document
- Do not make assumptions beyond what is explicitly stated
- Do not generalize or provide information not in the context
- Do not include personal opinions or external knowledge

If analyzing a resume, report specific credentials, dates, and experiences exactly as written.
If analyzing a research paper, cite specific findings, methodologies, and conclusions with precision.
If analyzing an assignment, extract the exact requirements, deadlines, and evaluation criteria.
`.trim();

    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\n${systemPrompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('❌ Error generating response:', error);
    throw new Error('Failed to generate AI response');
  }
};

// Generate embedding using Gemini embedding model


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateEmbedding = async (text, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
     
      await delay(50); 
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        taskType: 'retrieval_document', 
      });

      return result.embedding.values;
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ Failed embedding after ${retries} attempts:`, error.message);
        throw new Error('Failed to generate embedding');
      } else {
        console.warn(`⚠️ Embedding attempt ${attempt} failed. Retrying...`);
        await delay(200 * attempt); // Exponential backoff
      }
    }
  }
};

// const generateEmbedding = async (text) => {
//   try {
//     const result = await embeddingModel.embedContent({
//       content: { parts: [{ text }] },
//     });
//     return result.embedding.values;
//   } catch (error) {
//     console.error('❌ Error generating embedding:', error);
//     throw new Error('Failed to generate embedding');
//   }
// };

export default {
  generateResponse,
  generateEmbedding
};
