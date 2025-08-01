import React, { useState } from 'react';
import { FileText, Calendar, HardDrive, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const DocumentList = ({ documents, onDocumentSelect, onDocumentsChange }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

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

  const handleDelete = async (documentId) => {
    setDeletingId(documentId);
    try {
      await apiService.deleteDocument(documentId);
      onDocumentsChange();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (document) => {
    setShowDeleteModal(document);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No documents uploaded yet
        </h3>
        <p className="text-gray-600">
          Upload your first PDF to start chatting with documents.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Documents</h2>
          <p className="text-gray-600">
            Manage and chat with your uploaded PDF documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div key={document.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {document.originalName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {document.pageCount} pages
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => confirmDelete(document)}
                  disabled={deletingId === document.id}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    document.processingStatus === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : document.processingStatus === 'processing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {document.processingStatus === 'completed' ? 'Ready' : 'Processing'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Size</span>
                  <span className="text-gray-900">{formatFileSize(document.fileSize)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploaded</span>
                  <span className="text-gray-900">{formatDate(document.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={() => onDocumentSelect(document)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Chat</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete Document</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{showDeleteModal.originalName}"? 
                This will also delete all associated chat history.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 btn-secondary"
                  disabled={deletingId === showDeleteModal.id}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.id)}
                  disabled={deletingId === showDeleteModal.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingId === showDeleteModal.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentList;