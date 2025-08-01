import React, { useState } from 'react';
import { FileText, Calendar, HardDrive, MessageSquare, X } from 'lucide-react';

const DocumentViewer = ({ document }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card p-6 h-fit sticky top-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-48">
              {document.originalName}
            </h3>
            <p className="text-sm text-gray-500">
              {document.pageCount} pages
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            'bg-green-100 text-green-700'
          }`}>
            Ready
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">File Size</span>
          <span className="text-gray-900">{formatFileSize(document.fileSize)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Uploaded</span>
          <span className="text-gray-900">{formatDate(document.createdAt)}</span>
        </div>

      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Document Ready!</h4>
        <p className="text-sm text-gray-600 mb-4">
          You can now ask questions about your document. For example:
        </p>
        
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              "What is the main topic of this document?"
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              "Can you summarize the key points?"
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              "What are the conclusions or recommendations?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;