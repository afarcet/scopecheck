"use client";
import { useState } from "react";

// Icon-only clipboard copy button — Google-style
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
      {copied ? (
        // Checkmark
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Clipboard icon
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="4" rx="1" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      )}
    </button>
  );
}

// URL row with copy icon inline
export function CopyRow({
  url,
  color = "var(--rasp)",
}: {
  url: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "8px", border: "1px solid var(--border2)", background: "var(--bg3)" }}>
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
        }}
      >
        {url}
      </div>
      <CopyButton text={url} style={{ borderLeft: "1px solid var(--border2)", padding: "6px 10px" }} />
    </div>
  );
}
