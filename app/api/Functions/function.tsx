// import nlp from 'compromise';
// interface TokenizedOutput {
//   nouns: string[];
//   verbs: string[];
//   sentences: string[];
// }

// // --- CORE FUNCTIONS ---

// /**
//  * 1. Extracts readable text from the raw pdf2json output.
//  * This function reconstructs lines and pages from the PDF's text coordinates.
//  */
// export function extractTextFromPdfData(pdfData: any): string {
//   let fullText = '';
//   if (!pdfData.Pages) {
//     return fullText;
//   }

//   pdfData.Pages.forEach((page: any) => {
//     let lastY = -1;
//     // Sort text elements by their Y, then X coordinates to read in order
//     const texts = page.Texts.sort((a: any, b: any) => {
//       if (a.y === b.y) {
//         return a.x - b.x;
//       }
//       return a.y - b.y;
//     });

//     texts.forEach((textEl: any) => {
//       // If the Y coordinate has changed significantly, it's a new line
//       if (lastY !== -1 && textEl.y > lastY + 1) {
//         fullText += '\n';
//       }
//       lastY = textEl.y;

//       if (textEl.R && textEl.R.length > 0) {
//         fullText += textEl.R.map((run: any) => decodeURIComponent(run.T)).join('');
//       }
//     });
//     // Add a newline after each page's content
//     fullText += '\n';
//   });

//   return fullText;
// }

// /**
//  * 2. A helper function to tokenize a given block of text.
//  * It uses the 'compromise' library to find unique nouns, verbs, and all sentences.
//  */
// function tokenizeText(text: string): TokenizedOutput {
//   const doc = nlp(text);
//   const nouns = [...new Set(doc.nouns().out('array') as string[])];
//   const verbs = [...new Set(doc.verbs().out('array') as string[])];
//   const sentences = doc.sentences().out('array');
//   return { nouns, verbs, sentences };
// }

// /**
//  * 3. The main resume processing function.
//  * It parses the resume into sections, tokenizes each section's content,
//  * and restructures the final data for optimal use.
//  */
// export function getStructuredResumeTokens(text: string) {
//   // Step A: Define section headers to identify parts of the resume
//   const sectionHeaders: { [key: string]: string[] } = {
//     experience: ['experience', 'work experience', 'professional experience', 'employment history'],
//     education: ['education', 'academic details', 'academic qualifications'],
//     projects: ['projects', 'personal projects', 'academic projects'],
//     skills: ['skills', 'technical skills', 'proficiencies', 'core competencies'],
//   };

//   // Step B: Group the resume's text lines into sections
//   const lines = text.split('\n').map(line => line.trim()).filter(line => line);
//   const sections: { [key: string]: string[] } = { personalInfo: [] };
//   let currentSection: string = 'personalInfo';

//   lines.forEach(line => {
//     let isHeader = false;
//     // Normalize line for robust matching (lowercase, no special chars)
//     const normalizedLine = line.toLowerCase().replace(/[^a-z]/g, '');

//     // Headers are usually short, so we avoid matching long sentences
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
//     // If it's not a header, add the line to the current section
//     if (!isHeader) {
//       if (!sections[currentSection]) sections[currentSection] = [];
//       sections[currentSection].push(line);
//     }
//   });

//   // Step C: Tokenize the text within each section
//   const tempTokenizedSections: { [key: string]: TokenizedOutput } = {};
//   for (const key in sections) {
//     if (sections[key] && sections[key].length > 0) {
//       const sectionText = sections[key].join('\n');
//       tempTokenizedSections[key] = tokenizeText(sectionText);
//     }
//   }

//   // Step D: Restructure the data into the final, AI-ready format
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

//   return finalOutput;
// }


// // Helper function to build the detailed prompt for the AI
// export function buildPrompt(resumeData: any, jdData: any): string {
//   // Convert the JSON data to string format for the prompt
//   const resumeJsonString = JSON.stringify(resumeData, null, 2);
//   const jdJsonString = JSON.stringify(jdData, null, 2);

//   return `
//     You are an expert career coach and professional resume writer. Your task is to tailor a candidate's resume to a specific job description.

//     Here is the parsed job description data:
//     --- JOB DESCRIPTION START ---
//     ${jdJsonString}
//     --- JOB DESCRIPTION END ---

//     Here is the parsed candidate's resume data:
//     --- RESUME START ---
//     ${resumeJsonString}
//     --- RESUME END ---

//     **Your Task:**

//     1.  **Analyze:** Critically analyze the job description's nouns and verbs to understand the core requirements.
//     2.  **Compare:** Compare the job's requirements with the candidate's resume, noting strengths and identifying keywords or skills that are missing or underrepresented in their "experience" section.
//     3.  **Rewrite:** Rewrite the sentences from the candidate's "experience" section. Do not invent new experiences. Instead, rephrase the existing sentences to more closely align with the job description.
//         * Naturally weave in missing keywords from the job description's nouns.
//         * Use stronger, more relevant action verbs inspired by the job description's verbs.
//         * Ensure each sentence highlights a clear achievement or contribution.

//     **Output Format:**

//     Return ONLY a valid JSON object with a single key: "tailored_bullet_points". The value should be an array of strings, where each string is a new, rewritten bullet point for the experience section.

//     Example Response:
//     {
//       "tailored_bullet_points": [
//         "Rewritten sentence 1.",
//         "Rewritten sentence 2."
//       ]
//     }
//   `;
// }


import nlp from 'compromise';

interface TokenizedOutput {
  nouns: string[];
  verbs: string[];
  sentences: string[];
}

