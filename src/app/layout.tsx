import type { Metadata } from "next";
import "./globals.css";

// This metadata appears in the browser tab and when sharing links
export const metadata: Metadata = {
  title: "AI PDF Assistant",
  description: "Upload a PDF and ask questions about it — powered by Claude AI",
};

// RootLayout wraps every page. Think of it like a picture frame.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
