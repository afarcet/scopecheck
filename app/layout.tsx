import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScopeCheck — The smarter way to share deal flow",
  description: "Investors define their criteria once. Founders build their pitch passport once. The infrastructure layer for modern deal flow.",
  openGraph: {
    title: "ScopeCheck",
    description: "The smarter link for deal flow. For investors, founders, and everyone in between.",
    url: "https://scopecheck.ai",
    siteName: "ScopeCheck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScopeCheck",
    description: "The smarter link for deal flow.",
  },
};

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
