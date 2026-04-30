// This is the SERVER-SIDE API route that reads text from uploaded PDFs.

import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TEXT_CHARS = 50000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded. Please select a PDF." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Please upload a PDF under 5 MB." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      return NextResponse.json(
        { error: "This PDF could not be read properly. Please try a text-based PDF." },
        { status: 422 }
      );
    }

    const rawText = pdfData.text?.trim();
    if (!rawText || rawText.length < 20) {
      return NextResponse.json(
        { error: "This PDF could not be read properly. It may be a scanned image. Please try a text-based PDF." },
        { status: 422 }
      );
    }

    const extractedText =
      rawText.length > MAX_TEXT_CHARS
        ? rawText.slice(0, MAX_TEXT_CHARS) + "\n\n[Note: Document was truncated due to length.]"
        : rawText;

    return NextResponse.json({
      text: extractedText,
      pageCount: pdfData.numpages,
      wasTruncated: rawText.length > MAX_TEXT_CHARS,
    });
  } catch (error) {
    console.error("Unexpected error in /api/extract:", error);
    return NextResponse.json(
      { error: "Something went wrong while reading the PDF. Please try again." },
      { status: 500 }
    );
  }
}