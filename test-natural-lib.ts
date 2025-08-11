// CommonJS version - works with regular node command
const natural = require('natural');

console.log("=== Testing Natural Library ===");

// Create tokenizer
const tokenizer = new natural.WordTokenizer();

// Sample text
const text = "Hello, how are you? I am fine, thank you. We need a React developer with TypeScript experience.";

console.log("Original text:", text);
console.log("\n=== TOKENIZATION ===");

// Tokenize the text
const tokens = tokenizer.tokenize(text);
console.log("Tokens:", tokens);
console.log("Total tokens:", tokens.length);

// Test with job description
const jobText = "We need a Senior React Developer with 3+ years of JavaScript experience. Must have TypeScript, Redux skills.";

console.log("\n=== JOB DESCRIPTION TEST ===");
console.log("Job text:", jobText);

const jobTokens = tokenizer.tokenize(jobText);
console.log("Job tokens:", jobTokens);

// Simple skill detection
const techSkills = ['React', 'JavaScript', 'TypeScript', 'Redux', 'Node.js', 'HTML', 'CSS'];
const foundSkills = jobTokens.filter(token => 
  techSkills.some(skill => skill.toLowerCase() === token.toLowerCase())
);

console.log("Technical skills found:", foundSkills);

// Test stemming
console.log("\n=== STEMMING TEST ===");
const words = ['developing', 'developer', 'development', 'experiences', 'experienced'];
words.forEach(word => {
  const stem = natural.PorterStemmer.stem(word);
  console.log(`${word} -> ${stem}`);
});

console.log("\n✅ Natural library is working correctly!");