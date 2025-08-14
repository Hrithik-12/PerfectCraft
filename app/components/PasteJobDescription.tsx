"use client";

import { useState } from 'react';
// Import the new function and interface
import { tokenizeText, TokenizedOutput } from '../lib/JDparser';

export default function JobDescriptionParser() {
  const [jobDescription, setJobDescription] = useState<string>('');
  // Update state to hold the new token structure
  const [tokens, setTokens] = useState<TokenizedOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleParse = () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description first.");
      return;
    }
    setIsLoading(true);
    
    setTimeout(() => {
      // Call the new tokenization function
      const extractedTokens = tokenizeText(jobDescription);
      setTokens(extractedTokens);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Text Tokenizer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section (No changes here) */}
        <div className="flex flex-col">
          <label htmlFor="jd-input" className="mb-2 font-semibold">
            Paste Text Below:
          </label>
          <textarea
            id="jd-input"
            rows={15}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Paste any text here to see it tokenized..."
          />
          <button
            onClick={handleParse}
            disabled={isLoading}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Tokenizing...' : 'Tokenize Text'}
          </button>
        </div>

        {/* Output Section (Updated to display tokens) */}
        <div className="bg-gray-50 p-4 rounded-lg border h-full max-h-[600px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 sticky top-0 bg-gray-50">Extracted Tokens</h2>
          {tokens ? (
            <div className="space-y-4">
              <TokenSection title="Nouns (Potential Keywords) 🧠" items={tokens.nouns} />
              <TokenSection title="Verbs (Actions) 🏃" items={tokens.verbs} />
              <TokenSection title="Sentences 📝" items={tokens.sentences} />
            </div>
          ) : (
            <p className="text-gray-500 italic">Tokens will appear here after analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component to display sections of tokens
function TokenSection({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}