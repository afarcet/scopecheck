"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function Note({ text, rotate = -1.5, link }: { text: string; rotate?: number; link?: string }) {
  const style: React.CSSProperties = {
    display: "inline-block",
    background: "rgba(240, 165, 0, 0.06)",
    color: "#f0a500",
    fontFamily: "'Caveat', cursive",
    fontSize: "15px",
    lineHeight: 1.3,
    padding: "3px 9px 4px",
    transform: `rotate(${rotate}deg)`,
    border: "1px solid rgba(240,165,0,0.55)",
    cursor: link ? "pointer" : "default",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "border-color 0.15s, background 0.15s",
  };
  if (link) return <Link href={link} style={style} title="see build log">{text}</Link>;
  return <span style={style}>{text}</span>;
}

export default function LandingPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          <span style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>&gt; scopecheck.ai</span>
          <Link href="/log" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none", whiteSpace: "nowrap" }}>// build log</Link>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          <a href="#how" className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>how it works</a>
          {authed ? (
            <>
              <a href="/dashboard" className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>dashboard</a>
              <a href="/scope" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>my scope →</a>
            </>
          ) : (
            <a href="/scope" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>get access →</a>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 24px 80px" }}>
        <section style={{ padding: "48px 0 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "center" }}>
            <div>
              <h1 className="animate-d1" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "14px" }}>
                Deal flow infrastructure.<br />
                <span style={{ color: "var(--rasp)" }}>Built for the AI era.</span>
              </h1>
              <p className="animate-d2" style={{ fontSize: "13px", color: "var(--white-mid)", lineHeight: 1.8, marginBottom: "24px" }}>
                One link for investors. One link for founders. A common format that agents, LLMs, and humans can all read.
              </p>
              <div className="animate-d3" style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <a href="/scope" className="btn-primary" style={{ justifyContent: "center" }}>$ create investor scope →</a>
                <a href="/passport" className="btn-secondary" style={{ justifyContent: "center" }}>$ create startup passport →</a>
              </div>
              <div className="animate-d4" style={{ fontSize: "11px", color: "var(--white-mid)", letterSpacing: "0.06em" }}>
                <span style={{ color: "var(--rasp)" }}>//</span> AI-native · /for-llm auto-generated · QR-ready · open format
              </div>
            </div>
            <div className="animate-d2" style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 10px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
                <span style={{ margin: "0 auto", fontSize: "9px", color: "var(--white-dim)", letterSpacing: "0.06em" }}>scopecheck.ai — terminal</span>
              </div>
              <div style={{ padding: "14px 16px", lineHeight: 1.85, fontSize: "11px" }}>
                <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span> scopecheck init investor</div>
                <div style={{ color: "var(--rasp)" }}>✓ scope created → scopecheck.ai/i/alex</div>
                <div style={{ color: "var(--white-dim)", fontSize: "10px" }}>&nbsp;&nbsp;criteria indexed · /for-llm generated · QR ready</div>
                <br />
                <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span> scopecheck init founder</div>
                <div style={{ color: "var(--amber)" }}>✓ passport created → scopecheck.ai/f/carbonade</div>
                <div style={{ color: "var(--white-dim)", fontSize: "10px" }}>&nbsp;&nbsp;deck linked · data room connected · apply link live</div>
                <br />
                <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span><span className="cursor" /></div>
              </div>
            </div>
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />

        <section id="how" style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--white-mid)" }}>
              <span style={{ color: "var(--rasp)" }}>01</span> how it works
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <Note text="shipped day 1 →" rotate={1.5} link="/log#006" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--bg2)", padding: "20px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>// for investors</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "8px", lineHeight: 1.3 }}>Your scope check.<br />One link.</h3>
              <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "14px", flex: 1 }}>Define your real criteria once. Founders who click your link get a structured, pre-filtered application form. AI agents can parse your criteria directly via /for-llm.</p>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--rasp)", padding: "8px 12px", fontSize: "11px", color: "var(--rasp)", marginBottom: "12px" }}>
                scopecheck.ai/i/<span style={{ color: "var(--amber)" }}>yourhandle</span>
              </div>
              {["auto-generated /for-llm page", "QR code for events", "inbound kanban + triage", "custom intake fields"].map((f, i) => (
                <div key={i} style={{ fontSize: "11px", color: "var(--white-mid)", marginBottom: "3px" }}>→ {f}</div>
              ))}
            </div>
            <div style={{ background: "var(--bg2)", padding: "20px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// for founders</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "8px", lineHeight: 1.3 }}>Your startup passport.<br />Carry it everywhere.</h3>
              <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "14px", flex: 1 }}>Build your profile once. When you apply to any investor on ScopeCheck, core fields pre-fill automatically. Share your public page at events via QR.</p>
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
            <p style={{ fontSize: "12px", color: "var(--white-mid)", fontStyle: "italic", flex: 1 }}>&ldquo;Hey John, met Harry at Web Summit — was impressed. Here&apos;s his link.&rdquo;</p>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "6px 12px", fontSize: "11px", color: "var(--rasp)", whiteSpace: "nowrap" }}>scopecheck.ai/f/harryfounder</div>
          </div>
        </section>

        <section style={{ marginBottom: "48px" }}>
          <div className="section-header">
            <span className="section-label"><span className="section-num">02</span> example · investor scope</span>
          </div>
          <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <span style={{ fontSize: "11px", color: "var(--rasp)" }}>scopecheck.ai/i/alex</span>
              <span className="tag tag-rasp"><span style={{ animation: "blink 2s ease infinite", display: "inline-block" }}>●</span> open to inbound</span>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "3px" }}>Alex Farcet</h2>
                  <p style={{ fontSize: "11px", color: "var(--white-mid)" }}>Raspberry Ventures · Lisbon & UK · Co-investment syndicate</p>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <span className="tag">seed</span><span className="tag">early-a</span>
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
                <a href="/i/alex/apply" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>$ apply →</a>
                <button className="btn-secondary" style={{ padding: "7px 10px" }}>▣ QR</button>
                <button className="btn-secondary" style={{ padding: "7px 10px", fontSize: "10px" }}>/for-llm</button>
                <Note text="AI can read this!" rotate={2} link="/log#005" />
              </div>
            </div>
          </div>
        </section>

        <section id="access">
          <div className="section-header">
            <span className="section-label"><span className="section-num">03</span> get started</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <a href="/scope" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--rasp)", padding: "24px", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "10px" }}>// investor</div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "var(--white)" }}>Create your investor scope</div>
              <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px" }}>Define your criteria once. Share one link. Founders apply in a structured format.</div>
              <div style={{ fontSize: "11px", color: "var(--rasp)", fontWeight: 700, letterSpacing: "0.06em" }}>$ get started →</div>
            </a>
            <a href="/passport" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", padding: "24px", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "10px" }}>// founder</div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "var(--white)" }}>Create your startup passport</div>
              <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px" }}>Fill in once. Auto-populates investor applications. Share via QR at events.</div>
              <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 700, letterSpacing: "0.06em" }}>$ get started →</div>
            </a>
          </div>
          <p style={{ fontSize: "11px", color: "var(--white-dim)", textAlign: "center", marginTop: "14px" }}>
            Already have a scope? <a href="/dashboard" style={{ color: "var(--rasp)", textDecoration: "none" }}>go to dashboard →</a>
          </p>
        </section>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "820px", margin: "0 auto" }}>
        <span style={{ fontSize: "11px", color: "var(--white-mid)" }}>scopecheck.ai · by <a href="https://raspberry.ventures" target="_blank" rel="noopener" style={{ color: "var(--rasp)", textDecoration: "none" }}>raspberry.ventures</a></span>
        <span style={{ fontSize: "10px", color: "var(--white-dim)" }}>// built in public with AI · 2026</span>
      </footer>
    </main>
  );
}
