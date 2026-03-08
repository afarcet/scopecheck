"use client";
import { useState } from "react";

export function CopyButton({
  text,
  label = "copy",
  style = {},
}: {
  text: string;
  label?: string;
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
      title="Copy link"
      style={{
        background: copied ? "var(--amber)" : "var(--bg3)",
        color: copied ? "#000" : "var(--white-mid)",
        border: "1px solid var(--border2)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "5px 10px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s ease",
        flexShrink: 0,
        ...style,
      }}
    >
      {copied ? "✓ copied" : label}
    </button>
  );
}

export function CopyRow({
  url,
  color = "var(--rasp)",
  prefix,
}: {
  url: string;
  color?: string;
  prefix?: string;
}) {
  const display = prefix ? url.replace(`https://scopecheck.ai/${prefix}/`, "") : url;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "8px" }}>
      <div
        style={{
          flex: 1,
          background: "var(--bg3)",
          border: "1px solid var(--border2)",
          borderLeft: `2px solid ${color}`,
          borderRight: "none",
          padding: "8px 12px",
          fontSize: "12px",
          color,
          letterSpacing: "0.02em",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {prefix && (
          <span style={{ color: "var(--white-dim)" }}>
            scopecheck.ai/{prefix}/
          </span>
        )}
        {prefix ? display : url}
      </div>
      <CopyButton text={url} style={{ borderLeft: "none", borderRadius: 0 }} />
    </div>
  );
}
