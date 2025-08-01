# PDF Chat Backend

A robust Node.js backend application that enables intelligent interaction with uploaded PDF documents using Google's Gemini AI. The system processes PDFs, converts them to searchable formats, implements vectorization for efficient retrieval, and provides a Retrieval-Augmented Generation (RAG) system for accurate, context-aware responses with proper citations.

## 🚀 Features

### PDF Processing
- **Large File Support**: Handle PDF files up to 50MB (configurable)
- **Text Extraction**: Extract and process text content from PDFs
- **Markdown Conversion**: Convert PDF content to structured markdown format
- **Page-based Organization**: Maintain page-level organization for accurate citations
- **Chunking Strategy**: Intelligent text chunking with overlap for better context preservation

### AI Integration
- **Gemini AI Integration**: Leverage Google's Gemini Pro model for response generation
- **Vector Embeddings**: Create embeddings for semantic search capabilities
- **RAG Implementation**: Retrieval-Augmented Generation for accurate, context-aware responses
- **Similarity Search**: Find relevant content chunks based on query similarity

### Citation System
- **Page-level Citations**: Accurate page references for all responses
- **Relevance Scoring**: Confidence scores for citation accuracy
- **Snippet Extraction**: Contextual snippets from cited content
- **Multiple Citation Support**: Handle multiple citations per response

### API Features
- **RESTful Design**: Clean, intuitive API endpoints
- **File Upload**: Secure PDF upload with validation
- **Chat Interface**: Interactive chat with uploaded documents
- **Search Functionality**: Direct search within document content
- **Document Management**: Full CRUD operations for documents

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdf-chat-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your settings:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Google Gemini API (REQUIRED)
   GEMINI_API_KEY=your_gemini_api_key_here

   # File Upload Configuration
   MAX_FILE_SIZE=50000000
   UPLOAD_DIR=uploads

   # Vector Database Configuration
   VECTOR_DIMENSION=768
   SIMILARITY_THRESHOLD=0.7

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Health Check
```http
GET /api/health
```

### PDF Management

#### Upload PDF
```http
POST /api/pdf/upload
Content-Type: multipart/form-data

Body: pdf file (form field: 'pdf')
```

**Response:**
```json
{
  "success": true,
  "message": "PDF uploaded and processed successfully",
  "data": {
    "documentId": "uuid",
    "filename": "document.pdf",
    "totalPages": 10,
    "chunksCount": 25,
    "summary": "Document summary...",
    "fileSize": 1024000
  }
}
```

#### Get Document Info
```http
GET /api/pdf/document/:documentId
```

#### Get All Documents
```http
GET /api/pdf/documents
```

#### Get Document Content
```http
GET /api/pdf/document/:documentId/content
```

#### Get Specific Page
```http
GET /api/pdf/document/:documentId/page/:pageNumber
```

#### Delete Document
```http
DELETE /api/pdf/document/:documentId
```

### Chat Interface

#### Query Document
```http
POST /api/chat/query
Content-Type: application/json

{
  "query": "What is the main topic of this document?",
  "documentId": "uuid",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What is the main topic of this document?",
    "answer": "The main topic of this document is...",
    "citations": [
      {
        "pageNumber": 1,
        "chunkId": "uuid",
        "relevanceScore": 0.85,
        "snippet": "Relevant text snippet...",
        "sourceIndex": 1
      }
    ],
    "confidence": 0.92,
    "relevantChunks": 3,
    "followUpQuestions": [
      "Can you explain more about...?",
      "What are the key findings?",
      "How does this relate to...?"
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Search Document
```http
POST /api/chat/search
Content-Type: application/json

{
  "query": "search term",
  "documentId": "uuid",
  "limit": 10
}
```

#### Get Conversation Suggestions
```http
GET /api/chat/suggestions/:documentId
```

## 🏗️ Architecture

### Core Components

1. **PDF Processor** (`src/services/pdfProcessor.js`)
   - Handles PDF parsing and text extraction
   - Converts content to markdown format
   - Creates searchable chunks with embeddings
   - Manages document storage and retrieval

2. **RAG Service** (`src/services/ragService.js`)
   - Implements Retrieval-Augmented Generation
   - Manages context preparation and response generation
   - Handles citation extraction and confidence scoring
   - Generates follow-up questions

3. **Gemini Service** (`src/config/gemini.js`)
   - Interfaces with Google Gemini AI
   - Handles response generation and embeddings
   - Manages similarity calculations

4. **API Routes**
   - `src/routes/pdfRoutes.js`: PDF upload and management
   - `src/routes/chatRoutes.js`: Chat and search functionality

### Data Flow

1. **PDF Upload**: User uploads PDF → File validation → Text extraction → Chunking → Vectorization → Storage
2. **Query Processing**: User query → Similarity search → Context retrieval → AI response generation → Citation extraction
3. **Response Delivery**: Formatted response with citations and follow-up questions

## 🔧 Configuration

### File Upload Limits
- Default: 50MB per file
- Configure via `MAX_FILE_SIZE` environment variable

### Vector Search
- Similarity threshold: 0.7 (configurable)
- Chunk size: 1000 characters with 200 character overlap
- Embedding dimension: 768

### Rate Limiting
- Default: 100 requests per 15 minutes
- Configure via environment variables

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Prevent abuse
- **File Validation**: PDF-only uploads with size limits
- **Input Sanitization**: Query validation and sanitization

## 🚀 Performance Optimizations

- **Chunking Strategy**: Optimal chunk sizes for better retrieval
- **Memory Management**: Efficient document storage
- **Caching**: In-memory document caching
- **Async Processing**: Non-blocking PDF processing

## 🧪 Testing

Run the health check endpoint to verify the service:
```bash
curl http://localhost:5000/api/health
```

## 📝 Development Notes

### Adding New Features
1. Create new service files in `src/services/`
2. Add corresponding routes in `src/routes/`
3. Update validation middleware as needed
4. Add proper error handling

### Database Integration
The current implementation uses in-memory storage. For production:
1. Replace `Map` storage with a proper database (MongoDB, PostgreSQL)
2. Implement proper vector database (Pinecone, Weaviate, Chroma)
3. Add data persistence and backup strategies

### Scaling Considerations
- Implement proper vector database for large-scale deployments
- Add Redis for caching and session management
- Consider microservices architecture for high-load scenarios
- Implement proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the API documentation above
2. Review error messages in server logs
3. Ensure all environment variables are properly set
4. Verify Gemini API key is valid and has sufficient quota

## 🔮 Future Enhancements

- [ ] Support for multiple file formats (DOCX, TXT, etc.)
- [ ] Advanced citation formatting
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Advanced analytics and usage tracking
- [ ] Integration with more AI models
- [ ] Batch processing capabilities
- [ ] Advanced search filters and sorting