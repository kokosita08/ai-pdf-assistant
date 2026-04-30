"use client";

// This is the main page of the app.
// It coordinates everything: upload, chat, and state management.
// "use client" means this runs in the browser (not just on the server).

import React, { useRef, useState } from "react";
import { ChatMessage, UploadState, AskState } from "@/types";
import PdfUploader from "@/components/PdfUploader";
import QuestionInput from "@/components/QuestionInput";
import ChatBubble from "@/components/ChatBubble";
import Disclaimer from "@/components/Disclaimer";

// Helper to generate unique IDs for messages
function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function HomePage() {
  // --- State ---
  // All the data our app needs to track. Think of state as the app's memory.

  // PDF upload state
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [pdfText, setPdfText] = useState<string | null>(null); // Extracted text
  const [fileName, setFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [wasTruncated, setWasTruncated] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [askState, setAskState] = useState<AskState>("idle");
  const [askError, setAskError] = useState<string | null>(null);

  // "Explain Simply" toggle
  const [explainSimply, setExplainSimply] = useState(false);

  // This ref lets us auto-scroll the chat to the bottom after a new message
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  // Called when user picks a PDF file
  async function handleFileUpload(file: File) {
    // Reset everything before starting a new upload
    setUploadState("loading");
    setUploadError(null);
    setPdfText(null);
    setFileName(null);
    setPageCount(null);
    setWasTruncated(false);
    setMessages([]); // Clear chat when a new PDF is uploaded
    setAskError(null);

    try {
      // Create a FormData object — this is how we send files to APIs
      const formData = new FormData();
      formData.append("file", file);

      // Send the file to our server-side API route
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // The server returned an error (e.g., file too large)
        setUploadState("error");
        setUploadError(data.error || "Upload failed. Please try again.");
        return;
      }

      // Success! Save the extracted text and metadata
      setPdfText(data.text);
      setFileName(file.name);
      setPageCount(data.pageCount);
      setWasTruncated(data.wasTruncated);
      setUploadState("success");
    } catch (error) {
      // Network error or unexpected failure
      console.error("Upload error:", error);
      setUploadState("error");
      setUploadError(
        "Could not connect to the server. Please check your connection and try again."
      );
    }
  }

  // Called when user submits a question
  async function handleAskQuestion(question: string) {
    // Safety check — don't proceed if there's no PDF text
    if (!pdfText) return;
    // Prevent multiple simultaneous requests
    if (askState === "loading") return;

    setAskState("loading");
    setAskError(null);

    // Optimistically add the question to the chat immediately
    // (we'll add the answer when it comes back)
    const messageId = makeId();
    const newMessage: ChatMessage = {
      id: messageId,
      question,
      answer: "", // Empty for now — will be filled in
      explainSimply,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Scroll chat to bottom
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      // Send question + PDF text to our AI API route
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          pdfText,
          explainSimply,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returned an error — remove the empty message and show error
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        setAskError(data.error || "Failed to get an answer. Please try again.");
        setAskState("error");
        return;
      }

      // Update the message with the real answer
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, answer: data.answer } : m
        )
      );

      setAskState("idle");
    } catch (error) {
      console.error("Ask error:", error);
      // Remove the empty placeholder message
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setAskError(
        "Could not connect. Please check your internet and try again."
      );
      setAskState("error");
    }

    // Scroll to bottom again after answer loads
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  const hasPdf = uploadState === "success" && pdfText !== null;

  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      {/* ===== HEADER ===== */}
      <header className="w-full border-b border-cream-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage-600 flex items-center justify-center text-lg">
              📚
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink-800 leading-tight">
                AI PDF Assistant
              </h1>
              <p className="text-xs text-ink-400">
                Upload · Ask · Understand
              </p>
            </div>
          </div>
          {/* Status chip showing upload state */}
          {hasPdf && (
            <div className="flex items-center gap-1.5 bg-sage-100 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
              <span className="text-xs font-medium text-sage-700">PDF Ready</span>
            </div>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ===== UPLOAD SECTION ===== */}
        <section aria-label="Upload PDF">
          <div className="mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sage-600 text-white text-xs flex items-center justify-center font-bold">
              1
            </span>
            <h2 className="text-sm font-semibold text-ink-600 uppercase tracking-wide">
              Upload Your PDF
            </h2>
          </div>
          <PdfUploader
            uploadState={uploadState}
            fileName={fileName}
            pageCount={pageCount}
            wasTruncated={wasTruncated}
            errorMessage={uploadError}
            onFileUpload={handleFileUpload}
          />
        </section>

        {/* ===== CHAT SECTION ===== */}
        <section aria-label="Chat with your PDF">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
              ${hasPdf ? "bg-sage-600 text-white" : "bg-ink-200 text-ink-400"}`}
            >
              2
            </span>
            <h2
              className={`text-sm font-semibold uppercase tracking-wide
              ${hasPdf ? "text-ink-600" : "text-ink-400"}`}
            >
              Ask Questions
            </h2>
          </div>

          {/* Chat messages area */}
          <div
            className="min-h-[240px] bg-cream-100 rounded-3xl p-5 mb-4 overflow-y-auto scrollbar-thin"
            style={{ maxHeight: "480px" }}
            aria-live="polite"
            aria-label="Chat messages"
          >
            {/* Empty state — shown when no messages yet */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                {hasPdf ? (
                  <>
                    <div className="text-3xl mb-3">💬</div>
                    <p className="text-sm font-medium text-ink-500">
                      Your PDF is ready!
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      Ask any question about it below.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-3">☝️</div>
                    <p className="text-sm font-medium text-ink-500">
                      Upload a PDF above to get started
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      Then ask any question about its contents.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Render each message — only show messages that have an answer */}
            {messages
              .filter((m) => m.answer !== "")
              .map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

            {/* Loading bubble — shown while waiting for AI response */}
            {askState === "loading" && (
              <div className="flex justify-start mb-6 animate-fade-in">
                <div className="rounded-3xl rounded-tl-lg bg-white border border-ink-100 px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-ink-400 ml-1">Thinking…</span>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={chatBottomRef} />
          </div>

          {/* Error message for failed questions */}
          {askError && (
            <div
              className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3"
              role="alert"
            >
              <p className="text-sm text-red-600">{askError}</p>
              <button
                className="text-xs text-red-500 underline mt-1"
                onClick={() => setAskError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Question input */}
          <QuestionInput
            askState={askState}
            hasPdf={hasPdf}
            explainSimply={explainSimply}
            onExplainSimplyChange={setExplainSimply}
            onSubmit={handleAskQuestion}
          />
        </section>

        {/* ===== DISCLAIMER SECTION ===== */}
        <Disclaimer />

        {/* Bottom padding so content isn't too close to footer */}
        <div className="h-4" />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="text-center py-6 border-t border-cream-200">
        <p className="text-xs text-ink-400">
          Built with Claude AI · Your data stays in your session and is never stored
        </p>
      </footer>
    </div>
  );
}
