"use client";
import { useState } from "react";
import Link from "next/link";

// Sticky note annotation component — handwritten, human, "building in public" layer
function Note({ text, rotate = -1.5, link }: { text: string; rotate?: number; link?: string }) {
  const style: React.CSSProperties = {
    display: "inline-block",
    background: "#fef3a0",
    color: "#2a1f00",
    fontFamily: "'Caveat', cursive",
    fontSize: "14px",
    lineHeight: 1.3,
    padding: "4px 10px 5px",
    transform: `rotate(${rotate}deg)`,
    boxShadow: "1px 2px 6px rgba(0,0,0,0.35)",
    cursor: link ? "pointer" : "default",
    textDecoration: "none",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  };

  if (link) {
    return <Link href={link} style={style} title="see build log">{text}</Link>;
  }
  return <span style={style}>{text}</span>;
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"investor" | "founder" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em" }}>
          <span>&gt;</span> scopecheck.ai
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <Link href="/log" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none", marginRight: "4px" }}>// build log</Link>
          <a href="#how" className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px" }}>how it works</a>
          <a href="#access" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px" }}>get access →</a>
        </div>
      </nav>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* HERO */}
        <section style={{ padding: "56px 0 48px" }}>

          {/* Terminal */}
          <div className="animate-d1" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
              <span style={{ margin: "0 auto", fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.06em" }}>scopecheck.ai — terminal</span>
            </div>
            <div style={{ padding: "18px 20px", lineHeight: 1.9 }}>
              <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span> <span> scopecheck init investor</span></div>
              <div style={{ color: "var(--rasp)" }}>✓ profile created → scopecheck.ai/alex</div>
              <div style={{ color: "var(--white-dim)", fontSize: "11px" }}>&nbsp;&nbsp;criteria indexed · /for-llm generated · QR ready</div>
              <br />
              <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span> <span> scopecheck init founder</span></div>
              <div style={{ color: "var(--amber)" }}>✓ passport created → scopecheck.ai/f/carbonade</div>
              <div style={{ color: "var(--white-dim)", fontSize: "11px" }}>&nbsp;&nbsp;deck linked · data room connected · apply link live</div>
              <br />
              <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span><span className="cursor" /></div>
            </div>
          </div>

          <h1 className="animate-d2" style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "14px" }}>
            Deal flow infrastructure.<br />
            <span style={{ color: "var(--rasp)" }}>Built for the AI era.</span>
          </h1>

          <p className="animate-d3" style={{ fontSize: "13px", color: "var(--white-mid)", lineHeight: 1.8, maxWidth: "500px", marginBottom: "24px" }}>
            One link for investors. One link for founders. A common format that agents, LLMs, and humans can all read. The missing infrastructure layer in early-stage fundraising.
          </p>

          {/* CTAs with note annotation */}
          <div className="animate-d4" style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "8px" }}>
              <a href="#access" className="btn-primary">$ create investor profile →</a>
              <a href="#access" className="btn-secondary">$ create founder passport →</a>
              {/* Handwritten annotation */}
              <Note text="✓ buttons now visible!" rotate={-2} link="/log#007" />
            </div>
          </div>

          <div className="animate-d5" style={{ fontSize: "11px", color: "var(--white-mid)", letterSpacing: "0.06em" }}>
            <span style={{ color: "var(--rasp)" }}>//</span> AI-native from day one · /for-llm auto-generated · QR-ready · open format
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />

        {/* HOW IT WORKS */}
        <section id="how" style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--white-mid)" }}>
              <span style={{ color: "var(--rasp)" }}>01</span> how it works
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            {/* Annotation on section */}
            <Note text="shipped day 1 →" rotate={1.5} link="/log#006" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--bg2)", padding: "20px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>// for investors</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "8px", lineHeight: 1.3 }}>Your scope check.<br />One link.</h3>
              <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "14px" }}>Define your real criteria once. Founders who click your link get a structured, pre-filtered application form. AI agents can parse your criteria directly via /for-llm.</p>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--rasp)", padding: "8px 12px", fontSize: "11px", color: "var(--rasp)", marginBottom: "12px" }}>
                scopecheck.ai/<span style={{ color: "var(--amber)" }}>yourhandle</span>
              </div>
              {["auto-generated /for-llm page", "QR code for events", "inbound kanban + triage", "custom intake fields"].map((f, i) => (
                <div key={i} style={{ fontSize: "11px", color: "var(--white-mid)", marginBottom: "3px" }}>→ {f}</div>
              ))}
            </div>

            <div style={{ background: "var(--bg2)", padding: "20px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// for founders</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "8px", lineHeight: 1.3 }}>Your pitch passport.<br />Carry it everywhere.</h3>
              <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "14px" }}>Build your profile once. When you apply to any investor on ScopeCheck, core fields pre-fill automatically. Share your public page at events via QR.</p>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--amber)", padding: "8px 12px", fontSize: "11px", color: "var(--amber)", marginBottom: "12px" }}>
                scopecheck.ai/f/<span style={{ color: "var(--white-mid)" }}>yourcompany</span>
              </div>
              {["fill once, apply anywhere", "round progress tracker", "deck + data room links", "share full data room via fulldeal.ai"].map((f, i) => (
                <div key={i} style={{ fontSize: "11px", color: "var(--white-mid)", marginBottom: "3px" }}>→ {f}</div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "1px", background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", padding: "16px 20px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-mid)", whiteSpace: "nowrap" }}>// for connectors</div>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", fontStyle: "italic", flex: 1 }}>
              &ldquo;Hey John, met Harry at Web Summit — was impressed. Here&apos;s his link.&rdquo;
            </p>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "6px 12px", fontSize: "11px", color: "var(--rasp)", whiteSpace: "nowrap" }}>
              scopecheck.ai/f/harryfounder
            </div>
          </div>
        </section>

        {/* EXAMPLE PROFILE */}
        <section style={{ marginBottom: "48px" }}>
          <div className="section-header">
            <span className="section-label"><span className="section-num">02</span> example · investor profile</span>
          </div>

          <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <span style={{ fontSize: "11px", color: "var(--rasp)" }}>scopecheck.ai/alex</span>
              <span className="tag tag-rasp"><span style={{ animation: "blink 2s ease infinite", display: "inline-block" }}>●</span> open to inbound</span>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "3px" }}>Alex Farcet</h2>
                  <p style={{ fontSize: "11px", color: "var(--white-mid)" }}>Raspberry Ventures · Lisbon & UK · Co-investment syndicate</p>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <span className="tag">seed</span>
                  <span className="tag">early-a</span>
                </div>
              </div>

              <div className="criteria-table" style={{ marginBottom: "14px" }}>
                {[
                  { k: "ticket_size", v: <><span style={{ color: "var(--rasp)" }}>€50K → €650K</span> <span style={{ color: "var(--white-dim)", fontSize: "10px" }}>// via single SPV</span></> },
                  { k: "sectors", v: <><span style={{ color: "var(--amber)" }}>ClimateTech</span> · <span style={{ color: "var(--amber)" }}>Applied AI</span></> },
                  { k: "geography", v: "Europe · Israel · Africa · US (select)" },
                  { k: "wont_invest", v: <span style={{ color: "var(--white-mid)" }}>pre-seed · crypto · gaming · consumer apps</span> },
                ].map((row, i) => (
                  <div key={i} className="criteria-row">
                    <div className="criteria-key">{row.k}</div>
                    <div className="criteria-val">{row.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <a href="#" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>$ apply →</a>
                <button className="btn-secondary" style={{ padding: "7px 10px" }}>▣ QR</button>
                <button className="btn-secondary" style={{ padding: "7px 10px", fontSize: "10px" }}>/for-llm</button>
                {/* Annotation on /for-llm */}
                <Note text="AI can read this!" rotate={2} link="/log#005" />
              </div>
            </div>
          </div>
        </section>

        {/* WAITLIST */}
        <section id="access">
          <div className="section-header">
            <span className="section-label"><span className="section-num">03</span> early access</span>
          </div>

          {submitted ? (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--rasp)", padding: "28px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>✓</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>You&apos;re on the list</h3>
              <p style={{ fontSize: "12px", color: "var(--white-mid)" }}>We&apos;ll be in touch when your access is ready. Early users shape the product.</p>
            </div>
          ) : (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "24px" }}>
              <p style={{ fontSize: "12px", color: "var(--white-mid)", marginBottom: "4px" }}>Building in public. First users shape the product.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", color: "var(--white-dim)" }}>// investor profiles and founder passports now open for early access</p>
                <Note text="read the build log →" rotate={-1} link="/log" />
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                  {[
                    { key: "investor", label: "I'm an investor", sub: "solo GP · syndicate lead · angel", color: "var(--rasp)" },
                    { key: "founder", label: "I'm a founder", sub: "currently fundraising", color: "var(--amber)" },
                  ].map(r => (
                    <button key={r.key} type="button" onClick={() => setRole(r.key as "investor" | "founder")}
                      style={{ background: "var(--bg3)", border: `1px solid ${role === r.key ? r.color : "var(--border2)"}`, padding: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: r.color, marginBottom: "3px" }}>{r.label}</div>
                      <div style={{ fontSize: "11px", color: "var(--white-mid)" }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input type="email" className="input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1 }} />
                  <button type="submit" className="btn-primary" disabled={!email || !role || loading} style={{ opacity: !email || !role ? 0.5 : 1, whiteSpace: "nowrap" }}>
                    {loading ? "..." : "$ request access →"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "820px", margin: "0 auto" }}>
        <span style={{ fontSize: "11px", color: "var(--white-mid)" }}>scopecheck.ai · by <a href="https://raspberry.ventures" target="_blank" rel="noopener" style={{ color: "var(--rasp)", textDecoration: "none" }}>raspberry.ventures</a></span>
        <span style={{ fontSize: "10px", color: "var(--white-dim)" }}>// built in public with AI · 2026</span>
      </footer>
    </main>
  );
}
