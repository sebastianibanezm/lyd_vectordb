'use server';

// Fix for missing type declaration
// @ts-ignore
import * as pdfParse from 'pdf-parse';
// Alternative solution: create a declaration file or install types if available
// npm i --save-dev @types/pdf-parse

/**
 * Extracts text from a PDF buffer
 * @param pdfBuffer Buffer containing PDF data
 * @returns Extracted text as a string
 */
export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
} 