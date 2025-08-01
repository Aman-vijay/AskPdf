// Create a mock LlamaParseService that doesn't cause crashes
// This is a temporary solution until we can properly integrate llama-cloud-services

class LlamaParseService {
  constructor() {
    this.isAvailable = false;
    console.warn('⚠️ LlamaParseService is disabled - Using fallback parsing');
  }

  async parseDocument(file) {
    try {
      console.log('📄 Using fallback PDF parsing method');
      // Return empty array as we're not actually parsing with LlamaIndex
      // The system will fall back to the standard PDF parsing
      return [];
    } catch (error) {
      console.error('Error in LlamaParseService:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}

export default new LlamaParseService();