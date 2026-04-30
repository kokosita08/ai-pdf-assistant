"use client";

// This component handles the PDF file upload area.
// It shows a drag-and-drop style zone and validates the file before sending it.

import React, { useRef, useState } from "react";
import { UploadState } from "@/types";

// --- Props ---
// These are the "inputs" this component receives from the parent page
type PdfUploaderProps = {
  uploadState: UploadState; // Current state of the upload
  fileName: string | null; // Name of the uploaded file (or null if none)
  pageCount: number | null; // Number of pages extracted
  wasTruncated: boolean; // Was the PDF text cut off due to size?
  errorMessage: string | null; // Error to show the user
  onFileUpload: (file: File) => void; // Function called when user picks a file
};

export default function PdfUploader({
  uploadState,
  fileName,
  pageCount,
  wasTruncated,
  errorMessage,
  onFileUpload,
}: PdfUploaderProps) {
  // This ref lets us programmatically click the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track whether user is dragging a file over the zone
  const [isDragging, setIsDragging] = useState(false);

  // Called when user picks a file through the dialog
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset the input so the same file can be re-selected if needed
    event.target.value = "";
  }

  // Called when user drops a file onto the zone
  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  // Whether to disable the upload button (don't allow re-upload while loading)
  const isDisabled = uploadState === "loading";

  return (
    <div className="w-full">
      {/* Hidden file input — we click it programmatically */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload PDF file"
        disabled={isDisabled}
      />

      {/* Drop zone / upload button */}
      <div
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Click or drag and drop to upload a PDF"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className={`
          relative w-full rounded-3xl border-2 border-dashed p-8 text-center
          transition-all duration-200 cursor-pointer
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          ${
            isDragging
              ? "border-sage-600 bg-sage-100 scale-[1.01]"
              : uploadState === "success"
              ? "border-sage-400 bg-sage-100"
              : uploadState === "error"
              ? "border-red-300 bg-red-50"
              : "border-ink-200 bg-cream-100 hover:border-sage-400 hover:bg-sage-100"
          }
        `}
      >
        {/* Content changes based on current upload state */}

        {/* IDLE STATE — nothing uploaded yet */}
        {uploadState === "idle" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cream-200 flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <p className="font-semibold text-ink-600 text-sm">
                Drop your PDF here, or{" "}
                <span className="text-sage-600 underline underline-offset-2">
                  browse to upload
                </span>
              </p>
              <p className="text-ink-400 text-xs mt-1">PDF files only · Max 5 MB</p>
            </div>
          </div>
        )}

        {/* LOADING STATE — extracting text */}
        {uploadState === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-warm-100 flex items-center justify-center">
              {/* Simple spinning animation */}
              <div className="w-7 h-7 border-3 border-warm-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-semibold text-ink-600 text-sm animate-pulse">
              Reading your PDF…
            </p>
            <p className="text-ink-400 text-xs">This usually takes a few seconds</p>
          </div>
        )}

        {/* SUCCESS STATE — PDF was read */}
        {uploadState === "success" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center text-3xl">
              ✅
            </div>
            <div>
              <p className="font-semibold text-sage-700 text-sm">
                {fileName}
              </p>
              {pageCount && (
                <p className="text-ink-400 text-xs mt-0.5">
                  {pageCount} {pageCount === 1 ? "page" : "pages"} read
                  successfully
                </p>
              )}
              <p className="text-ink-400 text-xs mt-2 underline underline-offset-2 text-sage-600">
                Click to upload a different PDF
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE — something went wrong */}
        {uploadState === "error" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <div>
              <p className="font-semibold text-red-600 text-sm">
                {errorMessage || "Upload failed"}
              </p>
              <p className="text-ink-400 text-xs mt-2 underline underline-offset-2 text-sage-600">
                Click to try again
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Warning if the PDF was truncated */}
      {wasTruncated && uploadState === "success" && (
        <div className="mt-3 rounded-2xl bg-warm-100 border border-warm-200 px-4 py-3">
          <p className="text-xs text-warm-600 font-medium">
            ⚡ This document is large. Only the first portion was loaded to keep
            responses fast. For best results, use smaller PDFs.
          </p>
        </div>
      )}
    </div>
  );
}
