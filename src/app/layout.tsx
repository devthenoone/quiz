import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quizy Zone — fun quizzes & trivia for curious minds",
    template: "%s — Quizy Zone",
  },
  description:
    "Play free quizzes and trivia on general knowledge, science, history, geography, sports, movies, music, and technology — with answers and fun facts.",
  openGraph: {
    type: "website",
    siteName: "Quizy Zone",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white" suppressHydrationWarning>
        <NextTopLoader color="#2563eb" height={3} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
