'use client';

import { useState } from 'react';

export default function TestPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to parse PDF' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>PDF Parser Test</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Parsing...' : 'Parse PDF'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Result:</h2>
          <pre style={{ 
            background: '#f4f4f4', 
            padding: '10px', 
            overflow: 'auto',
            maxHeight: '500px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}