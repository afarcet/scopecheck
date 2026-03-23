"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EmbedScopePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const [handle, setHandle] = useState("");
  const [investor, setInvestor] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Read theme from URL params
    const url = new URL(window.location.href);
    const t = url.searchParams.get("theme");
    if (t === "light") setTheme("light");

    params.then(({ handle: h }) => {
      setHandle(h);
      supabase
        .from("investors")
        .select("*")
        .eq("handle", h)
        .single()
        .then(({ data }) => {
          if (!data) setNotFound(true);
          else setInvestor(data);
        });
    });
  }, [params]);

  const isDark = theme === "dark";

  // Theme tokens
  const t = isDark
    ? {
        bg: "#0d0d0d",
        bg2: "#111111",
        bg3: "#181818",
        border: "#222222",
        border2: "#2a2a2a",
        text: "#ffffff",
        textMid: "rgba(255,255,255,0.55)",
        textDim: "rgba(255,255,255,0.3)",
        rasp: "#d4286a",
        raspDim: "rgba(212,40,106,0.12)",
        green: "#34d399",
      }
    : {
        bg: "#faf8f5",
        bg2: "#f0ece7",
        bg3: "#e8e3dd",
        border: "#d6d0c8",
        border2: "#c9c2b8",
        text: "#1a1a1a",
        textMid: "rgba(26,26,26,0.6)",
        textDim: "rgba(26,26,26,0.35)",
        rasp: "#b8215a",
        raspDim: "rgba(184,33,90,0.1)",
        green: "#16a34a",
      };

  if (notFound) {
    return (
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          background: t.bg,
          color: t.textMid,
          padding: "24px",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        scope not found
      </div>
    );
  }

  if (!investor) {
    return (
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          background: t.bg,
          color: t.textDim,
          padding: "24px",
          fontSize: "11px",
          textAlign: "center",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        loading scope...
      </div>
    );
  }

  const name = investor.name as string;
  const firm = investor.firm as string;
  const status = investor.status as string;
  const ticketMin = investor.ticket_min as number | null;
  const ticketMax = investor.ticket_max as number | null;
  const stages = (investor.stages as string[]) || [];
  const sectors = (investor.sectors as string[]) || [];
  const geographies = (investor.geographies as string[]) || [];
  const wontInvest = investor.wont_invest_in as string;

  const ticket =
    ticketMin && ticketMax
      ? `\u20AC${ticketMin}K \u2192 \u20AC${ticketMax}K`
      : ticketMin
        ? `from \u20AC${ticketMin}K`
        : ticketMax
          ? `up to \u20AC${ticketMax}K`
          : null;

  const scopeUrl = `https://scopecheck.ai/i/${handle}`;

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    borderBottom: `1px solid ${t.border}`,
    fontSize: "12px",
    lineHeight: "1.6",
  } as React.CSSProperties;

  const labelCellStyle = {
    padding: "8px 12px",
    color: t.textDim,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.04em",
  } as React.CSSProperties;

  const valueCellStyle = {
    padding: "8px 12px",
    color: t.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
  } as React.CSSProperties;

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: t.bg,
        color: t.text,
        minHeight: "fit-content",
        padding: "0",
      }}
    >
      {/* Inject JetBrains Mono */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          border: `1px solid ${t.border}`,
          background: t.bg2,
          maxWidth: "100%",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 14px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bg,
          }}
        >
          <a
            href={scopeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "10px",
              color: t.rasp,
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            scopecheck.ai/i/{handle}
          </a>
          {status === "active" && (
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: t.green,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: t.green,
                  display: "inline-block",
                }}
              />
              open to inbound
            </span>
          )}
        </div>

        {/* Identity */}
        <div style={{ padding: "16px 14px 12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {name}
              </div>
              {firm && (
                <div
                  style={{
                    fontSize: "12px",
                    color: t.textMid,
                    marginTop: "2px",
                  }}
                >
                  {firm}
                </div>
              )}
            </div>
            {stages.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {stages.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "9px",
                      padding: "2px 7px",
                      border: `1px solid ${t.border2}`,
                      color: t.textMid,
                      letterSpacing: "0.04em",
                      textTransform: "lowercase",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scope data rows */}
        <div>
          {ticket && (
            <div style={rowStyle}>
              <div style={labelCellStyle}>ticket_size</div>
              <div style={{ ...valueCellStyle, color: t.rasp }}>{ticket}</div>
            </div>
          )}
          {sectors.length > 0 && (
            <div style={rowStyle}>
              <div style={labelCellStyle}>sectors</div>
              <div style={{ ...valueCellStyle, color: t.rasp }}>
                {sectors.join(" \u00B7 ")}
              </div>
            </div>
          )}
          {geographies.length > 0 && (
            <div style={rowStyle}>
              <div style={labelCellStyle}>geography</div>
              <div style={valueCellStyle}>
                {geographies.join(" \u00B7 ")}
              </div>
            </div>
          )}
          {wontInvest && (
            <div style={rowStyle}>
              <div style={labelCellStyle}>won&apos;t_invest</div>
              <div style={{ ...valueCellStyle, color: t.textMid }}>
                {wontInvest}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "12px 14px" }}>
          <a
            href={scopeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: t.rasp,
              color: "#fff",
              border: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "9px 16px",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            $ send intro &rarr;
          </a>
          <span
            style={{
              fontSize: "9px",
              color: t.textDim,
              marginLeft: "10px",
              letterSpacing: "0.06em",
            }}
          >
            powered by{" "}
            <a
              href="https://scopecheck.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: t.rasp, textDecoration: "none" }}
            >
              scopecheck.ai
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
