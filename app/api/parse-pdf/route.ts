import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { extractTextFromPdfData,parseResumeIntoSectionsV2 } from '../Functions/function';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParser = new PDFParser();

    return new Promise((resolve) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        resolve(NextResponse.json(
          { error: 'Failed to parse PDF', details: errData.parserError },
          { status: 500 }
        ));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        // Use the improved text extraction and parsing functions
        const extractedText = extractTextFromPdfData(pdfData);
        const {data:parsedata, sectionLength:seclen} = parseResumeIntoSectionsV2(extractedText);
        // const parsedSections = parseResumeIntoSectionsV2(extractedText);
        
        resolve(NextResponse.json({
          success: true,
          data: parsedata,
            sectionLength: seclen,
          // You can include the raw text for debugging if you want
          // rawText: extractedText 
        }));
      });

      pdfParser.parseBuffer(buffer);
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}