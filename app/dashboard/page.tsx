"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "new" | "considering" | "passed";

interface Application {
  id: string;
  company: string;
  founder: string;
  one_liner: string;
  sector: string;
  stage: string;
  round_size: number;
  available: number;
  traction: string;
  deck_url: string;
  received: string;
  status: Status;
}

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "1",
    company: "Carbonade",
    founder: "Harry Founder",
    one_liner: "AI-optimised heat pumps for industrial decarbonisation.",
    sector: "ClimateTech",
    stage: "Seed",
    round_size: 2000000,
    available: 800000,
    traction: "€180K ARR · 3 enterprise pilots",
    deck_url: "https://fulldeal.ai/carbonade",
    received: "2 hours ago",
    status: "new",
  },
  {
    id: "2",
    company: "GreenRoute",
    founder: "Sara Chen",
    one_liner: "Route optimisation for EV fleets reducing energy use by 40%.",
    sector: "ClimateTech",
    stage: "Early Series A",
    round_size: 4000000,
    available: 1500000,
    traction: "12 fleet operators, €420K ARR",
    deck_url: "#",
    received: "Yesterday",
    status: "new",
  },
  {
    id: "3",
    company: "DataSage",
    founder: "Tom Morris",
    one_liner: "Applied AI for enterprise data cataloguing.",
    sector: "Applied AI",
    stage: "Seed",
    round_size: 1500000,
    available: 600000,
    traction: "5 enterprise clients, €90K ARR",
    deck_url: "#",
    received: "3 days ago",
    status: "considering",
  },
  {
    id: "4",
    company: "CryptoX",
    founder: "Jake Smith",
    one_liner: "Web3 payments infrastructure.",
    sector: "Crypto",
    stage: "Seed",
    round_size: 3000000,
    available: 1000000,
    traction: "Beta users",
    deck_url: "#",
    received: "4 days ago",
    status: "passed",
  },
];

function formatCurrency(n: number) {
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
  return `€${n}`;
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "new", label: "New inbound", color: "var(--amber)" },
  { key: "considering", label: "Considering", color: "#60a5fa" },
  { key: "passed", label: "Passed", color: "var(--slate)" },
];

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>(MOCK_APPLICATIONS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const move = (id: string, status: Status) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    setExpanded(null);
  };

  const byStatus = (status: Status) => apps.filter((a) => a.status === status);

  return (
    <main style={{ minHeight: "100vh", background: "var(--navy)" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--navy-border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--navy)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="font-display" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--cream)" }}>ScopeCheck</span>
          </Link>
          <span style={{ color: "var(--navy-border)" }}>|</span>
          <span className="font-mono-dm" style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)" }}>
            Inbound pipeline
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <Link href="/scope" className="btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.7rem" }}>
            My scope ↗
          </Link>
          <Link href="/" className="btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.7rem" }}>
            Home
          </Link>
        </div>
      </nav>

      {/* Stats bar */}
      <div style={{ borderBottom: "1px solid var(--navy-border)", background: "var(--navy-mid)", padding: "0.8rem 1.5rem", display: "flex", gap: "2rem" }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: col.color, display: "inline-block" }} />
            <span className="font-mono-dm" style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--slate)" }}>
              {col.label}
            </span>
            <span className="font-mono-dm" style={{ fontSize: "0.78rem", color: "var(--cream)", fontWeight: 500 }}>
              {byStatus(col.key).length}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", borderBottom: "1px solid var(--navy-border)", minHeight: "calc(100vh - 120px)" }}>
        {COLUMNS.map((col, ci) => (
          <div key={col.key} style={{ borderRight: ci < 2 ? "1px solid var(--navy-border)" : "none", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.2rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: col.color }} />
              <span className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: col.color }}>
                {col.label}
              </span>
              <span style={{ background: "var(--navy-light)", border: "1px solid var(--navy-border)", borderRadius: "10px", padding: "0 0.4rem", fontSize: "0.68rem", color: "var(--slate)", fontFamily: "DM Mono, monospace" }}>
                {byStatus(col.key).length}
              </span>
            </div>

            {byStatus(col.key).map((app) => (
              <div
                key={app.id}
                style={{
                  background: expanded === app.id ? "rgba(26,34,54,0.8)" : "var(--navy-mid)",
                  border: `1px solid ${expanded === app.id ? col.color : "rgba(100,116,139,0.4)"}`,
                  borderLeft: `3px solid ${col.color}`,
                  padding: "1rem",
                  marginBottom: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderRadius: "2px",
                }}
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <span style={{ fontWeight: 400, fontSize: "0.92rem" }}>{app.company}</span>
                  <span className="tag" style={{ fontSize: "0.64rem" }}>{app.sector}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--slate-light)", margin: "0 0 0.6rem", lineHeight: 1.5, fontWeight: 300 }}>
                  {app.one_liner}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-mono-dm" style={{ fontSize: "0.68rem", color: "var(--slate)" }}>{app.received}</span>
                  <span className="font-mono-dm" style={{ fontSize: "0.72rem", color: "var(--amber)" }}>
                    {formatCurrency(app.available)} avail.
                  </span>
                </div>

                {/* Expanded view */}
                {expanded === app.id && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--navy-border)" }}>
                    <div style={{ marginBottom: "0.8rem" }}>
                      <div className="label" style={{ marginBottom: "0.2rem" }}>Traction</div>
                      <p style={{ fontSize: "0.82rem", color: "var(--slate-light)", margin: 0 }}>{app.traction}</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1rem" }}>
                      <div>
                        <div className="label" style={{ marginBottom: "0.2rem" }}>Round size</div>
                        <span className="font-mono-dm" style={{ fontSize: "0.8rem", color: "var(--cream)" }}>{formatCurrency(app.round_size)}</span>
                      </div>
                      <div>
                        <div className="label" style={{ marginBottom: "0.2rem" }}>Stage</div>
                        <span style={{ fontSize: "0.8rem", color: "var(--cream)" }}>{app.stage}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <a href={app.deck_url} target="_blank" rel="noopener" className="btn-secondary" style={{ fontSize: "0.68rem", padding: "0.4rem 0.8rem", flex: 1, justifyContent: "center", textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}>
                        View deck ↗
                      </a>
                      {col.key !== "considering" && (
                        <button
                          className="btn-primary"
                          style={{ fontSize: "0.68rem", padding: "0.4rem 0.8rem", flex: 1, justifyContent: "center" }}
                          onClick={(e) => { e.stopPropagation(); move(app.id, "considering"); }}
                        >
                          👍 Consider
                        </button>
                      )}
                      {col.key !== "passed" && (
                        <button
                          style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "var(--white-mid)", fontFamily: "DM Mono, monospace", fontSize: "0.68rem", padding: "0.4rem 0.8rem", cursor: "pointer", flex: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}
                          onClick={(e) => { e.stopPropagation(); move(app.id, "passed"); }}
                        >
                          👎 Pass
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {byStatus(col.key).length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--slate)", fontSize: "0.82rem", fontWeight: 300 }}>
                {col.key === "new" ? "No new inbound yet" : col.key === "considering" ? "Nothing here yet" : "No passed deals"}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
