// Demo investor scope — ACME Capital
// Shows a realistic investor scope to visitors who hover the example link on homepage
import Link from "next/link";
import { CopyRow } from "@/components/CopyButton";

const DEMO_INVESTOR = {
  name: "Sarah Chen",
  firm: "Acme Ventures",
  location: "London · Remote-first",
  bio: "Co-founder operator turned investor. I care about the unsexy infrastructure layer that makes the rest of tech possible.",
  stages: ["Seed", "Early-A"],
  sectors: ["Applied AI", "ClimateTech", "DevTools", "FinTech Infrastructure"],
  geographies: ["Europe", "Israel", "US (select)"],
  ticket_min: 75,
  ticket_max: 500,
  wont_invest_in: "Consumer apps · Gaming · Crypto · Agencies",
  how_we_work: "I lead or co-lead, take one board seat max per quarter. Quick process — first call to term sheet in 3 weeks if we're aligned.",
};

export default function DemoInvestorPage() {
  const profileUrl = "https://scopecheck.ai/i/demo";
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
        <span style={{ fontSize: "10px", color: "var(--amber)", letterSpacing: "0.1em", padding: "3px 10px", border: "1px solid rgba(240,165,0,0.3)", background: "rgba(240,165,0,0.06)" }}>// demo profile</span>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
            <span style={{ fontSize: "11px", color: "var(--rasp)" }}>scopecheck.ai/i/demo</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px", border: "1px solid rgba(212,40,106,0.3)", color: "var(--rasp)", background: "rgba(212,40,106,0.06)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ animation: "blink 2s ease infinite", display: "inline-block" }}>●</span> open to inbound
            </span>
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
              <div>
                <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>{DEMO_INVESTOR.name}</h1>
                <p style={{ fontSize: "11px", color: "var(--white-mid)" }}>{DEMO_INVESTOR.firm} · {DEMO_INVESTOR.location}</p>
              </div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {DEMO_INVESTOR.stages.map(s => (
                  <span key={s} style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px", border: "1px solid var(--border2)", color: "var(--white-mid)" }}>{s.toLowerCase()}</span>
                ))}
              </div>
            </div>

            {DEMO_INVESTOR.bio && (
              <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px", borderLeft: "2px solid var(--rasp)", paddingLeft: "12px", fontStyle: "italic" }}>
                &ldquo;{DEMO_INVESTOR.bio}&rdquo;
              </p>
            )}

            <div style={{ border: "1px solid var(--border2)", marginBottom: "16px" }}>
              {[
                { k: "ticket_size", v: <><span style={{ color: "var(--rasp)" }}>€{DEMO_INVESTOR.ticket_min}K → €{DEMO_INVESTOR.ticket_max}K</span></> },
                { k: "sectors", v: DEMO_INVESTOR.sectors.map((s, i) => <span key={s}><span style={{ color: "var(--amber)" }}>{s}</span>{i < DEMO_INVESTOR.sectors.length - 1 ? " · " : ""}</span>) },
                { k: "geography", v: <span style={{ color: "var(--white)" }}>{DEMO_INVESTOR.geographies.join(" · ")}</span> },
                { k: "wont_invest", v: <span style={{ color: "var(--white-mid)" }}>{DEMO_INVESTOR.wont_invest_in}</span> },
                { k: "how_we_work", v: <span style={{ color: "var(--white-mid)", fontStyle: "italic" }}>{DEMO_INVESTOR.how_we_work}</span> },
              ].map((row, i, arr) => (
                <div key={row.k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>{row.k}</div>
                  <div style={{ padding: "9px 14px", fontSize: "12px" }}>{row.v}</div>
                </div>
              ))}
            </div>

            <CopyRow url={profileUrl} color="var(--rasp)" />

            <div style={{ marginTop: "16px", background: "var(--bg3)", border: "1px solid var(--amber)", borderLeft: "2px solid var(--amber)", padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", color: "var(--amber)", margin: "0 0 6px", letterSpacing: "0.08em" }}>// this is a demo profile</p>
              <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0, lineHeight: 1.7 }}>
                Define your own investor scope at{" "}
                <Link href="/scope" style={{ color: "var(--rasp)", textDecoration: "none" }}>scopecheck.ai/scope →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
