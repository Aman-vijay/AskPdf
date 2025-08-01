import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ErrorPage = ({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while processing your request.', 
  code = 500,
  onBack
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        
        {code && (
          <div className="text-4xl font-bold text-red-600">
            {code}
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>
        
        <p className="text-gray-600">
          {message}
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
        
        <div className="pt-6 border-t border-gray-200 mt-6">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
