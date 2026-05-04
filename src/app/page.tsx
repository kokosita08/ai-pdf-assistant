"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChatMessage, UploadState, AskState } from "@/types";

// Helper: unique IDs for messages
function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// =============================================
// SPLASH SCREEN COMPONENT
// =============================================
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundImage: "url('/bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      animation: "splashFade 2.6s ease forwards"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(2, 30, 34, 0.45)" }} />
      <img
        src="/logo.jpg"
        alt="AbyssNote AI"
        style={{
          position: "relative",
          width: "220px", height: "220px",
          objectFit: "contain",
          borderRadius: "24px",
          animation: "splashGlow 2.5s ease forwards",
        }}
      />
    </div>
  );
}

// =============================================
// CHAT BUBBLE COMPONENT
// =============================================
function ChatBubble({ message }: { message: ChatMessage }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUnavailable, setSpeechUnavailable] = useState(false);

  function handleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechUnavailable(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.answer);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function handleStop() {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  function parseAnswer(answer: string) {
    const docMatch = answer.match(/\*\*Answer from Document:\*\*\n([\s\S]*?)(?=\*\*Simple Explanation:\*\*|$)/);
    const simpleMatch = answer.match(/\*\*Simple Explanation:\*\*\n([\s\S]*?)$/);
    if (docMatch && simpleMatch) {
      return { documentAnswer: docMatch[1].trim(), simpleExplanation: simpleMatch[1].trim(), isParsed: true };
    }
    return { documentAnswer: answer, simpleExplanation: null, isParsed: false };
  }

  const parsed = parseAnswer(message.answer);
  const time = message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="animate-slide-up w-full mb-6">
      {/* User question — right side */}
      <div className="flex justify-end mb-3">
        <div style={{
          background: "var(--user-bubble)",
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 16px",
          maxWidth: "75%"
        }}>
          <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: "1.5" }}>
            {message.question}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textAlign: "right", marginTop: "4px" }}>
            {time}
          </p>
        </div>
      </div>

      {/* AI answer — left side */}
      <div className="flex justify-start">
        <div style={{ maxWidth: "90%", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              background: "var(--accent-soft)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px"
            }}>🤖</div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>AbyssNote AI</span>
          </div>

          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px 18px 18px 18px",
            overflow: "hidden",
            boxShadow: "var(--shadow)"
          }}>
            {message.explainSimply && parsed.simpleExplanation ? (
              <>
                <div style={{ padding: "16px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                    <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      From Document
                    </span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {parsed.documentAnswer}
                  </p>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                    <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Simple Explanation
                    </span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {parsed.simpleExplanation}
                  </p>
                </div>
              </>
            ) : (
              <div style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {parsed.documentAnswer}
                </p>
              </div>
            )}

            {/* Read Aloud */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              {speechUnavailable ? (
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Read Aloud not supported in this browser.</span>
              ) : !isSpeaking ? (
                <button onClick={handleReadAloud} aria-label="Read aloud" style={{
                  fontSize: "0.7rem", color: "var(--text-muted)", background: "none",
                  border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "4px"
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  🔊 Read Aloud
                </button>
              ) : (
                <button onClick={handleStop} style={{
                  fontSize: "0.7rem", color: "#ef4444", background: "none",
                  border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "4px"
                }}>
                  ⏹ Stop Reading
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(message.answer)}
                aria-label="Copy answer"
                style={{
                  fontSize: "0.7rem", color: "var(--text-muted)", background: "none",
                  border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "4px"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                📋 Copy
              </button>
              <span style={{ color: "var(--border)", fontSize: "0.7rem" }}>·</span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>AI-generated · may not be fully accurate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN PAGE
// =============================================
export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [askState, setAskState] = useState<AskState>("idle");
  const [askError, setAskError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");

  // Feature state
  const [explainSimply, setExplainSimply] = useState(false);
  const [personalityMode, setPersonalityMode] = useState("normal");
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [mindMap, setMindMap] = useState<string | null>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [mindMapError, setMindMapError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPdf = uploadState === "success" && pdfText !== null;

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Check if splash was already shown this session
  useEffect(() => {
    if (sessionStorage.getItem("splashShown")) {
      setShowSplash(false);
    }
  }, []);

  function handleSplashDone() {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  }

  // --- FILE UPLOAD ---
  async function handleFileUpload(file: File) {
    setUploadState("loading");
    setUploadError(null);
    setPdfText(null);
    setFileName(null);
    setPageCount(null);
    setMessages([]);
    setSummary(null);
    setMindMap(null);
    setAskError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setUploadState("error");
        setUploadError(data.error || "Upload failed.");
        return;
      }
      setPdfText(data.text);
      setFileName(file.name);
      setPageCount(data.pageCount);
      setUploadState("success");
    } catch {
      setUploadState("error");
      setUploadError("Could not connect. Please check your connection.");
    }
  }

  // --- ASK QUESTION ---
  async function handleAskQuestion() {
    if (!pdfText || !question.trim() || askState === "loading") return;
    const q = question.trim();
    setQuestion("");
    setAskState("loading");
    setAskError(null);
    const id = makeId();
    setMessages(prev => [...prev, { id, question: q, answer: "", explainSimply, timestamp: new Date() }]);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, pdfText, explainSimply, personalityMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        setAskError(data.error || "Failed to get an answer.");
        setAskState("error");
        return;
      }
      setMessages(prev => prev.map(m => m.id === id ? { ...m, answer: data.answer } : m));
      setAskState("idle");
    } catch {
      setMessages(prev => prev.filter(m => m.id !== id));
      setAskError("Connection error. Please try again.");
      setAskState("error");
    }
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
  }

  // --- SUMMARIZE ---
  async function handleSummarize() {
    if (!pdfText || summaryLoading) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummary(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText, isSummary: true }),
      });
      const data = await res.json();
      if (!res.ok) { setSummaryError(data.error || "Failed to summarize."); }
      else { setSummary(data.answer); }
    } catch {
      setSummaryError("Connection error. Please try again.");
    }
    setSummaryLoading(false);
  }

  // --- MIND MAP ---
  async function handleMindMap() {
    if (!pdfText || mindMapLoading) return;
    setMindMapLoading(true);
    setMindMapError(null);
    setMindMap(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText, isMindMap: true }),
      });
      const data = await res.json();
      if (!res.ok) { setMindMapError(data.error || "Failed to create mind map."); }
      else { setMindMap(data.answer); }
    } catch {
      setMindMapError("Connection error. Please try again.");
    }
    setMindMapLoading(false);
  }

  // --- VOICE INPUT ---
  function handleVoiceInput() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceUnsupported(true); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuestion(prev => prev + (prev ? " " : "") + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }

  // Shared button style
  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-soft)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "var(--shadow)",
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      <div style={{
        minHeight: "100vh",
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        animation: "fadeIn 1.5s ease-in-out",
      }}>
  

        {/* ===== HEADER ===== */}
        <header style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(2, 30, 34, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 10,
          padding: "0 16px"
        }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Logo */}
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "var(--accent-soft)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
              }}>📖</div>
              <div>
                <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                  AbyssNote AI
                </h1>
                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Upload · Ask · Understand</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {hasPdf && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--success-bg)", border: "1px solid var(--success-border)", borderRadius: "20px", padding: "4px 12px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--accent)" }}>PDF Ready</span>
                </div>
              )}
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  border: "1px solid var(--border)", background: "transparent",
                  cursor: "pointer", fontSize: "16px", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "var(--text-secondary)"
                }}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        {/* ===== MAIN ===== */}
        <main style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 16px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ===== UPLOAD SECTION ===== */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--accent)", color: "#021E22", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
              <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Upload PDF</h2>
            </div>

            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} className="hidden" style={{ display: "none" }} />

            <div
              onClick={() => uploadState !== "loading" && fileInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f); }}
              onDragOver={e => e.preventDefault()}
              style={{
                ...cardStyle,
                textAlign: "center", cursor: uploadState === "loading" ? "not-allowed" : "pointer",
                borderStyle: "dashed",
                borderColor: uploadState === "success" ? "var(--accent)" : uploadState === "error" ? "#ef4444" : "var(--border)",
                background: uploadState === "success" ? "var(--success-bg)" : uploadState === "error" ? "var(--error-bg)" : "var(--bg-card)",
                padding: "32px 20px",
              }}
            >
              {uploadState === "idle" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontSize: "2rem" }}>📄</div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                    Drop PDF here or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>browse to upload</span>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PDF only · Max 5 MB</p>
                </div>
              )}
              {uploadState === "loading" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", animation: "pulse 1.5s infinite" }}>Reading your PDF…</p>
                </div>
              )}
              {uploadState === "success" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "2rem" }}>✅</div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--accent)" }}>{fileName}</p>
                  {pageCount && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{pageCount} pages read</p>}
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "underline" }}>Click to upload a different PDF</p>
                </div>
              )}
              {uploadState === "error" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "2rem" }}>⚠️</div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--error-text)" }}>{uploadError}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "underline" }}>Click to try again</p>
                </div>
              )}
            </div>
          </section>

          {/* ===== QUICK ACTIONS (only when PDF is ready) ===== */}
          {hasPdf && (
            <section style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleSummarize} disabled={summaryLoading} style={btnStyle(false)}>
                {summaryLoading ? "⏳" : "📋"} {summaryLoading ? "Summarizing…" : "Summarize PDF"}
              </button>
              <button onClick={handleMindMap} disabled={mindMapLoading} style={btnStyle(false)}>
                {mindMapLoading ? "⏳" : "🗺️"} {mindMapLoading ? "Building…" : "Create Mind Map"}
              </button>
            </section>
          )}

          {/* Summary Card */}
          {(summary || summaryError) && (
            <div style={{ ...cardStyle, animation: "slideUp 0.4s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>📋 PDF Summary</h3>
                <button onClick={() => setSummary(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem" }}>✕ Close</button>
              </div>
              {summaryError ? (
                <p style={{ color: "var(--error-text)", fontSize: "0.875rem" }}>{summaryError}</p>
              ) : (
                <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{summary}</p>
              )}
            </div>
          )}

          {/* Mind Map Card */}
{(mindMap || mindMapError) && (
  <div style={{ ...cardStyle, animation: "slideUp 0.4s ease-out" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>🗺️ Mind Map</h3>
      <button onClick={() => setMindMap(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem" }}>✕ Close</button>
    </div>
    {mindMapError ? (
      <p style={{ color: "var(--error-text)", fontSize: "0.875rem" }}>{mindMapError}</p>
    ) : (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {mindMap?.split('\n').filter(line => line.trim()).map((line, i) => {
          const isMain = !line.includes('├') && !line.includes('│') && !line.includes('└') && line.trim().length > 0;
          const isCategory = line.includes('├──') && !line.includes('│   ├') && !line.includes('│   └');
          const isDetail = line.includes('│   ├') || line.includes('│   └') || (line.includes('    ├') || line.includes('    └'));
          const text = line.replace(/[├└│─\[\]]/g, '').trim();
          if (!text) return null;

          if (isMain) return (
            <div key={i} style={{
              background: "var(--accent)", color: "#021E22",
              padding: "10px 18px", borderRadius: "12px",
              fontWeight: 700, fontSize: "0.95rem",
              marginBottom: "16px", display: "inline-block",
              boxShadow: "0 4px 15px rgba(30, 202, 211, 0.3)"
            }}>{text}</div>
          );

          if (isCategory) return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginBottom: "10px", marginLeft: "20px"
            }}>
              <div style={{ width: "2px", height: "100%", background: "var(--accent)", opacity: 0.4, alignSelf: "stretch" }} />
              <div style={{
                background: "rgba(30, 202, 211, 0.12)",
                border: "1px solid rgba(30, 202, 211, 0.3)",
                padding: "8px 14px", borderRadius: "10px",
                fontSize: "0.85rem", fontWeight: 600,
                color: "var(--text-primary)", flex: 1
              }}>
                <span style={{ color: "var(--accent)", marginRight: "8px" }}>◆</span>
                {text}
              </div>
            </div>
          );

          if (isDetail) return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "6px", marginLeft: "52px"
            }}>
              <span style={{ color: "var(--accent)", opacity: 0.5, fontSize: "0.7rem" }}>▸</span>
              <div style={{
                fontSize: "0.8rem", color: "var(--text-secondary)",
                background: "rgba(255,255,255,0.04)",
                padding: "5px 12px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)"
              }}>{text}</div>
            </div>
          );

          return null;
        })}
      </div>
    )}
  </div>
)}

          {/* ===== CHAT SECTION ===== */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{
                width: "22px", height: "22px", borderRadius: "50%",
                background: hasPdf ? "var(--accent)" : "var(--border)",
                color: hasPdf ? "#021E22" : "var(--text-muted)",
                fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center"
              }}>2</span>
              <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: hasPdf ? "var(--text-secondary)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ask Questions</h2>
            </div>

            {/* Chat messages */}
            <div style={{
              ...cardStyle,
              minHeight: "220px", maxHeight: "460px", overflowY: "auto",
              marginBottom: "16px", padding: "20px"
            }}>
              {messages.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{hasPdf ? "💬" : "☝️"}</div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                    {hasPdf ? "Your PDF is ready!" : "Upload a PDF above to get started"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    {hasPdf ? "Ask any question below." : "Then ask any question about it."}
                  </p>
                </div>
              )}
              {messages.filter(m => m.answer !== "").map(m => <ChatBubble key={m.id} message={m} />)}
              {askState === "loading" && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px 18px 18px 18px", width: "fit-content" }}>
                  {[0, 150, 300].map(d => (
                    <span key={d} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: `pulse 1.2s ${d}ms infinite` }} />
                  ))}
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "4px" }}>Thinking…</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Error */}
            {askError && (
              <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--error-text)" }}>{askError}</p>
                <button onClick={() => setAskError(null)} style={{ fontSize: "0.75rem", color: "var(--error-text)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginTop: "4px" }}>Dismiss</button>
              </div>
            )}

            {/* Options row */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Explain Simply toggle */}
              <button
                onClick={() => setExplainSimply(!explainSimply)}
                style={btnStyle(explainSimply)}
              >
                <span style={{
                  width: "28px", height: "15px", borderRadius: "8px",
                  background: explainSimply ? "var(--accent)" : "var(--border)",
                  display: "inline-flex", alignItems: "center",
                  padding: "2px", transition: "background 0.2s"
                }}>
                  <span style={{
                    width: "11px", height: "11px", borderRadius: "50%", background: "white",
                    transform: explainSimply ? "translateX(13px)" : "translateX(0)",
                    transition: "transform 0.2s", display: "block"
                  }} />
                </span>
                Explain Simply
              </button>

              {/* Personality mode */}
              <select
                value={personalityMode}
                onChange={e => setPersonalityMode(e.target.value)}
                style={{
                  padding: "7px 12px", borderRadius: "10px", fontSize: "0.8rem",
                  border: "1px solid var(--border)", background: "var(--bg-input)",
                  color: "var(--text-secondary)", cursor: "pointer", outline: "none"
                }}
              >
                <option value="normal">🎯 Normal</option>
                <option value="beginner">🌱 Beginner</option>
                <option value="child">🧒 10-year-old</option>
                <option value="teacher">📚 Teacher</option>
                <option value="professional">💼 Professional</option>
                <option value="storyteller">✨ Fun Storyteller</option>
              </select>
            </div>

            {/* Question input */}
            <div style={{
              display: "flex", gap: "8px", alignItems: "flex-end",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "8px",
              boxShadow: hasPdf ? "var(--shadow-accent)" : "none",
              transition: "border-color 0.2s"
            }}>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAskQuestion(); } }}
                placeholder={hasPdf ? "Ask a question about your PDF…" : "Upload a PDF above first"}
                disabled={!hasPdf || askState === "loading"}
                rows={2}
                maxLength={1000}
                style={{
                  flex: 1, resize: "none", background: "transparent", border: "none", outline: "none",
                  fontSize: "0.875rem", color: "var(--text-primary)", padding: "4px 8px",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              {/* Voice button */}
              <button
                onClick={handleVoiceInput}
                disabled={!hasPdf || askState === "loading"}
                title={voiceUnsupported ? "Voice not supported" : "Voice input"}
                style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  border: "1px solid var(--border)", background: isListening ? "var(--accent-soft)" : "transparent",
                  color: isListening ? "var(--accent)" : "var(--text-muted)",
                  cursor: hasPdf ? "pointer" : "not-allowed", fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}
              >
                🎤
              </button>
              {/* Submit button */}
              <button
                onClick={handleAskQuestion}
                disabled={!hasPdf || !question.trim() || askState === "loading"}
                style={{
                  padding: "8px 18px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600,
                  border: "none", cursor: hasPdf && question.trim() && askState !== "loading" ? "pointer" : "not-allowed",
                  background: hasPdf && question.trim() && askState !== "loading" ? "var(--accent)" : "var(--border)",
                  color: hasPdf && question.trim() && askState !== "loading" ? "#021E22" : "var(--text-muted)",
                  transition: "all 0.15s ease", flexShrink: 0
                }}
              >
                {askState === "loading" ? "…" : "Ask →"}
              </button>
            </div>

            {voiceUnsupported && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                Voice input is not supported in this browser.
              </p>
            )}
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </section>

          {/* ===== DISCLAIMER ===== */}
          <div style={{ ...cardStyle, background: "transparent", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Good to know</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                ["📏", "Max file size: 5 MB"],
                ["📝", "Only text-based PDFs supported best"],
                ["🖼️", "Scanned PDFs may not work"],
                ["🤖", "AI responses may not be fully accurate"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.875rem", flexShrink: 0 }}>{icon}</span>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: "16px" }} />
        </main>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "20px 16px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            AbyssNote AI · Your data stays in your session and is never stored
          </p>
        </footer>
      </div>
    </>
  );
}