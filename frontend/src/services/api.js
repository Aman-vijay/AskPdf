import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for file uploads
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
);

export const apiService = {
  // Helper methods
  getBaseUrl: () => API_BASE_URL,
  
 uploadPDF: async (file, onProgress) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  return api.post('/pdf/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
        if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 60) / progressEvent.total);
        onProgress(percentCompleted); 
      }
    }
  });
},


  getDocuments: async () => {
    return api.get('/pdf/documents');
  },

  getDocument: async (documentId) => {
    return api.get(`/pdf/document/${documentId}`);
  },

  deleteDocument: async (documentId) => {
    return api.delete(`/pdf/documents/${documentId}`);
  },

  getDocumentContent: async (documentId) => {
    return api.get(`/pdf/documents/${documentId}/content`);
  },

  getDocumentPage: async (documentId, pageNumber) => {
    return api.get(`/pdf/documents/${documentId}/page/${pageNumber}`);
  },

  // Chat Interface
  chatQuery: async (documentId, query, conversationHistory = []) => {
    return api.post('/chat/query', {
      documentId,
      query,
      conversationHistory,
    });
  },



  searchDocument: async (documentId, query, limit = 10) => {
    return api.post('/chat/search', {
      documentId,
      query,
      limit,
    });
  },

  getCitations: async (documentId, query) => {
    return api.post('/chat/citations', {
      documentId,
      query,
    });
  },

  getSuggestions: async (documentId) => {
    return api.get(`/chat/suggestions/${documentId}`);
  },

  // Health Check
  healthCheck: async () => {
    return api.get('/health');
  },
};

export default api;