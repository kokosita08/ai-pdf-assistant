import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AbyssNote AI",
  description: "Upload a PDF and ask questions about it — powered by AI",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}