import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kemmylabs Studio",
  description: "A private AI-powered creative production studio for films, dramas, documentaries, and digital stories.",
  applicationName: "Reelverse",
keywords: [
  "AI-powered creative production",
  "films",
  "dramas",
  "documentaries",
  "digital stories",
  "creative studio",
  "AI storytelling",
  "film production",
  "drama production",
  "documentary production",
  "digital content creation",
  "kemmylabs",
  "reelverse",
],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
