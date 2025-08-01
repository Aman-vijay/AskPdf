import { LlamaParseReader } from 'llamaindex';

class LlamaParseService {
  constructor() {
    this.reader = new LlamaParseReader();
  }

  async parseDocument(file) {
    try {
      const documents = await this.reader.loadData(file);
      return documents;
    } catch (error) {
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }
}

export default new LlamaParseService();