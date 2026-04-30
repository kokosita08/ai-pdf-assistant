// This file defines the "shapes" of data used throughout the app.
// TypeScript uses these to catch mistakes before they become bugs.

// Represents a single conversation message (question + answer pair)
export type ChatMessage = {
  id: string; // Unique ID for this message (used by React for rendering)
  question: string; // What the user asked
  answer: string; // What the AI replied
  explainSimply: boolean; // Whether "Explain Simply" mode was on
  timestamp: Date; // When this message was created
};

// Represents the state of the PDF upload
export type UploadState =
  | "idle" // Nothing uploaded yet
  | "loading" // Currently extracting text
  | "success" // PDF was read successfully
  | "error"; // Something went wrong

// Represents the state of an AI request
export type AskState =
  | "idle" // Not asking anything right now
  | "loading" // Waiting for Claude to respond
  | "error"; // Something went wrong
