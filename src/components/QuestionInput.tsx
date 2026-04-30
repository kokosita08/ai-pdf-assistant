"use client";

// This component is the question input form at the bottom of the chat area.
// It includes the text input, Explain Simply toggle, and Submit button.

import React, { useState } from "react";
import { AskState } from "@/types";

type QuestionInputProps = {
  askState: AskState; // Is there already a request in progress?
  hasPdf: boolean; // Has a PDF been successfully uploaded?
  explainSimply: boolean; // Current value of the "Explain Simply" toggle
  onExplainSimplyChange: (value: boolean) => void; // Called when toggle changes
  onSubmit: (question: string) => void; // Called when user submits question
};

export default function QuestionInput({
  askState,
  hasPdf,
  explainSimply,
  onExplainSimplyChange,
  onSubmit,
}: QuestionInputProps) {
  // Store what the user is typing
  const [question, setQuestion] = useState("");

  // Whether the submit button should be disabled
  // Disable if: loading, no PDF uploaded, or question is empty
  const isLoading = askState === "loading";
  const canSubmit = hasPdf && question.trim().length > 0 && !isLoading;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // Prevent page reload
    if (!canSubmit) return;
    onSubmit(question.trim());
    setQuestion(""); // Clear input after submitting
  }

  // Allow submitting with Enter key (Shift+Enter for new line)
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as React.FormEvent);
    }
  }

  return (
    <div className="w-full">
      {/* Explain Simply Toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => onExplainSimplyChange(!explainSimply)}
          role="switch"
          aria-checked={explainSimply}
          aria-label="Toggle Explain Simply mode"
          className={`
            relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
            focus:ring-2 focus:ring-sage-400 focus:ring-offset-2
            ${explainSimply ? "bg-sage-600" : "bg-ink-200"}
          `}
        >
          {/* The sliding circle inside the toggle */}
          <span
            className={`
              absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${explainSimply ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </button>
        <span className="text-xs font-medium text-ink-600">
          Explain Simply
        </span>
        <span className="text-xs text-ink-400">
          — adds a beginner-friendly explanation
        </span>
      </div>

      {/* Question Input + Submit Button */}
      <div
        className={`
          flex gap-2 rounded-2xl border bg-white p-2 shadow-sm
          transition-all duration-200
          ${
            !hasPdf
              ? "border-ink-100 opacity-60"
              : "border-ink-200 focus-within:border-sage-400 focus-within:shadow-md"
          }
        `}
      >
        {/* Text area for the question */}
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasPdf
              ? "Ask a question about your PDF…"
              : "Upload a PDF above to start asking questions"
          }
          disabled={!hasPdf || isLoading}
          rows={2}
          maxLength={1000}
          aria-label="Type your question about the PDF"
          className={`
            flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink-800
            placeholder-ink-400 focus:outline-none scrollbar-thin
            ${!hasPdf || isLoading ? "cursor-not-allowed" : ""}
          `}
        />

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Submit question"
          className={`
            self-end rounded-xl px-4 py-2 text-sm font-semibold
            transition-all duration-200
            ${
              canSubmit
                ? "bg-sage-600 text-white hover:bg-sage-700 active:scale-95"
                : "bg-ink-100 text-ink-400 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? (
            // Small spinner while loading
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              Thinking…
            </span>
          ) : (
            "Ask →"
          )}
        </button>
      </div>

      {/* Character counter — helpful so users know there's a limit */}
      {question.length > 800 && (
        <p className="text-xs text-ink-400 mt-1 text-right">
          {1000 - question.length} characters remaining
        </p>
      )}

      {/* Helper text */}
      <p className="text-xs text-ink-400 mt-2">
        Press <kbd className="font-mono bg-ink-50 border border-ink-200 rounded px-1">Enter</kbd> to send ·{" "}
        <kbd className="font-mono bg-ink-50 border border-ink-200 rounded px-1">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
