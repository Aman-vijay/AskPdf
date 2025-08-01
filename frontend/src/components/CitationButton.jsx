import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

const CitationButton = ({ citation, document }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
      >
        <FileText className="w-3 h-3" />
        <span>Page {citation.pageNumber}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Citation - Page {citation.pageNumber}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96 custom-scrollbar">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Source Content:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {citation.snippet || citation.content}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>Document: {document.originalName}</p>
                <p>Page: {citation.pageNumber}</p>
                {citation.relevanceScore && (
                  <p>Relevance: {Math.round(citation.relevanceScore * 100)}%</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CitationButton;