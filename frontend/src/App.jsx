import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Upload } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import UploadArea from './components/UploadArea';
import DocumentViewer from './components/DocumentViewer';
import ChatInterface from './components/ChatInterface';
import ErrorPage from './components/ErrorPage';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'chat', 'error'
  const [currentDocument, setCurrentDocument] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        setIsLoading(true);
        await apiService.healthCheck();
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Health check failed:', err);
        setIsLoading(false);
        setError({
          title: 'Server Connection Failed',
          message: 'Unable to connect to the server. Please check your internet connection or try again later.',
          code: 503
        });
      }
    };
    
    checkApiHealth();
  }, []);

  const handleDocumentUploaded = (document) => {
    setCurrentDocument(document);
    setCurrentView('chat');
  };

  const handleBackToUpload = () => {
    setCurrentView('upload');
    setCurrentDocument(null);
  };
  
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    apiService.healthCheck()
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setIsLoading(false);
        setError({
          title: 'Server Connection Failed',
          message: 'Unable to connect to the server. Please check your internet connection or try again later.',
          code: 503
        });
      });
  };

  // Render error page if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">PDF Chat</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorPage
            title={error.title}
            message={error.message}
            code={error.code}
            onBack={handleRetry}
          />
        </main>
        
        <Toaster position="top-right" />
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin w-full h-full border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

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

        {currentView === 'chat' && currentDocument && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ChatInterface
                document={currentDocument}
                onBack={handleBackToUpload}
              />
            </div>
            <div className="lg:col-span-2">
              <DocumentViewer document={currentDocument} />
            </div>
          </div>
        )}
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}

export default App;