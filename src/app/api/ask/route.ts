// Server-side API route — calls Claude AI
// API key stays on the server, never sent to the browser

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const MAX_QUESTION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 40000;

// Personality mode system prompt additions
function getPersonalityInstruction(mode: string): string {
  switch (mode) {
    case "beginner":
      return "Explain as if the reader is a complete beginner. Use simple words and no jargon.";
    case "child":
      return "Explain like you're talking to a curious 10-year-old. Use fun, simple language and relatable examples.";
    case "teacher":
      return "Explain like a patient, thorough teacher. Break it down into clear steps with examples.";
    case "professional":
      return "Explain in a professional, precise tone suitable for an expert audience.";
    case "storyteller":
      return "Explain as a fun storyteller — make it engaging, vivid, and entertaining while keeping the facts accurate.";
    default:
      return "Explain clearly and helpfully.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, pdfText, explainSimply, personalityMode, isSummary, isMindMap } = body;

    // Validate PDF text exists
    if (!pdfText || typeof pdfText !== "string" || pdfText.trim() === "") {
      return NextResponse.json(
        { error: "No PDF content found. Please upload a PDF first." },
        { status: 400 }
      );
    }

    const trimmedContext = pdfText.slice(0, MAX_CONTEXT_LENGTH);
    const personality = getPersonalityInstruction(personalityMode || "normal");

    let systemPrompt = "";
    let userMessage = "";

    // --- SUMMARY MODE ---
    if (isSummary) {
      systemPrompt = `You are a helpful AI assistant. Summarize the provided PDF document.
Return ONLY this format:

**Summary:**
[2-3 sentence overview of the document]

**Key Points:**
• [Point 1]
• [Point 2]
• [Point 3]
• [Point 4]
• [Point 5]

Keep it concise and accurate. Only use information from the document.`;

      userMessage = `Please summarize this document:\n\n---\n${trimmedContext}\n---`;

    // --- MIND MAP MODE ---
    } else if (isMindMap) {
      systemPrompt = `You are a helpful AI assistant. Create a text-based mind map from the PDF document.
Use this EXACT format with these exact characters:

[Main Topic]
├── [Category 1]
│   ├── [Detail]
│   └── [Detail]
├── [Category 2]
│   ├── [Detail]
│   └── [Detail]
└── [Category 3]
    ├── [Detail]
    └── [Detail]

Keep it clean, accurate, and based only on the document content. Maximum 4 categories, 3 details each.`;

      userMessage = `Create a mind map for this document:\n\n---\n${trimmedContext}\n---`;

    // --- REGULAR QUESTION MODE ---
    } else {
      if (!question || typeof question !== "string" || question.trim() === "") {
        return NextResponse.json(
          { error: "Please enter a question before submitting." },
          { status: 400 }
        );
      }

      const trimmedQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);

      if (explainSimply) {
        systemPrompt = `You are a helpful AI assistant analyzing a PDF document.
Answer using ONLY information from the document.
If not found, say: "This information is not clearly found in the document."

Use this exact format:

**Answer from Document:**
[Your answer based on the PDF]

**Simple Explanation:**
[Same answer explained simply. ${personality}]`;
      } else {
        systemPrompt = `You are a helpful AI assistant analyzing a PDF document.
Answer using ONLY information from the document.
If not found, say: "This information is not clearly found in the document."
${personality}
Be clear, accurate, and do not make up information.`;
      }

      userMessage = `Document content:\n\n---\n${trimmedContext}\n---\n\nQuestion: ${trimmedQuestion}`;
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const responseContent = message.content[0];
    if (!responseContent || responseContent.type !== "text") {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer: responseContent.text,
      explainSimply: explainSimply ?? false,
    });

  } catch (error: unknown) {
    console.error("Error in /api/ask:", error);
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: "API authentication failed. Check your API key." }, { status: 500 });
      }
      if (error.status === 429) {
        return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
      }
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}