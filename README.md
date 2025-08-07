# AskPDF 

A  web application that allows users to upload and interact with PDF documents through an intelligent chat interface. Designed to provide a seamless experience for reading, understanding, and querying documents using AI.

Built using React Js, Node.js/Express, and Google Gemini API, the app implements a Retrieval-Augmented Generation (RAG) pipeline for highly relevant and contextual answers.

##  Overview

This project is a similar to Google NotebookLM clone that allows users to:
- Upload large PDF files (up to 10MB)
- Interact with documents through an intelligent chat interface
- Receive efficient responses with minimal token usage
- Navigate documents through clickable citations
- Uses LlamaParse for advanced PDF parsing; falls back to pdf-parse for reliability. Gemini handles both response generation and embeddings.

## Features

Document Management

 - Upload large PDF files (up to 10MB)

 - View documents directly in-browser

 - See upload progress and file metadata

 - Delete documents when no longer needed

 AI-Powered Chat

 - Ask questions about your PDFs

- Answers include clickable citations pointing to exact page numbers

- Suggested follow-up questions for deeper exploration

 Smart Search

- Embedding-based semantic search for locating relevant sections


 Optimized Processing

- Fast PDF parsing with LlamaParse or fallback to pdf-parse

- Smart text chunking with overlaps for context preservation

- Vector embedding via Google Gemini Embedding API

- Asynchronous and memory-efficient architecture




## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key
- LLAMA CLOUD API KEY

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aman-vijay/AskPdf.git
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
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=10485760
   SIMILARITY_THRESHOLD=0.1

   # Vector Database Configuration
   VECTOR_DIMENSION=768
   SIMILARITY_THRESHOLD=0.7

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Frontend Url 
   FRONTEND_URL= Your Frontend Url
   FRONTEND_URL_PROD= Production Frontend Url 
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment file
   echo "VITE_PUBLIC_API_URL=http://localhost:5000" > .env.local
   ```

5. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to `backend/.env`

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5000
   ```

2. **Start Frontend Application**
   ```bash
   cd frontend
   npm run dev
   # Application runs on http://localhost:5173
   ```

3. **Access Application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

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
### Chat Queries

```http
POST /api/chat/query
Content-Type: application/json

{
  "query": "What is the main topic of this document?",
  "documentId": "uuid",
  "conversationHistory": []
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
### Citation 

```http
POST /api/chat/citations
Content-Type: application/json


```

#### Get Conversation Suggestions
```http
GET /api/chat/suggestions/:documentId
```


##  Usage Flow

1. **Upload PDF**: Users upload a PDF document through the interface
2. **Processing**: Backend extracts text, creates chunks, and generates embeddings
3. **AI Suggestions**: System generates relevant questions based on document content
4. **Interactive Chat**: Users ask questions about the document
5. **Intelligent Responses**: AI provides answers with citations and page references
6. **Citation Navigation**: Users click citations to navigate to specific pages

##  Security Features

- **Helmet.js**: Security headers and CORS protection
- **Rate Limiting**: Prevent API abuse (100 requests per 15 minutes)
- **File Validation**: PDF-only uploads with size limits
- **Input Sanitization**: Query validation and sanitization
- **Error Handling**: Comprehensive error management

##  Configuration

### File Upload Limits
- Default: 10MB per file
- Configure via `MAX_FILE_SIZE` environment variable



##  Performance Optimizations

- **Chunking Strategy**: Optimal chunk sizes for better retrieval
- **Memory Management**: Efficient document storage
- **Caching**: In-memory document caching
- **Async Processing**: Non-blocking PDF processing

### Vector Search
- Similarity threshold: 0.7 (configurable)
- Chunk size: 1000 characters with 200 character overlap
- Embedding dimension: 768

### Frontend Configuration
- API URL: Configurable via `VITE_PUBLIC_API_URL`
- Responsive design with Tailwind CSS
- Component-based architecture for maintainability



##  Performance Optimizations

### Token Efficiency
- **Smart Context Selection**: Only relevant chunks are sent to AI

### Memory & Speed
- **Chunking Strategy**: Optimal chunk sizes for better retrieval
- **Async Processing**: Non-blocking PDF processing
- **Caching**: In-memory document caching for faster access
- **Lazy Loading**: Components load as needed



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
