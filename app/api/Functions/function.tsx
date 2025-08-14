export function extractTextFromPdfData(pdfData: any): string {
    let extractedText = '';
    
    if (pdfData.Pages && pdfData.Pages.length > 0) {
      pdfData.Pages.forEach((page: any, pageIndex: number) => {
        // Use a more distinct page separator for easier splitting later
        if (pageIndex > 0) extractedText += '\n---PAGEBREAK---\n';
        
        if (page.Texts && page.Texts.length > 0) {
          const sortedTexts = page.Texts.sort((a: any, b: any) => {
            if (a.y === b.y) {
              return a.x - b.x;
            }
            return a.y - b.y;
          });
  
          let line = '';
          let lastY = -1;
  
          sortedTexts.forEach((textElement: any) => {
            if (lastY !== -1 && textElement.y > lastY + 1) { // New line detected
               extractedText += line.trim() + '\n';
               line = '';
            }
  
            if (textElement.R && textElement.R.length > 0) {
              textElement.R.forEach((run: any) => {
                if (run.T) {
                  line += decodeURIComponent(run.T);
                }
              });
            }
            lastY = textElement.y;
          });
          // Add the last line
          extractedText += line.trim() + '\n';
        }
      });
    }
    
    return extractedText.trim();
  }


 export  function parseResumeIntoSectionsV2(text: string): any {
    // 1. Define known section headers and their corresponding keys.
    // Keep this list comprehensive.
    const sectionHeaders: { [key: string]: string[] } = {
      objective: ['objective', 'career objective', 'summary', 'profile'],
      education: ['education', 'academic details', 'academic qualifications'],
      experience: ['experience', 'work experience', 'professional experience', 'employment history'],
      projects: ['projects', 'personal projects', 'academic projects'],
      skills: ['skills', 'technical skills', 'proficiencies', 'core competencies'],
      certifications: ['certifications', 'licenses & certifications', 'courses', 'training'],
      achievements: ['achievements', 'awards', 'honors and awards'],
      contact: ['contact', 'contact information'],
    };
  
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const sections: { [key: string]: string[] } = {
      personalInfo: [] // Default section for text at the top
    };
    let currentSection: string = 'personalInfo';
  
    // 2. Group lines into sections based on normalized headers
    lines.forEach(line => {
      let isHeader = false;
      
      // Normalize the line from the PDF for a fuzzy match.
      // This removes all non-alphabetic characters and spaces.
      // e.g., "Work Experience :" becomes "workexperience"
      const normalizedLine = line.toLowerCase().replace(/[^a-z]/g, '');
  
      // Don't treat very long lines as potential headers
      if (line.length > 50) { 
          sections[currentSection].push(line);
          return;
      }
  
      for (const key in sectionHeaders) {
        // Normalize our keywords in the same way
        const normalizedKeywords = sectionHeaders[key].map(h => h.replace(/[^a-z]/g, ''));
        
        if (normalizedKeywords.includes(normalizedLine)) {
          currentSection = key;
          sections[currentSection] = []; // Initialize section array
          isHeader = true;
          break;
        }
      }
  
      if (!isHeader) {
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        sections[currentSection].push(line);
      }
    });
  
    // 3. Format the collected sections into a clean output object
    const formattedSections: { [key: string]: any } = {};
    const sectionLength: { [key: string]: number } = {}; // To store the number of skills
    for (const key in sections) {
      if (sections[key] && sections[key].length > 0) {
        if (key === 'skills') {
          const skillsList = sections[key]
            .join(' ')
            .split(/,|\s{2,}|•|∙|–|-|:/) // Split by even more delimiters
            .map(skill => skill.trim())
            .filter(skill => skill.length > 1 && skill.length < 50);
          formattedSections[key] = [...new Set(skillsList)];
          sectionLength[key]=formattedSections[key].length; // Store the number of skills
        } else {
          formattedSections[key] = sections[key].join('\n');
          sectionLength[key] = formattedSections[key].length; // Store the number of lines in other sections
        }
      }
    }
  
    return {
        data: formattedSections,
        sectionLength: sectionLength,
    };
  }