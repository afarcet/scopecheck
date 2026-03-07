"use client";

import { useState, use } from "react";
import Link from "next/link";
import { QRCodeCanvas as QRCode } from "qrcode.react";

const MOCK_INVESTOR = {
  handle: "alex",
  name: "Alex Farcet",
  firm: "Raspberry Ventures",
  location: "Lisbon & UK",
  bio: "Co-investment syndicate deploying €50K–€650K via SPV into VC-led rounds. We aggregate individual checks into a single cap-table line so founders can get back to building.",
  ticket_min: 50000,
  ticket_max: 650000,
  stages: ["Seed", "Early Series A"],
  sectors: ["ClimateTech", "Applied AI"],
  geographies: ["Europe", "Israel", "Africa", "US (select)"],
  wont_invest_in: "Pre-seed / idea stage, consumer apps, crypto, gaming, pre-revenue.",
  how_we_work: "Founder-friendly: we co-invest, never complicate your round. Single SPV (Odin): one cap-table line, minimal admin. Focus: one startup at a time; quality over quantity. Community: 200+ engaged private investors.",
  status: "active",
};

function formatCurrency(n: number) {
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
  return `€${n}`;
}

export default function InvestorProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const [showQR, setShowQR] = useState(false);
  const investor = MOCK_INVESTOR;
  const profileUrl = `https://scopecheck.ai/${handle}`;

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
        <p className="font-display" style={{ fontSize: "1.8rem", color: "var(--cream)", marginBottom: "0.3rem" }}>
          {investor.name}
        </p>
        <p className="font-mono-dm" style={{ fontSize: "0.8rem", color: "var(--amber)", letterSpacing: "0.06em" }}>
          {profileUrl}
        </p>
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
          <Link href={`/${handle}/apply`} className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.72rem" }}>
            Apply →
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div className="animate-fade-up animate-d1" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
            <div>
              <h1 className="font-display" style={{ fontSize: "2.6rem", fontWeight: 300, marginBottom: "0.3rem", lineHeight: 1.1 }}>{investor.name}</h1>
              <p style={{ fontSize: "0.9rem", color: "var(--slate)", fontWeight: 300 }}>{investor.firm} · {investor.location}</p>
            </div>
            <span className="tag tag-amber" style={{ marginTop: "0.3rem" }}>● Open to inbound</span>
          </div>
          <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: "var(--slate-light)", fontWeight: 300, marginTop: "1rem" }}>{investor.bio}</p>
        </div>

        <div className="animate-fade-up animate-d2" style={{ border: "1px solid var(--navy-border)", marginBottom: "1.5rem" }}>
          <div style={{ background: "var(--navy-mid)", borderBottom: "1px solid var(--navy-border)", padding: "0.8rem 1.2rem" }}>
            <span className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--slate)" }}>Investment criteria</span>
          </div>
          {[
            { label: "Ticket size", value: `${formatCurrency(investor.ticket_min)} – ${formatCurrency(investor.ticket_max)} via SPV` },
            { label: "Stage", value: investor.stages.join(" · ") },
            { label: "Sectors", value: investor.sectors.join(" · ") },
            { label: "Geography", value: investor.geographies.join(" · ") },
            { label: "Won't invest in", value: investor.wont_invest_in },
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: i < 4 ? "1px solid var(--navy-border)" : "none" }}>
              <div style={{ padding: "0.9rem 1.2rem", borderRight: "1px solid var(--navy-border)", background: "rgba(26,34,54,0.5)" }}>
                <span className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)" }}>{row.label}</span>
              </div>
              <div style={{ padding: "0.9rem 1.2rem" }}>
                <span style={{ fontSize: "0.88rem", color: "var(--cream)", fontWeight: 300 }}>{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        {investor.how_we_work && (
          <div className="animate-fade-up animate-d3" style={{ border: "1px solid var(--navy-border)", padding: "1.2rem", marginBottom: "2rem", background: "var(--navy-mid)" }}>
            <div className="label" style={{ marginBottom: "0.6rem" }}>How we work</div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--slate-light)", fontWeight: 300 }}>{investor.how_we_work}</p>
          </div>
        )}

        <div className="animate-fade-up animate-d4" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <Link href={`/${handle}/apply`} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>Apply for funding →</Link>
          <button onClick={() => setShowQR(true)} className="btn-secondary">▣ Show QR</button>
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href={`/${handle}/for-llm`} style={{ fontSize: "0.72rem", color: "var(--slate)", textDecoration: "none", fontFamily: "DM Mono, monospace", letterSpacing: "0.06em" }}>
            /for-llm ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
