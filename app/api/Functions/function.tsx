// // export function extractTextFromPdfData(pdfData: any): string {
// //     let extractedText = '';
    
// //     if (pdfData.Pages && pdfData.Pages.length > 0) {
// //       pdfData.Pages.forEach((page: any, pageIndex: number) => {
// //         // Use a more distinct page separator for easier splitting later
// //         if (pageIndex > 0) extractedText += '\n---PAGEBREAK---\n';
        
// //         if (page.Texts && page.Texts.length > 0) {
// //           const sortedTexts = page.Texts.sort((a: any, b: any) => {
// //             if (a.y === b.y) {
// //               return a.x - b.x;
// //             }
// //             return a.y - b.y;
// //           });
  
// //           let line = '';
// //           let lastY = -1;
  
// //           sortedTexts.forEach((textElement: any) => {
// //             if (lastY !== -1 && textElement.y > lastY + 1) { // New line detected
// //                extractedText += line.trim() + '\n';
// //                line = '';
// //             }
  
// //             if (textElement.R && textElement.R.length > 0) {
// //               textElement.R.forEach((run: any) => {
// //                 if (run.T) {
// //                   line += decodeURIComponent(run.T);
// //                 }
// //               });
// //             }
// //             lastY = textElement.y;
// //           });
// //           // Add the last line
// //           extractedText += line.trim() + '\n';
// //         }
// //       });
// //     }
    
// //     return extractedText.trim();
// //   }


// //  export  function parseResumeIntoSectionsV2(text: string): any {
// //     // 1. Define known section headers and their corresponding keys.
// //     // Keep this list comprehensive.
// //     const sectionHeaders: { [key: string]: string[] } = {
// //       objective: ['objective', 'career objective', 'summary', 'profile'],
// //       education: ['education', 'academic details', 'academic qualifications'],
// //       experience: ['experience', 'work experience', 'professional experience', 'employment history'],
// //       projects: ['projects', 'personal projects', 'academic projects'],
// //       skills: ['skills', 'technical skills', 'proficiencies', 'core competencies'],
// //       certifications: ['certifications', 'licenses & certifications', 'courses', 'training'],
// //       achievements: ['achievements', 'awards', 'honors and awards'],
// //       contact: ['contact', 'contact information'],
// //     };
  
// //     const lines = text.split('\n').map(line => line.trim()).filter(line => line);
// //     const sections: { [key: string]: string[] } = {
// //       personalInfo: [] // Default section for text at the top
// //     };
// //     let currentSection: string = 'personalInfo';
  
// //     // 2. Group lines into sections based on normalized headers
// //     lines.forEach(line => {
// //       let isHeader = false;
      
// //       // Normalize the line from the PDF for a fuzzy match.
// //       // This removes all non-alphabetic characters and spaces.
// //       // e.g., "Work Experience :" becomes "workexperience"
// //       const normalizedLine = line.toLowerCase().replace(/[^a-z]/g, '');
  
// //       // Don't treat very long lines as potential headers
// //       if (line.length > 50) { 
// //           sections[currentSection].push(line);
// //           return;
// //       }
  
// //       for (const key in sectionHeaders) {
// //         // Normalize our keywords in the same way
// //         const normalizedKeywords = sectionHeaders[key].map(h => h.replace(/[^a-z]/g, ''));
        
// //         if (normalizedKeywords.includes(normalizedLine)) {
// //           currentSection = key;
// //           sections[currentSection] = []; // Initialize section array
// //           isHeader = true;
// //           break;
// //         }
// //       }
  
// //       if (!isHeader) {
// //         if (!sections[currentSection]) {
// //           sections[currentSection] = [];
// //         }
// //         sections[currentSection].push(line);
// //       }
// //     });
  
