// app/page.js

import TestPdfPage from "./components/ParsePdf";
import JobDescriptionParser from "./components/PasteJobDescription";
import AiParsedContent from "./components/AiParsedContent";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 ">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          TailorMaster - Resume Parser & AI Tailor
        </h1>
        
        {/* AI Integration Section */}
        <div className="mb-12">
          <AiParsedContent />
        </div>
        
        <hr className="my-12 border-gray-300" />
        
        {/* Original Components */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Original Parser Components</h2>
          <TestPdfPage/>
        </div>
        
        <div className="mb-8">
          <JobDescriptionParser />
        </div>
      </div>
    </main>
  );
}