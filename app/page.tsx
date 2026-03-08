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
  const [sessionUser, setSessionUser] = useState<{ email: string; role: string | null } | null>(null);

  useEffect(() => {
    const resolveSession = async (userId: string, email: string) => {
      const [{ data: inv }, { data: founder }] = await Promise.all([
        supabase.from("investors").select("handle").eq("user_id", userId).maybeSingle(),
        supabase.from("founders").select("handle").eq("user_id", userId).maybeSingle(),
      ]);
      const role = inv && founder ? "both" : inv ? "investor" : founder ? "founder" : null;
      setSessionUser({ email, role });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
      if (session?.user) resolveSession(session.user.id, session.user.email!);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
      if (session?.user) resolveSession(session.user.id, session.user.email!);
      else setSessionUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          <span style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>&gt; scopecheck.ai</span>
          <Link href="/log" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none", whiteSpace: "nowrap" }}>// build log</Link>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          <a href="#how" className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>how it works</a>
          {authed && sessionUser ? (
            <>
              <span style={{ fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.06em", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sessionUser.email}</span>
              {(sessionUser.role === "investor" || sessionUser.role === "both") && (
                <a href="/dashboard" className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>pipeline →</a>
              )}
              {(sessionUser.role === "founder" || sessionUser.role === "both") && (
                <a href="/founder-dashboard" className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>my passport →</a>
              )}
              {sessionUser.role === null && (
                <a href="/scope" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>define scope →</a>
              )}
            </>
          ) : (
            <a href="/scope" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px", whiteSpace: "nowrap" }}>get started →</a>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* HERO */}
        <section style={{ padding: "64px 0 48px", textAlign: "center" }}>
          <h1 className="animate-d1" style={{ fontSize: "clamp(32px, 5.5vw, 58px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "16px" }}>
            Deal flow infrastructure.<br />
            <span style={{ color: "var(--rasp)" }}>Built for the AI era.</span>
          </h1>

          <div className="animate-d2" style={{ fontSize: "clamp(14px, 2vw, 18px)", marginBottom: "24px", lineHeight: 1.5 }}>
            <span style={{ color: "var(--rasp)", fontWeight: 600 }}>Investors</span>
            <span style={{ color: "var(--white-mid)" }}> define their scope. </span>
            <span style={{ color: "var(--amber)", fontWeight: 600 }}>Founders</span>
            <span style={{ color: "var(--white-mid)" }}> build their passport.</span>
          </div>

          <p className="animate-d3" style={{ fontSize: "14px", color: "var(--white-mid)", lineHeight: 1.8, maxWidth: "480px", margin: "0 auto 32px", }}>
            Investors define their criteria once — every founder who reaches out already knows the scope.
            Founders build their passport once — it travels with them to every investor.
          </p>

          <div className="animate-d4" style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            <a href="/scope" className="btn-primary" style={{ padding: "11px 24px", fontSize: "12px" }}>$ define your scope →</a>
            <a href="/passport" style={{ padding: "11px 24px", fontSize: "12px", background: "var(--amber)", color: "#000", border: "1px solid var(--amber)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.06em", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>$ build your passport →</a>
          </div>

          <div className="animate-d5" style={{ fontSize: "11px", color: "var(--white-dim)", letterSpacing: "0.08em" }}>
            <span style={{ color: "var(--rasp)" }}>//</span> AI-native · /for-llm auto-generated · QR-ready · open format
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 48px" }} />

        {/* ONE TO MANY */}
        <section style={{ marginBottom: "56px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0", alignItems: "stretch" }}>

            {/* Investor side */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--rasp)", padding: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "14px" }}>// for investors</div>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px", color: "var(--white)" }}>Define once.<br />Reach many founders.</div>
              <p style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px" }}>
                Define once, share proactively. Every founder who reaches out already knows your criteria — structured inbound, no back-and-forth.
              </p>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--rasp)", padding: "7px 12px", fontSize: "11px", color: "var(--rasp)", marginBottom: "14px", letterSpacing: "0.02em" }}>
                <a href="/i/demo" style={{ textDecoration: "none", color: "inherit" }}>scopecheck.ai/i/<span style={{ color: "var(--white-mid)" }}>yourhandle</span></a>
              </div>
              {/* Fan-out visual */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {["founder A sends structured intro", "founder B sends structured intro", "founder C sends structured intro", "..."].map((f, i) => (
                  <div key={i} style={{ fontSize: "10px", color: i === 3 ? "var(--white-dimmer)" : "var(--white-mid)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "var(--rasp)", fontSize: "9px" }}>→</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Centre divider */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 8px", gap: "0" }}>
              <div style={{ width: "1px", flex: 1, background: "var(--border)" }} />
              <div style={{ padding: "12px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "20px", color: "var(--rasp)", lineHeight: 1 }}>→</span>
                <span style={{ fontSize: "20px", color: "var(--amber)", lineHeight: 1 }}>←</span>
              </div>
              <div style={{ width: "1px", flex: 1, background: "var(--border)" }} />
            </div>

            {/* Founder side */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", padding: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "14px" }}>// for founders</div>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px", color: "var(--white)" }}>Build once.<br />Apply to many investors.</div>
              <p style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px" }}>
                Build your passport once. Share it with any investor — on ScopeCheck or anywhere else. Apply in seconds without repeating yourself.
              </p>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--amber)", padding: "7px 12px", fontSize: "11px", color: "var(--amber)", marginBottom: "14px", letterSpacing: "0.02em" }}>
                <a href="/f/acme" style={{ textDecoration: "none", color: "inherit" }}>scopecheck.ai/f/<span style={{ color: "var(--white-mid)" }}>yourcompany</span></a>
              </div>
              {/* Fan-out visual */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {["sent to investor A", "sent to investor B", "sent to investor C", "..."].map((f, i) => (
                  <div key={i} style={{ fontSize: "10px", color: i === 3 ? "var(--white-dimmer)" : "var(--white-mid)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "var(--amber)", fontSize: "9px" }}>→</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connector row */}
          <div style={{ marginTop: "1px", background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", padding: "14px 20px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-mid)", whiteSpace: "nowrap" }}>// for connectors</div>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", fontStyle: "italic", flex: 1 }}>
              &ldquo;Hey John, met Harry at Web Summit — was impressed. Here&apos;s his passport.&rdquo;
            </p>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "6px 12px", fontSize: "11px", color: "var(--amber)", whiteSpace: "nowrap" }}>
              scopecheck.ai/f/harryfounder
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ marginBottom: "56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--white-mid)" }}>
              <span style={{ color: "var(--rasp)" }}>01</span> how it works
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <Note text="shipped day 1 →" rotate={1.5} link="/log#006" />
          </div>

          {/* Symmetric two-column progression */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>

            {/* Investor column */}
            <div style={{ background: "var(--bg2)", padding: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "20px" }}>// investor</div>
              {[
                { step: "today", label: "Define your scope once. Every founder who reaches out already knows your criteria — structured, fast, no back-and-forth." },
                { step: "next", label: "Every inbound is scored for fit before you open it. Know in seconds if it's worth your time." },
                { step: "soon", label: "We surface the right founders to you proactively. Relevant inbound, without the noise." },
              ].map(({ step, label }) => (
                <div key={step} style={{ display: "flex", gap: "14px", marginBottom: "18px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: step === "today" ? "var(--rasp)" : "var(--white-dim)", whiteSpace: "nowrap", paddingTop: "2px", minWidth: "36px" }}>{step}</div>
                  <p style={{ fontSize: "11px", color: step === "today" ? "var(--white)" : "var(--white-mid)", lineHeight: 1.7, margin: 0 }}>{label}</p>
                </div>
              ))}
              <a href="/scope" className="btn-primary" style={{ display: "block", textAlign: "center", fontSize: "11px", padding: "9px" }}>$ define your scope →</a>
            </div>

            {/* Founder column */}
            <div style={{ background: "var(--bg2)", padding: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "20px" }}>// founder</div>
              {[
                { step: "today", label: "Build your passport once. Find an investor on ScopeCheck, send your intro in seconds — fields auto-fill on every return visit." },
                { step: "next", label: "Know your chances, and customise, before sending your passport." },
                { step: "soon", label: "We surface the right investors for your stage and sector. Warm, relevant introductions — without cold outreach." },
              ].map(({ step, label }) => (
                <div key={step} style={{ display: "flex", gap: "14px", marginBottom: "18px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: step === "today" ? "var(--amber)" : "var(--white-dim)", whiteSpace: "nowrap", paddingTop: "2px", minWidth: "36px" }}>{step}</div>
                  <p style={{ fontSize: "11px", color: step === "today" ? "var(--white)" : "var(--white-mid)", lineHeight: 1.7, margin: 0 }}>{label}</p>
                </div>
              ))}
              <a href="/passport" style={{ display: "block", textAlign: "center", fontSize: "11px", padding: "9px", background: "var(--amber)", color: "#000", border: "1px solid var(--amber)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.06em", textDecoration: "none" }}>$ build your passport →</a>
            </div>
          </div>
        </section>

        {/* EXAMPLE PROFILE */}
        <section style={{ marginBottom: "56px" }}>
          <div className="section-header">
            <span className="section-label"><span className="section-num">02</span> example · investor scope</span>
          </div>
          <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <span style={{ fontSize: "11px", color: "var(--rasp)" }}>scopecheck.ai/i/raspberry</span>
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
                <a href="/i/raspberry" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>$ send intro →</a>
                <button className="btn-secondary" style={{ padding: "7px 10px" }}>▣ QR</button>
                <button className="btn-secondary" style={{ padding: "7px 10px", fontSize: "10px" }}>/for-llm</button>
                <Note text="AI can read this!" rotate={2} link="/log#005" />
              </div>
            </div>
          </div>

          {/* Pull quote */}
          <div style={{ marginTop: "1px", background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", padding: "16px 20px", borderLeft: "3px solid var(--rasp)" }}>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", fontStyle: "italic", lineHeight: 1.7, margin: "0 0 6px" }}>
              &ldquo;I literally write: see my ScopeCheck, if you think we&apos;re a fit, email me your passport. Takes 2 seconds to respond. Filters inbound. Stays responsive.&rdquo;
            </p>
            <span style={{ fontSize: "10px", color: "var(--rasp)", letterSpacing: "0.08em" }}>— Alex Farcet, Raspberry Ventures · investor #001</span>
          </div>
        </section>

        {/* COMING SOON */}
        <section style={{ marginBottom: "56px" }}>
          <div className="section-header">
            <span className="section-label"><span className="section-num">03</span> what&apos;s coming</span>
          </div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "10px" }}>// for investors</div>
              {["fit scoring on every inbound // coming soon", "proactive founder matching // later", "competitor scan on any passport // later"].map((f, i) => (
                <div key={i} style={{ fontSize: "11px", color: i === 0 ? "var(--white-mid)" : "var(--white-dimmer)", marginBottom: "6px", display: "flex", gap: "8px" }}>
                  <span style={{ color: i === 0 ? "var(--rasp)" : "var(--border2)" }}>▸</span> {f}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "10px" }}>// for founders</div>
              {["fit score before you send // coming soon", "investor match suggestions // later", "round completion tracker // later"].map((f, i) => (
                <div key={i} style={{ fontSize: "11px", color: i === 0 ? "var(--white-mid)" : "var(--white-dimmer)", marginBottom: "6px", display: "flex", gap: "8px" }}>
                  <span style={{ color: i === 0 ? "var(--amber)" : "var(--border2)" }}>▸</span> {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GET STARTED */}
        <section id="access">
          <div className="section-header">
            <span className="section-label"><span className="section-num">04</span> get started</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <a href="/scope" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--rasp)", padding: "24px", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "10px" }}>// investor</div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "var(--white)" }}>Define your investor scope</div>
              <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px" }}>Define your criteria once. Share one link. Founders send structured intros.</div>
              <div style={{ fontSize: "11px", color: "var(--rasp)", fontWeight: 700, letterSpacing: "0.06em" }}>$ define your scope →</div>
            </a>
            <a href="/passport" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", padding: "24px", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "10px" }}>// founder</div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "var(--white)" }}>Build your startup passport</div>
              <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "16px" }}>Fill in once. Auto-fills on every investor scope you visit. Share via QR at events.</div>
              <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 700, letterSpacing: "0.06em" }}>$ build your passport →</div>
            </a>
          </div>
          <p style={{ fontSize: "11px", color: "var(--white-dim)", textAlign: "center", marginTop: "14px" }}>
            Already have a scope? <a href="/dashboard" style={{ color: "var(--rasp)", textDecoration: "none" }}>go to dashboard →</a>
          </p>
        </section>

        {/* TERMINAL — demoted to atmosphere */}
        <section style={{ marginTop: "56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--white-dimmer)" }}>
              <span style={{ color: "var(--rasp)" }}>//</span> under the hood
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }}>
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
              <div style={{ color: "var(--white-dim)", fontSize: "10px" }}>&nbsp;&nbsp;deck linked · data room connected · intro link live</div>
              <br />
              <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span> scopecheck match --investor=alex --founder=carbonade</div>
              <div style={{ color: "var(--white-dim)", fontSize: "10px" }}>// fit scoring · coming soon</div>
              <br />
              <div><span style={{ color: "var(--white-mid)" }}>~/dealflow <span style={{ color: "var(--amber)" }}>$</span></span><span className="cursor" /></div>
            </div>
          </div>
        </section>

      </div>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "820px", margin: "0 auto" }}>
        <span style={{ fontSize: "11px", color: "var(--white-mid)" }}>scopecheck.ai · by <a href="https://raspberry.ventures" target="_blank" rel="noopener" style={{ color: "var(--rasp)", textDecoration: "none" }}>raspberry.ventures</a></span>
        <span style={{ fontSize: "10px", color: "var(--white-dim)" }}>// built in public with AI · 2026</span>
      </footer>
    </main>
  );
}
