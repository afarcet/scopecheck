import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScopeCheck — Deal flow infrastructure for the AI era",
  description: "Investors define their criteria once. Founders build their passport once. The infrastructure layer for modern deal flow.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
  },
  openGraph: {
    title: "ScopeCheck",
    description: "Deal flow infrastructure for the AI era.",
    url: "https://scopecheck.ai",
    siteName: "ScopeCheck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScopeCheck",
    description: "Deal flow infrastructure for the AI era.",
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
