import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

import {
  extractTextFromPdfData,
  getStructuredResumeTokens
} from '../Functions/function'; // Adjust path if needed

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    // 1. Validate the uploaded file
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. Use pdf2json to parse the PDF buffer
    const pdfParser = new PDFParser();

    // Wrap the event-based parser in a Promise for async/await syntax
    return new Promise((resolve) => {
      // Error handler
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error("PDF Parsing Error:", errData.parserError);
        resolve(NextResponse.json(
          { error: 'Failed to parse PDF', details: errData.parserError },
          { status: 500 }
        ));
      });

      // Success handler
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        // 3. Call your custom functions to process the raw PDF data
        const extractedText = extractTextFromPdfData(pdfData);
        const structuredResumeData = getStructuredResumeTokens(extractedText);

        // 4. Return the final structured data as a JSON response
        resolve(NextResponse.json({
          success: true,
          data: structuredResumeData,
        }));
      });

      // Start parsing the buffer
      pdfParser.parseBuffer(buffer);
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}