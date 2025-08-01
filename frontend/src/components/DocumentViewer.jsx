import React, { useState } from 'react';
import { FileText, ExternalLink, Maximize, Minimize, Info } from 'lucide-react';
import { apiService } from '../services/api';

const DocumentViewer = ({ document }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const pdfUrl = document ? `${apiService.getBaseUrl()}/pdf/documents/${document.documentId}/file` : '';

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleFullscreen = () => setFullscreen(!fullscreen);
  const toggleDetails = () => setShowDetails(!showDetails);

  return (
    <div className={`card ${fullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'h-[calc(100vh-12rem)] sticky top-8'}`}>
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-48">
              {document.originalName}
            </h3>
            <p className="text-sm text-gray-500">
              {document.pageCount} pages • {formatFileSize(document.fileSize)}
            </p>
            {showDetails && (
              <p className="text-xs text-gray-400 mt-1">
                Uploaded: {new Date(document.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleDetails}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Toggle file details"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Open PDF in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {document && (
          <iframe
            src={pdfUrl}
            title={document.originalName}
            className="w-full h-full"
            style={{ height: fullscreen ? 'calc(100vh - 73px)' : 'calc(100vh - 16rem)' }}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
