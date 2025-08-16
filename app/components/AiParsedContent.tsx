"use client";

import { useState } from "react";
// ... your other imports for parsing ...

export default function YourParserComponent() {
  // Add the missing state variables
  const [resumeData, setResumeData] = useState<File | null>(null);
  const [jdData, setJdData] = useState<string>("");
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);
  const [parsedJdData, setParsedJdData] = useState<any>(null);
  const [tailoredPoints, setTailoredPoints] = useState<
    Record<string, string[]> | string[] | null
  >(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingJd, setIsParsingJd] = useState(false);

  // Function to parse resume PDF
  const handleResumeParse = async (file: File) => {
    if (!file) return;

    setIsParsingResume(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const result = await response.json();
      console.log(result);
      setParsedResumeData(result.data);
      setResumeData(file);
    } catch (error) {
      console.error("Resume parsing failed:", error);
      alert("Failed to parse resume PDF");
    } finally {
      setIsParsingResume(false);
    }
  };

  // Function to parse job description
  const handleJdParse = async () => {
    if (!jdData.trim()) {
      alert("Please enter a job description first.");
      return;
    }

    setIsParsingJd(true);

    try {
      // Use the tokenizeText function from your JDparser
      const { tokenizeText } = await import("../lib/JDparser");
      const extractedTokens = tokenizeText(jdData);
      setParsedJdData(extractedTokens);
    } catch (error) {
      console.error("JD parsing failed:", error);
      alert("Failed to parse job description");
    } finally {
      setIsParsingJd(false);
    }
  };

  // This function calls your new backend API route
  const handleTailorResume = async () => {
    // Make sure you have parsed both the resume and the JD first
    // You'll need to get `parsedResumeData` and `parsedJdData` from your state
    if (!parsedResumeData || !parsedJdData) {
      alert("Please parse both a resume and a job description first.");
      return;
    }

    setIsTailoring(true);
    setTailoredPoints(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: parsedResumeData,
          jdData: parsedJdData,
        }),
      });
      console.log("Response status:", response);
      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const result = await response.json();
      const data = result?.data;
      console.log("DATA TO DISPLAY : ", data);
      if (
        data?.tailored_resume &&
        typeof data.tailored_resume === "object" &&
        !Array.isArray(data.tailored_resume)
      ) {
        setTailoredPoints(data.tailored_resume as Record<string, string[]>);
        console.log(Object.entries(data.tailored_resume));
      } else if (Array.isArray(data?.tailored_bullet_points)) {
        setTailoredPoints(data.tailored_bullet_points as string[]);
      } else {
        console.error("Unexpected AI response shape:", result);
        alert("Unexpected AI response format");
      }
    } catch (error) {
      console.error("Tailoring failed:", error);
      alert("An error occurred while tailoring the resume.");
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">AI Resume Tailor</h1>

      {/* Resume Upload Section */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">📄 Upload Resume (PDF)</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            e.target.files?.[0] && handleResumeParse(e.target.files[0])
          }
          className="mb-4"
        />
        {isParsingResume && <p className="text-blue-600">Parsing resume...</p>}
        {parsedResumeData && (
          <p className="text-green-600">✅ Resume parsed successfully!</p>
        )}
      </div>

      {/* Job Description Input Section */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">💼 Job Description</h2>
        <textarea
          value={jdData}
          onChange={(e) => setJdData(e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 mb-4"
          placeholder="Paste the job description here..."
        />
        <button
          onClick={handleJdParse}
          disabled={isParsingJd || !jdData.trim()}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {isParsingJd ? "Parsing..." : "Parse Job Description"}
        </button>
        {parsedJdData && (
          <p className="text-green-600 mt-2">
            ✅ Job description parsed successfully!
          </p>
        )}
      </div>

      {/* AI Tailoring Button */}
      <div className="my-8 text-center">
        <button
          onClick={handleTailorResume}
          disabled={isTailoring || !parsedResumeData || !parsedJdData}
          className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-400 transition-all text-lg"
        >
          {isTailoring
            ? "🤖 Tailoring with AI..."
            : "✨ Tailor My Resume with AI"}
        </button>
      </div>

      {/* Display the AI Results (Array of bullet points) */}
      {tailoredPoints && Array.isArray(tailoredPoints) && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-purple-200">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            🎯 AI-Tailored Experience Section
          </h2>
          <ul className="list-disc list-inside space-y-3">
            {tailoredPoints.map((point, index) => (
              <li key={index} className="text-gray-700 text-lg leading-relaxed">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display the AI Results (Sectioned resume) */}
      {tailoredPoints && !Array.isArray(tailoredPoints) && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-purple-200">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            🎯 AI-Tailored Resume
          </h2>
          {Object.entries(tailoredPoints as Record<string, string[]>).map(
            ([section, items]) =>
              section != "projects" ? (
                <div key={section} className="mb-6">
                  <h3 className="text-xl font-semibold capitalize mb-2">
                    {section}
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {(items || []).map((point: string, index: number) => (
                      <li key={index} className="text-gray-700 text-lg">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div key={section} className="mb-6">
                  <h3 className="text-xl font-semibold capitalize mb-2">
                    {section}
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {(items || []).map((project: any, index: number) => (
                      <>
                        <h2
                          key={index}
                          className="text-gray-700 text-lg font-semibold"
                        >
                          {project.projectName}
                        </h2>
                        <div className="ml-2">
                          <ul className="list-disc list-inside space-y-2">
                            {(project.description || []).map(
                              (point: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-gray-700 text-lg"
                                >
                                  {point}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
