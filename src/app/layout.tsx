import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JobsNearMe — find local jobs fast",
    template: "%s — JobsNearMe",
  },
  description:
    "Guides to finding jobs near you — local, part-time, warehouse, and remote roles, with tips on how to apply and get hired fast.",
  openGraph: {
    type: "website",
    siteName: "JobsNearMe",
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
