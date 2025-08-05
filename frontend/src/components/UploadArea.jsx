import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import ProgressBar from './ProgressBar';

const UploadArea = ({ onDocumentUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB.');
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);
    setProgress(0);

    try {
   
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await apiService.uploadPDF(file);
      console.log(response.data.data)
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setSuccess(true);
        setUploading(false);
        onDocumentUploaded(response.data.data);
      }, 500);

    } catch (error) {
      setUploading(false);
      setProgress(0);
      console.error('Upload error:', error);
      
     
      if (error.response) {
      
        if (error.response.status === 413) {
          setError('The file is too large. Please upload a smaller PDF file.');
        } else if (error.response.status === 415) {
          setError('The file format is not supported. Please upload a valid PDF file.');
        } else if (error.response.status >= 500) {
          setError('Server error. The system is currently unable to process your file. Please try again later.');
        } else {
          setError(error.response?.data?.message || 'Failed to upload PDF. Please try again.');
        }
      } else if (error.request) {
    
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('Failed to upload PDF. Please try again.');
      }
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  });

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Document uploaded successfully!
        </h3>
        <p className="text-gray-600">
          Your PDF has been processed and is ready for chat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload PDF to start chatting
        </h2>
        <p className="text-gray-600">
          Upload your PDF document and start asking questions about its content
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary-400 bg-primary-50' 
            : uploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Uploading PDF
              </h3>
              <ProgressBar progress={progress} />
              <p className="text-sm text-gray-600">
                Processing your document...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Upload PDF to start chatting'}
              </h3>
              <p className="text-gray-600">
                Click or drag and drop your file here
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>PDF files only, up to 50MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadArea;