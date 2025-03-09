'use server';

// Fix for missing type declaration
// @ts-ignore
import pdfParse from 'pdf-parse';
// Alternative solution: create a declaration file or install types if available
// npm i --save-dev @types/pdf-parse

/**
 * Sanitizes text by removing null bytes and invalid UTF-8 characters
 * @param text Raw text that may contain invalid characters
 * @returns Cleaned text safe for database storage
 */
export function sanitizePdfText(text: string): string {
  // Remove null bytes (0x00)
  let cleaned = text.replace(/\0/g, '');
  
  // Replace other control characters (except common whitespace)
  cleaned = cleaned.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Handle surrogate pairs and other invalid UTF-8 sequences
  // This regex attempts to match invalid UTF-8 sequences
  cleaned = cleaned.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, '');
  
  return cleaned;
}

/**
 * Extracts text from a PDF buffer
 * @param pdfBuffer Buffer containing PDF data
 * @returns Extracted text as a string
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    // Sanitize the extracted text before returning
    return sanitizePdfText(data.text);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
} 