// --- CORE FUNCTIONS ---

/**
 * 1. Extracts readable text from the raw pdf2json output.
 * Fixes spacing issues and improves newline detection.
 */
export function extractTextFromPdfData(pdfData: any): string {
  let fullText = '';
  if (!pdfData.Pages) return fullText;

  pdfData.Pages.forEach((page: any) => {
    let lastY = -1;

    // Sort text elements by Y then X
    const texts = page.Texts.sort((a: any, b: any) => {
      if (a.y === b.y) return a.x - b.x;
      return a.y - b.y;
    });

    texts.forEach((textEl: any) => {
      // Improved line break detection (smaller Y difference threshold)
      if (lastY !== -1 && Math.abs(textEl.y - lastY) > 0.5) {
        fullText += '\n';
      }
      lastY = textEl.y;

      if (textEl.R && textEl.R.length > 0) {
        // Add spaces between runs to avoid squished words
        fullText += textEl.R.map((run: any) => decodeURIComponent(run.T)).join(' ');
        fullText += ' '; // extra safety space between elements
      }
    });

    fullText += '\n';
  });

  // Normalize spacing and trim
  return fullText
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

/**
 * 2. Tokenizes text into nouns, verbs, and sentences using 'compromise'.
 */
function tokenizeText(text: string): TokenizedOutput {
  const doc = nlp(text);
  const nouns = [...new Set(doc.nouns().out('array') as string[])];
  const verbs = [...new Set(doc.verbs().out('array') as string[])];
  const sentences = doc.sentences().out('array');
  return { nouns, verbs, sentences };
}

/**
 * 3. Parses resume into sections and tokenizes each section.
 */
export function getStructuredResumeTokens(text: string) {
  const sectionHeaders: { [key: string]: string[] } = {
    experience: ['experience', 'work experience', 'professional experience', 'employment history'],
    education: ['education', 'academic details', 'academic qualifications'],
    projects: ['projects', 'personal projects', 'academic projects'],
    skills: ['skills', 'technical skills', 'proficiencies', 'core competencies'],
  };

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const sections: { [key: string]: string[] } = { personalInfo: [] };
  let currentSection: string = 'personalInfo';

  lines.forEach(line => {
    let isHeader = false;
    const normalizedLine = line.toLowerCase().replace(/[^a-z]/g, '');

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

    if (!isHeader) {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  });

  const tempTokenizedSections: { [key: string]: TokenizedOutput } = {};
  for (const key in sections) {
    if (sections[key] && sections[key].length > 0) {
      const sectionText = sections[key].join('\n');
      tempTokenizedSections[key] = tokenizeText(sectionText);
    }
  }

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

/**
 * 4. Builds the AI prompt for tailoring resume to job description.
 * Now also allows pulling in relevant points from "projects" and "skills".
 */
// export function buildPrompt(resumeData: any, jdData: any): string {
//   const resumeJsonString = JSON.stringify(resumeData, null, 2);
//   const jdJsonString = JSON.stringify(jdData, null, 2);

//   return `
// You are an expert career coach and professional resume writer.
// Your task is to tailor a candidate's resume to a specific job description.

// --- JOB DESCRIPTION START ---
// ${jdJsonString}
// --- JOB DESCRIPTION END ---

// --- RESUME START ---
// ${resumeJsonString}
// --- RESUME END ---

// **Your Task:**
// 1. Analyze the job description's nouns and verbs to identify key skills, technologies, and responsibilities.
// 2. Compare them with the candidate's resume data across *experience*, *projects*, and *skills*.
// 3. Rewrite the candidate's "experience" bullet points:
//    - Do not invent new experiences, but you may rephrase existing ones.
//    - Naturally weave in *missing but relevant* keywords from the job description if they are supported by evidence elsewhere in the resume (including projects or skills).
//    - Use strong, relevant action verbs aligned with the JD.
//    - Highlight measurable impact where possible (use existing metrics if available).
// 4. Ensure each bullet point is concise, impactful, and tailored to the JD.

// **Output Format:**
// Return ONLY a valid JSON object with:
// {
//   "tailored_bullet_points": [
//     "Bullet point 1",
//     "Bullet point 2"
//   ]
// }
// `;
// }


export function buildPrompt(resumeData: any, jdData: any): string {
  const resumeJsonString = JSON.stringify(resumeData, null, 2);
  const jdJsonString = JSON.stringify(jdData, null, 2);

  return `
You are an expert career coach and professional resume writer.
Your task is to tailor a candidate's entire resume to a specific job description.

--- JOB DESCRIPTION START ---
${jdJsonString}
--- JOB DESCRIPTION END ---

--- RESUME START ---
${resumeJsonString}
--- RESUME END ---

**Your Task:**
1. Analyze the job description's nouns and verbs to identify the most important skills, technologies, and responsibilities.
2. For **each section** of the resume (personalInfo, education, experience, projects, skills, certifications, etc.):
   - Rephrase and enhance the existing content so it better matches the job description.
   - Naturally weave in missing but relevant keywords **if they are supported by the resume**.
   - Maintain factual accuracy — do not invent qualifications or experiences.
   - Keep the section's original meaning but make it more impactful and ATS-friendly.
3. Preserve the same section structure as the input resume.

**Output Format:**
Return ONLY a valid JSON object in this structure:
{
  "tailored_resume": {
    "personalInfo": ["string", "string", ...],
    "education": ["string", "string", ...],
    "experience": ["string", "string", ...],
    "projects": ["string", "string", ...],
    "skills": ["string", "string", ...],
    "certifications": ["string", "string", ...]
  }
}
`;
}
