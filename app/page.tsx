// app/page.js

import TestPdfPage from "./components/ParsePdf";


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          TailorMaster - Resume Parser
        </h1>
        <TestPdfPage/>
      </div>
    </main>
  );
}