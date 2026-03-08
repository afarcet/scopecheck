"use client";
import { useState } from "react";

// Google-style two-stacked-pages copy icon
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Back page */}
      <rect x="8" y="2" width="12" height="15" rx="1.5" />
      {/* Front page */}
      <rect x="4" y="7" width="12" height="15" rx="1.5" fill="var(--bg2)" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CopyButton({
  text,
  style = {},
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy link"}
      style={{
        background: "transparent",
        border: "none",
        padding: "5px 8px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: copied ? "var(--amber)" : "var(--white-dim)",
        transition: "color 0.15s ease",
        flexShrink: 0,
        ...style,
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

// URL row with copy icon inline — full width bar
export function CopyRow({
  url,
  color = "var(--rasp)",
}: {
  url: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", width: "100%", border: "1px solid var(--border2)", background: "var(--bg3)" }}>
      <div
        style={{
          flex: 1,
          borderLeft: `2px solid ${color}`,
          padding: "8px 12px",
          fontSize: "12px",
          color,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          display: "flex",
          alignItems: "center",
        }}
      >
        {url}
      </div>
      <CopyButton text={url} style={{ borderLeft: "1px solid var(--border2)", padding: "6px 12px" }} />
    </div>
  );
}
