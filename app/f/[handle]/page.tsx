"use client";

import { useState, use } from "react";
import Link from "next/link";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const MOCK_FOUNDER = {
  handle: "harryfounder",
  name: "Harry Founder",
  company_name: "Carbonade",
  one_liner: "AI-optimised heat pumps for industrial decarbonisation.",
  stage: "Seed",
  sector: "ClimateTech",
  geography: "Berlin, Germany · EU market",
  round_size: 2000000,
  committed: 1200000,
  available: 800000,
  traction: "€180K ARR · 3 enterprise pilots · LOI from major German utility",
  deck_url: "https://fulldeal.ai/carbonade",
  data_room_url: "https://fulldeal.ai/carbonade/dataroom",
  what_we_want: "Looking for a co-investor with ClimateTech expertise and European network. €100K–€500K allocation available.",
};

function formatCurrency(n: number) {
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
  return `€${n}`;
}

function progressPercent(committed: number, total: number) {
  return Math.min(100, Math.round((committed / total) * 100));
}

export default function FounderPassport({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const [showQR, setShowQR] = useState(false);
  const founder = MOCK_FOUNDER;
  const profileUrl = `https://scopecheck.ai/f/${handle}`;
  const pct = progressPercent(founder.committed, founder.round_size);

  if (showQR) {
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "var(--navy)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "2rem" }}
        onClick={() => setShowQR(false)}
      >
        <p className="font-mono-dm" style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--slate)", marginBottom: "2rem" }}>
          Tap anywhere to close
        </p>
        <div style={{ background: "white", padding: "1.5rem", marginBottom: "2rem" }}>
          <QRCode value={profileUrl} size={260} level="H" />
        </div>
        <p className="font-display" style={{ fontSize: "1.8rem", color: "var(--cream)", marginBottom: "0.1rem" }}>{founder.company_name}</p>
        <p style={{ fontSize: "0.9rem", color: "var(--slate-light)", marginBottom: "0.4rem" }}>by {founder.name}</p>
        <p className="font-mono-dm" style={{ fontSize: "0.8rem", color: "var(--amber)", letterSpacing: "0.06em" }}>{profileUrl}</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <nav style={{ borderBottom: "1px solid var(--navy-border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="font-display" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--cream)" }}>ScopeCheck</span>
        </Link>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button onClick={() => setShowQR(true)} style={{ background: "var(--navy-light)", border: "1px solid var(--navy-border)", color: "var(--slate)", fontFamily: "DM Mono, monospace", fontSize: "0.72rem", padding: "0.5rem 0.9rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ▣ QR
          </button>
          {founder.deck_url && (
            <a href={founder.deck_url} target="_blank" rel="noopener" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.72rem" }}>
              View deck →
            </a>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Header */}
        <div className="animate-fade-up animate-d1" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 className="font-display" style={{ fontSize: "2.6rem", fontWeight: 300, marginBottom: "0.3rem", lineHeight: 1.1 }}>{founder.company_name}</h1>
              <p style={{ fontSize: "0.9rem", color: "var(--slate)", fontWeight: 300 }}>Founded by {founder.name} · {founder.geography}</p>
            </div>
            <span className="tag tag-green" style={{ marginTop: "0.3rem" }}>● Actively raising</span>
          </div>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "var(--cream)", fontWeight: 300, marginTop: "1rem", fontStyle: "italic" }} className="font-display">
            &ldquo;{founder.one_liner}&rdquo;
          </p>
        </div>

        {/* Round progress */}
        <div className="animate-fade-up animate-d2" style={{ border: "1px solid var(--navy-border)", padding: "1.5rem", marginBottom: "1.5rem", background: "var(--navy-mid)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
            <span className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--slate)" }}>Round progress</span>
            <span className="font-mono-dm" style={{ fontSize: "0.78rem", color: "var(--amber)" }}>{pct}% committed</span>
          </div>
          <div style={{ height: "4px", background: "var(--navy-border)", marginBottom: "1rem", position: "relative" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--amber)", transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
            {[
              { label: "Total raise", value: formatCurrency(founder.round_size) },
              { label: "Committed", value: formatCurrency(founder.committed) },
              { label: "Available", value: formatCurrency(founder.available) },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: i === 1 ? "center" : i === 2 ? "right" : "left" }}>
                <div className="label" style={{ marginBottom: "0.2rem" }}>{item.label}</div>
                <div style={{ fontSize: "1.1rem", color: "var(--cream)", fontFamily: "DM Mono, monospace", fontWeight: 400 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="animate-fade-up animate-d3" style={{ border: "1px solid var(--navy-border)", marginBottom: "1.5rem" }}>
          <div style={{ background: "var(--navy-mid)", borderBottom: "1px solid var(--navy-border)", padding: "0.8rem 1.2rem" }}>
            <span className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--slate)" }}>Company details</span>
          </div>
          {[
            { label: "Stage", value: founder.stage },
            { label: "Sector", value: founder.sector },
            { label: "Geography", value: founder.geography },
            { label: "Traction", value: founder.traction },
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: i < 3 ? "1px solid var(--navy-border)" : "none" }}>
              <div style={{ padding: "0.9rem 1.2rem", borderRight: "1px solid var(--navy-border)", background: "rgba(26,34,54,0.5)" }}>
                <span className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)" }}>{row.label}</span>
              </div>
              <div style={{ padding: "0.9rem 1.2rem" }}>
                <span style={{ fontSize: "0.88rem", color: "var(--cream)", fontWeight: 300 }}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* What we want */}
        {founder.what_we_want && (
          <div className="animate-fade-up animate-d4" style={{ border: "1px solid rgba(16,185,129,0.2)", padding: "1.2rem", marginBottom: "2rem", background: "rgba(16,185,129,0.04)" }}>
            <div className="label" style={{ marginBottom: "0.6rem", color: "var(--amber)" }}>What we&apos;re looking for in an investor</div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--slate-light)", fontWeight: 300, margin: 0 }}>{founder.what_we_want}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="animate-fade-up animate-d5" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {founder.deck_url && (
            <a href={founder.deck_url} target="_blank" rel="noopener" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              View pitch deck →
            </a>
          )}
          {founder.data_room_url && (
            <a href={founder.data_room_url} target="_blank" rel="noopener" className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
              Full data room ↗
            </a>
          )}
          <button onClick={() => setShowQR(true)} className="btn-secondary">▣ QR</button>
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href={`/f/${handle}/for-llm`} style={{ fontSize: "0.72rem", color: "var(--slate)", textDecoration: "none", fontFamily: "DM Mono, monospace", letterSpacing: "0.06em" }}>
            /for-llm ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
