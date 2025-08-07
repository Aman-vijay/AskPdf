import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, FileText, Loader2, Copy, Check } from 'lucide-react';
import { apiService } from '../services/api';
import CitationButton from './CitationButton';

const ChatInterface = ({ document, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // No need to load chat history or suggestions on component mount

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  //Handle load Suggestions
  const handleSuggestions = async () => {
    if (!document) return;
    try {
      const response = await apiService.getSuggestions(document.documentId);
      setSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    }
  };
  // Load suggestions when document is set
  useEffect(() => {
    if (document) {
      handleSuggestions();
    }
  }, [document]);



const handleSendMessage = async (messageArg) => {
  const message = (messageArg ?? inputValue).trim();
  if (!message || isLoading) return;

  const userMessage = {
    type: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputValue('');
  setIsLoading(true);
  setSuggestions([]);

  try {
    const response = await apiService.chatQuery(document.documentId, message);

    const assistantMessage = {
      type: 'assistant',
      content: response.data.data.answer,
      citations: Array.isArray(response.data.data.citations) ? response.data.data.citations : [],
      confidence: response.data.data.confidence,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    if (response.data.followUpQuestions) {
      setSuggestions(response.data.followUpQuestions);
    }
  } catch (error) {
    console.error('Chat query error:', error);
    let errorContent = 'Sorry, I encountered an error.';

    if (error.response) {
      if (error.response.status === 404) {
        errorContent = 'Document not found.';
      } else if (error.response.status === 429) {
        errorContent = 'Too many requests. Try again later.';
      } else if (error.response.status >= 500) {
        errorContent = 'Server error.';
      } else if (error.response.data?.message) {
        errorContent = `Error: ${error.response.data.message}`;
      }
    } else if (error.request) {
      errorContent = 'No server response.';
    }

    const errorMessage = {
      type: 'assistant',
      content: errorContent,
      isError: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="card h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Chat with Document
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-64">
              {document.originalName}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
       {Array.isArray(messages) && messages.length === 0 &&  !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your document is ready!
            </h3>
            <p className="text-gray-600 mb-6">
              You can now ask questions about your document. For example:
            </p>
            
            {suggestions.length > 0 && (
              <div className="space-y-2 max-w-md mx-auto">
                {suggestions.map((suggestion, index) => (
                  
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-[#9E7BBA]"
                  >
                    ·{suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages && messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-primary-600' 
                  : message.isError 
                    ? 'bg-red-100' 
                    : 'bg-gray-100'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className={`w-4 h-4 ${message.isError ? 'text-red-600' : 'text-gray-600'}`} />
                )}
              </div>
              
              <div className={`rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : message.isError
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <p className={`m-0 ${message.type === 'user' ? 'text-black' : message.isError ? 'text-red-700' : 'text-gray-900'}`}>
                    {message.content}
                  </p>
                </div>
                
               {Array.isArray(message.citations) && message.citations.length > 0 && (

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.citations.map((citation, citationIndex) => (
                        <CitationButton
                          key={citationIndex}
                          citation={citation}
                          document={document}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {message.type === 'assistant' && !message.isError && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {message.confidence && (
                        <span className="text-xs text-gray-500">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy response"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* Input */}
      <div className="p-4 border-t text-black border-gray-200">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the document..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={ isLoading}
            className="px-3 py-1 bg-[#9E7BBA] text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;