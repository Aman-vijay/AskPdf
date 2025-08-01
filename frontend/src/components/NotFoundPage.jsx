import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFoundPage = ({ onBack }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <FileQuestion className="w-12 h-12 text-gray-600" />
        </div>
        
        <div className="text-4xl font-bold text-gray-600">
          404
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Page Not Found
        </h1>
        
        <p className="text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        {onBack && (
          <div>
            <button
              onClick={onBack}
              className="mt-6 inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
