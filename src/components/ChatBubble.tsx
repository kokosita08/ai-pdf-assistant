"use client";

// This component renders one question + answer pair in the chat.
// It includes the Read Aloud button using the browser's Speech Synthesis API.

import React, { useState } from "react";
import { ChatMessage } from "@/types";

type ChatBubbleProps = {
  message: ChatMessage;
};

export default function ChatBubble({ message }: ChatBubbleProps) {
  // Track whether the browser is currently speaking
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Track if speech synthesis is not available in this browser
  const [speechUnavailable, setSpeechUnavailable] = useState(false);

  // Check if browser supports speech synthesis
  function checkSpeechSupport(): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechUnavailable(true);
      return false;
    }
    return true;
  }

  // Start reading the answer aloud
  function handleReadAloud() {
    if (!checkSpeechSupport()) return;

    // Stop any existing speech first
    window.speechSynthesis.cancel();

    // Create a new speech request
    const utterance = new SpeechSynthesisUtterance(message.answer);
    utterance.rate = 0.95; // Slightly slower — easier to follow
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Update state when speech starts and ends
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  // Stop reading aloud
  function handleStopReading() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  // Format timestamp as "2:34 PM"
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Parse the AI answer into sections if "Explain Simply" was used.
  // Claude formats the response with these headers when that mode is on.
  function parseAnswer(answer: string) {
    const documentSection = answer.match(
      /\*\*Answer from Document:\*\*\n([\s\S]*?)(?=\*\*Simple Explanation:\*\*|$)/
    );
    const simpleSection = answer.match(
      /\*\*Simple Explanation:\*\*\n([\s\S]*?)$/
    );

    if (documentSection && simpleSection) {
      return {
        documentAnswer: documentSection[1].trim(),
        simpleExplanation: simpleSection[1].trim(),
        isParsed: true,
      };
    }

    // Fallback: just show the raw answer
    return {
      documentAnswer: answer,
      simpleExplanation: null,
      isParsed: false,
    };
  }

  const parsed = parseAnswer(message.answer);

  return (
    <div className="animate-slide-up w-full">
      {/* QUESTION BUBBLE — shown on the right side like user messages in a chat */}
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] rounded-3xl rounded-tr-lg bg-sage-600 px-4 py-3 shadow-sm">
          <p className="text-sm text-white leading-relaxed">{message.question}</p>
          <p className="text-xs text-sage-200 mt-1 text-right">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>

      {/* ANSWER BUBBLE — shown on the left like AI responses */}
      <div className="flex justify-start mb-6">
        <div className="max-w-[90%] w-full">
          {/* AI icon + label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center text-xs">
              🤖
            </div>
            <span className="text-xs text-ink-400 font-medium">AI Assistant</span>
          </div>

          {/* Answer card */}
          <div className="rounded-3xl rounded-tl-lg bg-white border border-ink-100 shadow-sm overflow-hidden">

            {/* If "Explain Simply" was on, show two sections */}
            {message.explainSimply && parsed.simpleExplanation ? (
              <>
                {/* Section 1: Document-based answer */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-sage-400" />
                    <p className="text-xs font-semibold text-sage-700 uppercase tracking-wide">
                      Answer from Document
                    </p>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                    {parsed.documentAnswer}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-ink-100 mx-5" />

                {/* Section 2: Simple explanation */}
                <div className="px-5 pt-4 pb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-warm-400" />
                    <p className="text-xs font-semibold text-warm-600 uppercase tracking-wide">
                      Simple Explanation
                    </p>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                    {parsed.simpleExplanation}
                  </p>
                </div>
              </>
            ) : (
              /* Regular answer — just show the text */
              <div className="px-5 py-5">
                <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                  {parsed.documentAnswer}
                </p>
              </div>
            )}

            {/* Read Aloud button area */}
            <div className="px-5 pb-4 pt-1 border-t border-ink-50 flex items-center gap-2 flex-wrap">
              {speechUnavailable ? (
                <p className="text-xs text-ink-400">
                  Read Aloud is not supported in this browser.
                </p>
              ) : (
                <>
                  {/* Show "Read Aloud" or "Stop Reading" depending on state */}
                  {!isSpeaking ? (
                    <button
                      onClick={handleReadAloud}
                      aria-label="Read this response aloud"
                      className="flex items-center gap-1.5 text-xs font-medium text-ink-500
                        hover:text-sage-700 transition-colors duration-150 rounded-xl
                        hover:bg-sage-100 px-3 py-1.5"
                    >
                      <span>🔊</span>
                      <span>Read Aloud</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopReading}
                      aria-label="Stop reading aloud"
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500
                        hover:text-red-700 transition-colors duration-150 rounded-xl
                        hover:bg-red-50 px-3 py-1.5 animate-pulse"
                    >
                      <span>⏹</span>
                      <span>Stop Reading</span>
                    </button>
                  )}
                </>
              )}
              <span className="text-ink-200 text-xs">·</span>
              <p className="text-xs text-ink-300">AI-generated · May not be fully accurate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
