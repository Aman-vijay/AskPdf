import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Upload, X } from 'lucide-react';
import UploadArea from './components/UploadArea';
import DocumentViewer from './components/DocumentViewer';
import ChatInterface from './components/ChatInterface';
import DocumentList from './components/DocumentList';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'chat', 'documents'
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await apiService.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleDocumentUploaded = (document) => {
    setCurrentDocument(document);
    setCurrentView('chat');
    loadDocuments();
  };

  const handleDocumentSelect = (document) => {
    setCurrentDocument(document);
    setCurrentView('chat');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setCurrentDocument(null);
  };

  const handleViewDocuments = () => {
    setCurrentView('documents');
    loadDocuments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">PDF Chat</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'upload'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
              <button
                onClick={handleViewDocuments}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'documents'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Documents
              </button>
              {currentDocument && (
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'chat'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Chat
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <UploadArea onDocumentUploaded={handleDocumentUploaded} />
          </div>
        )}

        {currentView === 'documents' && (
          <DocumentList
            documents={documents}
            onDocumentSelect={handleDocumentSelect}
            onDocumentsChange={loadDocuments}
          />
        )}

        {currentView === 'chat' && currentDocument && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <DocumentViewer document={currentDocument} />
            </div>
            <div className="lg:col-span-2">
              <ChatInterface
                document={currentDocument}
                onBack={handleBackToUpload}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;