// //     // 3. Format the collected sections into a clean output object
// //     const formattedSections: { [key: string]: any } = {};
// //     const sectionLength: { [key: string]: number } = {}; // To store the number of skills
// //     for (const key in sections) {
// //       if (sections[key] && sections[key].length > 0) {
// //         if (key === 'skills') {
// //           const skillsList = sections[key]
// //             .join(' ')
// //             .split(/,|\s{2,}|•|∙|–|-|:/) // Split by even more delimiters
// //             .map(skill => skill.trim())
// //             .filter(skill => skill.length > 1 && skill.length < 50);
// //           formattedSections[key] = [...new Set(skillsList)];
// //           sectionLength[key]=formattedSections[key].length; // Store the number of skills
// //         } else {
// //           formattedSections[key] = sections[key].join('\n');
// //           sectionLength[key] = formattedSections[key].length; // Store the number of lines in other sections
// //         }
// //       }
// //     }
  
// //     return {
// //         data: formattedSections,
// //         sectionLength: sectionLength,
// //     };
// //   }


// import nlp from 'compromise';

// // Helper interfaces (no changes)
// interface TokenizedOutput {
//   nouns: string[];
//   verbs: string[];
//   sentences: string[];
// }

// // Tokenizer function (no changes)
// function tokenizeText(text: string): TokenizedOutput {
//   const doc = nlp(text);
//   const nouns = [...new Set(doc.nouns().out('array'))];
//   const verbs = [...new Set(doc.verbs().out('array'))];
//   const sentences = doc.sentences().out('array');
//   return { nouns, verbs, sentences };
// }

// /**
//  * FINAL VERSION: This function parses the resume into sections, tokenizes the content,
//  * and then restructures the output for optimal use by an AI model.
//  */
// export function getStructuredResumeTokens(text: string) {
//   // Step 1: Group lines into sections (same logic as before)
//   const sectionHeaders: { [key: string]: string[] } = {
//     experience: ['experience', 'work experience', 'professional experience'],
//     education: ['education', 'academic details'],
//     projects: ['projects', 'personal projects'],
//     skills: ['skills', 'technical skills', 'proficiencies'],
//   };
//   const lines = text.split('\n').map(line => line.trim()).filter(line => line);
//   const sections: { [key: string]: string[] } = { personalInfo: [] };
//   let currentSection: string = 'personalInfo';

//   lines.forEach(line => {
//     let isHeader = false;
//     const normalizedLine = line.toLowerCase().replace(/[^a-z]/g, '');
//     if (line.length < 50) {
//       for (const key in sectionHeaders) {
//         const normalizedKeywords = sectionHeaders[key].map(h => h.replace(/[^a-z]/g, ''));
//         if (normalizedKeywords.includes(normalizedLine)) {
//           currentSection = key;
//           sections[currentSection] = [];
//           isHeader = true;
//           break;
//         }
//       }
//     }
//     if (!isHeader) {
//       if (!sections[currentSection]) sections[currentSection] = [];
//       sections[currentSection].push(line);
//     }
//   });

//   // Step 2: Tokenize the text within each section (same logic as before)
//   const tempTokenizedSections: { [key: string]: TokenizedOutput } = {};
//   for (const key in sections) {
//     if (sections[key] && sections[key].length > 0) {
//       const sectionText = sections[key].join('\n');
//       tempTokenizedSections[key] = tokenizeText(sectionText);
//     }
//   }

//   // --- NEW LOGIC START ---
//   // Step 3: Restructure the tokenized data for the final output
//   const finalOutput = {
//     nouns_by_section: {} as { [key: string]: string[] },
//     verbs_by_section: {} as { [key: string]: string[] },
//     all_sentences: [] as string[],
//   };

//   for (const sectionKey in tempTokenizedSections) {
//     const tokens = tempTokenizedSections[sectionKey];

//     if (tokens.nouns.length > 0) {
//       finalOutput.nouns_by_section[sectionKey] = tokens.nouns;
//     }
//     if (tokens.verbs.length > 0) {
//       finalOutput.verbs_by_section[sectionKey] = tokens.verbs;
//     }
//     if (tokens.sentences.length > 0) {
//       finalOutput.all_sentences.push(...tokens.sentences);
//     }
//   }
//   // --- NEW LOGIC END ---

//   return finalOutput;
// }

// // You can keep your extractTextFromPdfData function here as well
// export function extractTextFromPdfData(pdfData: any): string {
//   // ... your existing code ...
//   return "extracted text example";
// }


import nlp from 'compromise';
// Make sure you have run: npm install compromise

// --- INTERFACES & TYPES ---

