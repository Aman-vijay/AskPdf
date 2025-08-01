import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('../utils/pdf-parse-wrapper.cjs');

import geminiService from '../config/gemini.js';
import llamaParseService from '../config/llamaparse.js';
import dataStore from './dataStore.js';

const md = new MarkdownIt();

const isHeading = (text) =>
  text.length < 100 &&
  (text.match(/^[A-Z][^.!?]*$/) || text.match(/^\d+\.?\s+[A-Z]/));

const isList = (text) =>
  text.includes('\n') &&
  text.split('\n').some((line) =>
    line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\.\s+/)
  );

const splitIntoPages = (text, totalPages) => {
  const avgCharsPerPage = Math.ceil(text.length / totalPages);
  const pages = [];

  for (let i = 0; i < totalPages; i++) {
    const start = i * avgCharsPerPage;
    const end = Math.min((i + 1) * avgCharsPerPage, text.length);
    pages.push({
      pageNumber: i + 1,
      content: text.slice(start, end).trim(),
    });
  }

  return pages;
};

const convertToMarkdown = (text, metadata = {}) => {
  let markdown = '';

  if (metadata.Title) markdown += `# ${metadata.Title}\n\n`;
  if (metadata.Author) markdown += `**Author:** ${metadata.Author}\n\n`;
  if (metadata.Subject) markdown += `**Subject:** ${metadata.Subject}\n\n`;

  const paragraphs = text.split('\n\n');

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (isHeading(trimmed)) {
      markdown += `## ${trimmed}\n\n`;
    } else if (isList(trimmed)) {
      const listItems = trimmed.split('\n');
      for (const item of listItems) {
        if (item.trim()) markdown += `- ${item.trim()}\n`;
      }
      markdown += '\n';
    } else {
      markdown += `${trimmed}\n\n`;
    }
  }

  return markdown;
};

const createChunks = (pages, chunkSize = 1000, overlap = 200) => {
  const chunks = [];

  for (const page of pages) {
    const { content, pageNumber } = page;
    if (content.length <= chunkSize) {
      chunks.push({
        id: uuidv4(),
        content,
        pageNumber,
        startChar: 0,
        endChar: content.length,
      });
    } else {
      for (let i = 0; i < content.length; i += chunkSize - overlap) {
        const end = Math.min(i + chunkSize, content.length);
        const chunkContent = content.slice(i, end);

        chunks.push({
          id: uuidv4(),
          content: chunkContent,
          pageNumber,
          startChar: i,
          endChar: end,
        });

        if (end >= content.length) break;
      }
    }
  }

  return chunks;
};

const vectorizeChunks = async (chunks) => {
  const vectorized = [];

  for (const chunk of chunks) {
    try {
      const embedding = await geminiService.generateEmbedding(chunk.content);
      vectorized.push({ ...chunk, embedding });
    } catch (error) {
      console.error(`❌ Error vectorizing chunk ${chunk.id}:`, error.message);
    }
  }

  return vectorized;
};

const generateSummary = (text) => {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const summary = sentences.slice(0, 3).join('. ');
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
};

export const processPDF = async (filePath, originalName) => {
  try {
    console.log(`📄 Processing PDF: ${originalName}`);

    const documentId = uuidv4();
    const fileStats = await fs.stat(filePath);

    await dataStore.createDocument({
      id: documentId,
      filename: path.basename(filePath),
      originalName,
      fileSize: fileStats.size,
      mimeType: 'application/pdf',
      storagePath: filePath,
      processingStatus: 'processing',
    });

    // Try LlamaParse first
    let pages = [];
    let fullText = '';
    let numpages = 0;

    try {
      const llamaDocs = await llamaParseService.parseDocument(filePath);
      if (!llamaDocs || llamaDocs.length === 0) {
        throw new Error('LlamaParse returned no content');
      }

      pages = llamaDocs.map((doc, i) => ({
        pageNumber: i + 1,
        content: doc.text.trim(),
      }));
      fullText = pages.map((p) => p.content).join('\n\n');
      numpages = pages.length;
    } catch (llamaError) {
      console.warn('⚠️ LlamaParse failed, using pdf-parse fallback:', llamaError.message);
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const { text, numpages: np, info } = pdfData;

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      pages = splitIntoPages(text, np);
      fullText = text;
      numpages = np;
    }

    const markdownContent = convertToMarkdown(fullText);
    const chunks = createChunks(pages);
    const vectorizedChunks = await vectorizeChunks(chunks);

    await dataStore.saveDocumentChunks(documentId, vectorizedChunks);

    await dataStore.updateDocument(documentId, {
      processingStatus: 'completed',
      pageCount: numpages,
    });

    console.log(`✅ PDF processed successfully: ${originalName} (${numpages} pages)`);

    return {
      documentId,
      totalPages: numpages,
      chunksCount: vectorizedChunks.length,
      summary: generateSummary(fullText),
    };
  } catch (error) {
    console.error('❌ Error processing PDF:', error.message);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};
