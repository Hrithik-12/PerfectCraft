import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { buildPrompt } from "../Functions/function"; // Adjust path if needed

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jdData } = await request.json();

    if (!resumeData || !jdData) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // --- ADD THIS FOR DEBUGGING ---
    console.log("Received resume nouns:", resumeData.nouns_by_section);
    console.log("Received JD nouns:", jdData.nouns);
    // -----------------------------

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = buildPrompt(resumeData, jdData);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // --- ADD THIS FOR DEBUGGING ---
    console.log("AI Response Text:", responseText);
    // -----------------------------

    // It's safer to wrap the JSON.parse in its own try-catch
    let tailoredData;
    try {
      tailoredData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      console.error(
        "The AI did not return valid JSON. Response was:",
        responseText
      );
      throw new Error("AI response was not valid JSON.");
    }

    return NextResponse.json({ success: true, data: tailoredData });
  } catch (error: any) {
    // --- THIS IS THE MOST IMPORTANT CHANGE ---
    console.error("[API TAILOR ERROR]", error);
    // Return a more specific error message
    return NextResponse.json(
      { error: "Failed to tailor resume with AI", details: error.message },
      { status: 500 }
    );
    // ----------------------------------------
  }
}