// Defines the structure for a tokenized block of text
interface TokenizedOutput {
  nouns: string[];
  verbs: string[];
  sentences: string[];
}

// --- CORE FUNCTIONS ---

/**
 * 1. Extracts readable text from the raw pdf2json output.
 * This function reconstructs lines and pages from the PDF's text coordinates.
 */
export function extractTextFromPdfData(pdfData: any): string {
  let fullText = '';
  if (!pdfData.Pages) {
    return fullText;
  }

  pdfData.Pages.forEach((page: any) => {
    let lastY = -1;
    // Sort text elements by their Y, then X coordinates to read in order
    const texts = page.Texts.sort((a: any, b: any) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    texts.forEach((textEl: any) => {
      // If the Y coordinate has changed significantly, it's a new line
      if (lastY !== -1 && textEl.y > lastY + 1) {
        fullText += '\n';
      }
      lastY = textEl.y;

      if (textEl.R && textEl.R.length > 0) {
        fullText += textEl.R.map((run: any) => decodeURIComponent(run.T)).join('');
      }
    });
    // Add a newline after each page's content
    fullText += '\n';
  });

  return fullText;
}

/**
 * 2. A helper function to tokenize a given block of text.
 * It uses the 'compromise' library to find unique nouns, verbs, and all sentences.
 */
function tokenizeText(text: string): TokenizedOutput {
  const doc = nlp(text);
  const nouns = [...new Set(doc.nouns().out('array'))];
  const verbs = [...new Set(doc.verbs().out('array'))];
  const sentences = doc.sentences().out('array');
  return { nouns, verbs, sentences };
}

/**
 * 3. The main resume processing function.
 * It parses the resume into sections, tokenizes each section's content,
 * and restructures the final data for optimal use.
 */
export function getStructuredResumeTokens(text: string) {
  // Step A: Define section headers to identify parts of the resume
  const sectionHeaders: { [key: string]: string[] } = {
    experience: ['experience', 'work experience', 'professional experience', 'employment history'],
    education: ['education', 'academic details', 'academic qualifications'],
    projects: ['projects', 'personal projects', 'academic projects'],
    skills: ['skills', 'technical skills', 'proficiencies', 'core competencies'],
  };

  // Step B: Group the resume's text lines into sections
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const sections: { [key: string]: string[] } = { personalInfo: [] };
  let currentSection: string = 'personalInfo';

  lines.forEach(line => {
    let isHeader = false;
    // Normalize line for robust matching (lowercase, no special chars)
    const normalizedLine = line.toLowerCase().replace(/[^a-z]/g, '');

    // Headers are usually short, so we avoid matching long sentences
    if (line.length < 50) {
      for (const key in sectionHeaders) {
        const normalizedKeywords = sectionHeaders[key].map(h => h.replace(/[^a-z]/g, ''));
        if (normalizedKeywords.includes(normalizedLine)) {
          currentSection = key;
          sections[currentSection] = [];
          isHeader = true;
          break;
        }
      }
    }
    // If it's not a header, add the line to the current section
    if (!isHeader) {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  });

  // Step C: Tokenize the text within each section
  const tempTokenizedSections: { [key: string]: TokenizedOutput } = {};
  for (const key in sections) {
    if (sections[key] && sections[key].length > 0) {
      const sectionText = sections[key].join('\n');
      tempTokenizedSections[key] = tokenizeText(sectionText);
    }
  }

  // Step D: Restructure the data into the final, AI-ready format
  const finalOutput = {
    nouns_by_section: {} as { [key: string]: string[] },
    verbs_by_section: {} as { [key: string]: string[] },
    all_sentences: [] as string[],
  };

  for (const sectionKey in tempTokenizedSections) {
    const tokens = tempTokenizedSections[sectionKey];
    if (tokens.nouns.length > 0) {
      finalOutput.nouns_by_section[sectionKey] = tokens.nouns;
    }
    if (tokens.verbs.length > 0) {
      finalOutput.verbs_by_section[sectionKey] = tokens.verbs;
    }
    if (tokens.sentences.length > 0) {
      finalOutput.all_sentences.push(...tokens.sentences);
    }
  }

  return finalOutput;
}