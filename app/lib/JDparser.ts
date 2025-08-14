import nlp from 'compromise';

// Define the new structure for the tokenized output
export interface TokenizedOutput {
  nouns: string[];
  verbs: string[];
  sentences: string[];
}

/**
 * This function takes text and breaks it down into grammatical components (tokens)
 * using the 'compromise' library. It does NOT perform any keyword matching.
 */
export function tokenizeText(text: string): TokenizedOutput {
  const doc = nlp(text);

  // Extract all nouns, then get a unique list
  const nouns = doc.nouns().out('array');
  const uniqueNouns = [...new Set(nouns)];

  // Extract all verbs, then get a unique list
  const verbs = doc.verbs().out('array');
  const uniqueVerbs = [...new Set(verbs)];
  
  // Extract all sentences
  const sentences = doc.sentences().out('array');

  return {
    nouns: uniqueNouns,
    verbs: uniqueVerbs,
    sentences: sentences,
  };
}