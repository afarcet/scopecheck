import Link from "next/link";
import { CopyRow } from "@/components/CopyButton";

const DEMO_FOUNDER = {
  company_name: "Acme Systems",
  name: "Jamie Laurent",
  email: "jamie@acmesystems.io",
  one_liner: "AI-native inventory optimisation for mid-market manufacturers — 23% cost reduction in 90 days.",
  stage: "Seed",
  sector: "Applied AI · Manufacturing",
  geography: "Paris, FR · EU market",
  round_size: 2000000,
  committed: 1200000,
  traction_summary: "€340K ARR · 8 enterprise clients · 94% net retention",
  deck_url: "https://deck.acmesystems.io",
  handle: "acme",
};

export default function DemoFounderPage() {
  const profileUrl = "https://scopecheck.ai/f/acme";
  const pct = Math.round((DEMO_FOUNDER.committed / DEMO_FOUNDER.round_size) * 100);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
        <span style={{ fontSize: "10px", color: "var(--amber)", letterSpacing: "0.1em", padding: "3px 10px", border: "1px solid rgba(240,165,0,0.3)", background: "rgba(240,165,0,0.06)" }}>// demo profile</span>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
            <span style={{ fontSize: "11px", color: "var(--amber)" }}>scopecheck.ai/f/acme</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px", border: "1px solid rgba(240,165,0,0.3)", color: "var(--amber)", background: "rgba(240,165,0,0.08)" }}>
              {DEMO_FOUNDER.stage.toLowerCase()}
            </span>
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>{DEMO_FOUNDER.company_name}</h1>
              <p style={{ fontSize: "13px", color: "var(--white-mid)", lineHeight: 1.6 }}>{DEMO_FOUNDER.one_liner}</p>
              <p style={{ fontSize: "11px", color: "var(--white-dimmer)", marginTop: "6px" }}>{DEMO_FOUNDER.sector} · {DEMO_FOUNDER.geography}</p>
            </div>

            {/* Round progress */}
            <div style={{ border: "1px solid var(--border2)", background: "var(--bg3)", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-mid)" }}>Round progress</span>
                <span style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 600 }}>{pct}% committed</span>
              </div>
              <div style={{ height: "4px", background: "var(--bg2)", borderRadius: "2px", marginBottom: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--amber)", transition: "width 0.6s ease" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[
                  { label: "raising", val: `€${(DEMO_FOUNDER.round_size / 1000000).toFixed(1)}M` },
                  { label: "committed", val: `€${(DEMO_FOUNDER.committed / 1000000).toFixed(1)}M` },
                  { label: "available", val: `€${((DEMO_FOUNDER.round_size - DEMO_FOUNDER.committed) / 1000).toFixed(0)}K` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--amber)" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: "1px solid var(--border2)", marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", borderBottom: "1px solid var(--border)" }}>
                <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>traction</div>
                <div style={{ padding: "9px 14px", fontSize: "12px", color: "var(--white)" }}>{DEMO_FOUNDER.traction_summary}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}>
                <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>deck</div>
                <div style={{ padding: "9px 14px", fontSize: "12px" }}>
                  <a href={DEMO_FOUNDER.deck_url} target="_blank" rel="noopener" style={{ color: "var(--amber)", textDecoration: "none" }}>{DEMO_FOUNDER.deck_url} ↗</a>
                </div>
              </div>
            </div>

            <CopyRow url={profileUrl} color="var(--amber)" />

            <div style={{ marginTop: "16px", background: "var(--bg3)", border: "1px solid var(--amber)", borderLeft: "2px solid var(--amber)", padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", color: "var(--amber)", margin: "0 0 6px", letterSpacing: "0.08em" }}>// this is a demo profile</p>
              <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0, lineHeight: 1.7 }}>
                Build your own startup passport at{" "}
                <Link href="/passport" style={{ color: "var(--amber)", textDecoration: "none" }}>scopecheck.ai/passport →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
