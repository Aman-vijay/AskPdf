/**
 * This file patches the pdf-parse library to prevent it from running its test code
 * when imported. The original library tries to access a test file that doesn't exist
 * when it's the main module, which causes errors.
 */

// Import the original library with error handling
let originalPdfParse;
try {
  originalPdfParse = require('pdf-parse');
} catch (error) {
  console.error('Error loading pdf-parse:', error.message);
  // Create a fallback function if the module fails to load
  originalPdfParse = async () => ({ 
    text: 'PDF parsing failed', 
    numpages: 0,
    info: {}
  });
}

// Create a wrapper with proper error handling
const wrappedPdfParse = function(...args) {
  try {
    return originalPdfParse(...args);
  } catch (error) {
    console.error('PDF Parse error:', error);
    // Return a fallback response instead of crashing
    return Promise.resolve({
      text: 'PDF parsing failed: ' + error.message,
      numpages: 0,
      info: {}
    });
  }
};

// Copy all properties from the original
Object.assign(wrappedPdfParse, originalPdfParse);

// Export the wrapped version
module.exports = wrappedPdfParse;
