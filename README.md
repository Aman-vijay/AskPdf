# AskPDF - Google NotebookLM Clone

A comprehensive web application that enables users to upload and interact with PDF documents through an intelligent chat interface. Built with React (Next.js) frontend and Node.js/Express backend, featuring advanced AI-powered document analysis and retrieval-augmented generation (RAG) capabilities.

## 🎯 Assignment Overview

This project is a take-home assignment to build a Google NotebookLM clone that allows users to:
- Upload large PDF files with built-in viewing capabilities
- Interact with documents through an intelligent chat interface
- Receive efficient responses with minimal token usage
- Navigate documents through clickable citations

## ✨ Features

### Core Functionality
- **📄 PDF Upload & Viewing**: Support for large PDF files (up to 50MB) with integrated PDF viewer
- **💬 Intelligent Chat Interface**: AI-powered chat system for document interaction
- **🔗 Citation & Navigation**: Clickable citations that reference specific pages
- **🔍 Advanced Search**: Semantic search within document content
- **📱 Responsive Design**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS

### AI & Processing
- **🤖 Google Gemini Integration**: Leverages Gemini Pro for response generation
- **🧠 RAG Implementation**: Retrieval-Augmented Generation for accurate, context-aware responses
- **📊 Vector Embeddings**: Semantic search capabilities with similarity scoring
- **📝 Smart Chunking**: Intelligent text chunking with overlap for better context preservation
- **🎯 Confidence Scoring**: Response confidence and relevance metrics

### Performance Optimizations
- **⚡ Efficient Token Usage**: Optimized AI queries to minimize token consumption
- **🚀 Fast Load Times**: Optimized for handling large PDFs efficiently
- **💾 Memory Management**: Efficient document storage and retrieval
- **🔄 Async Processing**: Non-blocking PDF processing

## 🏗️ Architecture

### Frontend (Next.js + React)
```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── DocumentManager.tsx    # Document management
│   │   ├── InitialInterface.tsx   # Main chat interface
│   │   ├── Main.tsx              # Main application wrapper
│   │   ├── common/               # Shared components
│   │   └── home/                 # Home page components
│   ├── services/
│   │   └── apiService.ts    # Backend API communication
│   ├── ui/                  # UI components
│   └── utils/               # Utility functions
├── package.json
└── tailwind.config.ts       # Tailwind CSS configuration
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── config/
│   │   └── gemini.js        # Google Gemini AI configuration
│   ├── middleware/
│   │   ├── errorHandler.js  # Error handling middleware
│   │   └── validation.js    # Request validation
│   ├── routes/
│   │   ├── chatRoutes.js    # Chat and search endpoints
│   │   └── pdfRoutes.js     # PDF management endpoints
│   ├── services/
│   │   ├── pdfProcessor.js  # PDF processing and text extraction
│   │   └── ragService.js    # RAG implementation
│   └── utils/
│       └── fileUtils.js     # File handling utilities
├── uploads/                 # PDF file storage
├── package.json
└── server.js               # Express server entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AskPdf
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   ```

3. **Configure Backend Environment**
   Edit `backend/.env`:
   ```env
   # Server Configuration
   PORT=5000
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

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment file
   echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
   ```

5. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to `backend/.env`

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start Frontend Application**
   ```bash
   cd frontend
   npm run dev
   # Application runs on http://localhost:3000
   ```

3. **Access Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

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

#### Get Document Info
```http
GET /api/pdf/document/:documentId
```

#### Get All Documents
```http
GET /api/pdf/documents
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

**Response includes:**
- AI-generated answer
- Page-specific citations
- Confidence scores
- Follow-up question suggestions

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

## 🎯 Usage Flow

1. **Upload PDF**: Users upload a PDF document through the interface
2. **Processing**: Backend extracts text, creates chunks, and generates embeddings
3. **AI Suggestions**: System generates relevant questions based on document content
4. **Interactive Chat**: Users ask questions about the document
5. **Intelligent Responses**: AI provides answers with citations and page references
6. **Citation Navigation**: Users click citations to navigate to specific pages

## 🛡️ Security Features

- **Helmet.js**: Security headers and CORS protection
- **Rate Limiting**: Prevent API abuse (100 requests per 15 minutes)
- **File Validation**: PDF-only uploads with size limits
- **Input Sanitization**: Query validation and sanitization
- **Error Handling**: Comprehensive error management

## 🔧 Configuration

### File Upload Limits
- Default: 50MB per file
- Configure via `MAX_FILE_SIZE` environment variable

### Vector Search
- Similarity threshold: 0.7 (configurable)
- Chunk size: 1000 characters with 200 character overlap
- Embedding dimension: 768

### Frontend Configuration
- API URL: Configurable via `NEXT_PUBLIC_API_URL`
- Responsive design with Tailwind CSS
- Component-based architecture for maintainability

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## 🚀 Performance Optimizations

### Token Efficiency
- **Smart Context Selection**: Only relevant chunks are sent to AI
- **Conversation History**: Maintains context without redundant queries
- **Confidence Scoring**: Reduces unnecessary follow-up queries

### Memory & Speed
- **Chunking Strategy**: Optimal chunk sizes for better retrieval
- **Async Processing**: Non-blocking PDF processing
- **Caching**: In-memory document caching for faster access
- **Lazy Loading**: Components load as needed

## 🔮 Implementation Highlights

### AI Integration
- **Google Gemini Pro**: Advanced language model for response generation
- **Vector Embeddings**: Semantic understanding of document content
- **RAG System**: Combines retrieval and generation for accurate responses

### PDF Processing
- **Text Extraction**: Robust PDF parsing with page preservation
- **Markdown Conversion**: Structured content for better processing
- **Citation Mapping**: Maintains document structure for accurate citations

### Frontend Architecture
- **Next.js 14**: Modern React framework with app directory
- **Component-based Design**: Modular, reusable components
- **TypeScript**: Type safety throughout the application
- **Tailwind CSS**: Utility-first styling for rapid development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Adding New Features
1. Backend: Add services in `src/services/` and routes in `src/routes/`
2. Frontend: Create components in `src/components/` and update API service
3. Update validation middleware and error handling as needed

### Production Deployment
- Replace in-memory storage with proper database (MongoDB, PostgreSQL)
- Implement vector database (Pinecone, Weaviate, Chroma)
- Add Redis for caching and session management
- Configure proper logging and monitoring

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the API documentation above
2. Review error messages in server logs
3. Ensure all environment variables are properly set
4. Verify Gemini API key is valid and has sufficient quota

## 🔮 Future Enhancements

- [ ] Support for multiple file formats (DOCX, TXT, EPUB)
- [ ] Advanced citation formatting and export
- [ ] Multi-language document support
- [ ] Add database 
- [ ] Real-time collaboration features
- [ ] Advanced analytics and usage tracking
- [ ] Integration with additional AI models
- [ ] Batch processing capabilities
- [ ] Advanced search filters and document organization
- [ ] Mobile app development
- [ ] Enterprise features and SSO integration
