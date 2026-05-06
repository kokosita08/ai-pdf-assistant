# AbyssNote AI

> Upload any PDF. Ask questions. Get instant AI-powered answers.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-1ECAD3?style=for-the-badge&logo=vercel)](https://ai-pdf-assistant-six.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Claude AI](https://img.shields.io/badge/Claude-AI-D97706?style=for-the-badge)](https://anthropic.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## Overview

AbyssNote AI is a full-stack web application that transforms how you interact with documents. Instead of reading through long PDFs, you upload them and ask questions in plain English — receiving accurate, context-aware answers powered by Claude AI.

The app requires no login, stores no user data, and works entirely in the browser session. It was designed to be accessible, intuitive, and useful for students, professionals, and anyone who works with documents regularly.

---

## Live Demo

🔗 **[https://ai-pdf-assistant-six.vercel.app](https://ai-pdf-assistant-six.vercel.app/)**

No account required. Upload a PDF and start immediately.

---

## Features

### Core Functionality
- **PDF Upload** — Drag-and-drop or click to upload any text-based PDF (up to 5 MB)
- **AI Question & Answer** — Ask any question about your document and receive accurate answers
- **PDF Summarizer** — Generate a concise summary with structured key points
- **Mind Map Generator** — Visualize document structure as a styled, readable mind map

### AI Interaction Modes
- **Explain Simply** — Dual-response format: document answer + simplified explanation
- **Personality Modes** — Six response styles: Normal, Beginner, 10-Year-Old, Teacher, Professional, Fun Storyteller

### Accessibility
- **Voice Input** — Ask questions using your microphone via the Web Speech Recognition API
- **Read Aloud** — Listen to any AI response using the browser Speech Synthesis API
- **Stop Reading** — Cancel audio playback at any time
- **Copy Answer** — One-click copy for any response

### Design
- **Dark / Light Mode** — Toggle between themes at any time
- **Animated Splash Screen** — Branded intro with smooth fade transition
- **Responsive Layout** — Works on desktop and mobile
- **Custom Background** — Immersive teal aesthetic with glass-style cards

---


## Demo Video

[![AbyssNote AI Demo](https://img.youtube.com/vi/oJ61UMrG6u4/0.jpg)](https://www.youtube.com/watch?v=oJ61UMrG6u4)

> Click the thumbnail above to watch the full demo.

---

## How It Works

```
1. User uploads a PDF
       ↓
2. Server extracts text using pdf-parse
       ↓
3. User asks a question
       ↓
4. Server sends PDF text + question to Claude AI
       ↓
5. Claude returns an answer
       ↓
6. Answer is displayed in the chat interface
```

The API key is never exposed to the browser. All AI communication happens server-side through Next.js API routes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Inline CSS Variables |
| AI | Anthropic Claude API |
| PDF Parsing | pdf-parse |
| Deployment | Vercel |
| Font | Inter (Google Fonts) |

---

## Project Structure

```
ai-pdf-assistant/
│
├── public/
│   ├── bg.jpg               # Background image
│   └── logo.jpg             # App logo (splash screen)
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask/
│   │   │   │   └── route.ts     # Claude AI integration (server-side)
│   │   │   └── extract/
│   │   │       └── route.ts     # PDF text extraction (server-side)
│   │   ├── globals.css          # Global styles + CSS variables
│   │   ├── layout.tsx           # Root HTML layout
│   │   └── page.tsx             # Main application page
│   │
│   └── types/
│       └── index.ts             # Shared TypeScript type definitions
│
├── .env.example                 # Environment variable template
├── .gitignore                   # Files excluded from Git
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind design tokens
└── tsconfig.json                # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- An Anthropic API key — [get one here](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kokosita08/ai-pdf-assistant.git
cd ai-pdf-assistant

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Open `.env.local` and add your API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
# 4. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Upload** your PDF using the drag-and-drop area (text-based PDFs only, max 5 MB)
2. **Summarize** the document with one click, or generate a visual mind map
3. **Ask** any question about the content — type or use voice input
4. **Adjust** the response style using personality modes or Explain Simply
5. **Listen** to answers using Read Aloud, or copy them with one click

---

## Limitations

- Only text-based PDFs are supported. Scanned or image-only PDFs cannot be parsed.
- Maximum file size: 5 MB
- Very large documents are truncated to fit within AI context limits
- Voice input requires a browser that supports the Web Speech API (Chrome recommended)
- AI responses are generated from document content and may occasionally be imprecise

---

## Future Improvements

- [ ] Multi-PDF support — upload and compare multiple documents
- [ ] Conversation history — persist chat across sessions
- [ ] Export answers — download responses as PDF or text
- [ ] Highlight source — show which part of the document the answer came from
- [ ] User authentication — save documents and conversations
- [ ] Mobile app — iOS and Android versions

---

## Contributors

This project was a collaborative effort between two Computer Science students at California State University, Dominguez Hills.

---

### Kanchan Joglekar
**GitHub:** [@kokosita08](https://github.com/kokosita08)

- Full implementation and development
- Frontend architecture and UI/UX build
- Claude AI and PDF parsing integration
- Deployment and production configuration
- Accessibility features (voice input, read aloud)

---

### Om Desai
**GitHub:** [@omdesai14](https://github.com/omdesai14)   

- Idea generation and project concept
- Feature planning and product roadmap
- UI/UX direction and design feedback
- Project structure and scope definition

---

## License

This project is licensed under the [MIT License](LICENSE).

You are free to use, modify, and distribute this project with attribution.

---

<p align="center">
  Built by <a href="https://github.com/kokosita08">Kanchan Joglekar</a> & <a href="https://github.com/omdesai14">Om Desai</a>
  <br/>
  California State University, Dominguez Hills · 2026
</p>
