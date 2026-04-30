// This is the server-side API route that answers questions using Google Gemini.
// The API key never touches the browser — it only lives here on the server.

import { NextRequest, NextResponse } from "next/server";

// --- Constants ---
const MAX_QUESTION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 40000;

// The Gemini API endpoint — we use gemini-1.5-flash which is free
const GEMINI_API_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, pdfText, explainSimply } = body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Please enter a question before submitting." },
        { status: 400 }
      );
    }

    if (!pdfText || typeof pdfText !== "string" || pdfText.trim() === "") {
      return NextResponse.json(
        { error: "No PDF content found. Please upload a PDF first." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured. Please check your setup." },
        { status: 500 }
      );
    }

    const trimmedQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);
    const trimmedContext = pdfText.slice(0, MAX_CONTEXT_LENGTH);

    const prompt = explainSimply
      ? `You are a helpful AI assistant analyzing a PDF document.

RULES:
- Answer using ONLY information found in the document below
- If the answer is not in the document, say: "This information is not clearly found in the document."
- Use this exact format:

**Answer from Document:**
[Your answer based on the PDF]

**Simple Explanation:**
[The same answer explained in simple, friendly language like you're explaining to a 12-year-old]

---
DOCUMENT CONTENT:
${trimmedContext}
---

QUESTION: ${trimmedQuestion}`
      : `You are a helpful AI assistant analyzing a PDF document.

RULES:
- Answer using ONLY information found in the document below
- Be clear and accurate
- If the answer is not in the document, say: "This information is not clearly found in the document."
- Do not make up information

---
DOCUMENT CONTENT:
${trimmedContext}
---

QUESTION: ${trimmedQuestion}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "The AI service returned an error. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiAnswer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiAnswer) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer: aiAnswer,
      explainSimply: explainSimply ?? false,
    });
  } catch (error) {
    console.error("Unexpected error in /api/ask:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please check your connection and try again." },
      { status: 500 }
    );
  }
}