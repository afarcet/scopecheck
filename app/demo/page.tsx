"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Investor scope data (Raspberry Syndicate) ───────────────────────────────
const INVESTOR = {
  name: "Alex Farcet",
  handle: "raspberrysyndicate",
  firm: "Raspberry Ventures",
  location: "Lisbon & UK",
  type: "Co-investment syndicate",
  stages: ["seed", "early-a"],
  sectors: ["ClimateTech", "Applied AI"],
  geographies: ["Europe", "Israel", "Africa", "US (select)"],
  ticket_min: 50,
  ticket_max: 650,
  wont_invest: "pre-seed · crypto · gaming · consumer apps",
  how_we_work: "We co-invest alongside lead VCs. One SPV per deal — single cap table line, fast close.",
};

// ─── Score computation (reactive, no AI) ────────────────────────────────────
function computeScore(form: typeof BLANK_FORM) {
  const sectors = INVESTOR.sectors.map(s => s.toLowerCase());
  const inputSector = form.sector.toLowerCase();
  const sectorMatch = sectors.some(s => inputSector.includes(s) || s.includes(inputSector.split(" ")[0]));

  const stageMap: Record<string, number> = {
    "seed": 20, "early-a": 20, "series a": 15, "pre-seed": 5, "series b+": 8,
  };
  const stageScore = stageMap[form.stage.toLowerCase()] ?? 0;

  const geos = INVESTOR.geographies.map(g => g.toLowerCase());
  const inputGeo = form.geography.toLowerCase();
  const geoMatch = geos.some(g => inputGeo.includes(g.split(" ")[0]) || g.includes(inputGeo.split(",")[0]?.trim()));

  const hasTraction = form.traction.length > 10;
  const hasRound = form.round_size.length > 0;
  const hasDeck = form.deck_url.length > 5;

  const founderScore  = form.founder_name && form.company_name ? (hasTraction ? 16 : 10) : 0;
  const tractionScore = hasTraction ? (hasRound ? 16 : 11) : 0;
  const sectorScore   = sectorMatch ? 18 : (form.sector.length > 2 ? 8 : 0);
  const stageGeoScore = stageScore > 0 ? stageScore * 0.65 + (geoMatch ? 7 : 3) : 0;
  const structScore   = hasDeck ? 8 : (form.deck_url.length > 0 ? 4 : 0);
  const valueScore    = (hasTraction && sectorMatch) ? 8 : (hasTraction ? 4 : 0);
  const bonusScore    = (sectorMatch && stageScore >= 15 && geoMatch) ? 6 : (sectorMatch && stageScore >= 15 ? 3 : 0);

  const total = Math.min(
    Math.round(founderScore + tractionScore + sectorScore + stageGeoScore + structScore + valueScore + bonusScore),
    90
  );

  return {
    total,
    breakdown: [
      { label: "Founder Profile",       score: Math.round(founderScore),       max: 20 },
      { label: "Traction & Metrics",    score: Math.round(tractionScore),      max: 20 },
      { label: "Sector & Thesis",       score: Math.round(sectorScore),        max: 20 },
      { label: "Stage & Geography",     score: Math.round(stageGeoScore),      max: 20 },
      { label: "Structural Fit",        score: Math.round(structScore),        max: 10 },
      { label: "Value-Add Synergy",     score: Math.round(valueScore),         max: 10 },
    ],
    hasEnoughData: form.founder_name.length > 0 && form.company_name.length > 0,
  };
}

const BLANK_FORM = {
  founder_name: "", company_name: "", one_liner: "",
  stage: "", sector: "", geography: "",
  round_size: "", traction: "", deck_url: "",
};

// ─── Score bar component ──────────────────────────────────────────────────────
function ScoreBar({ label, score, max, animate }: { label: string; score: number; max: number; animate: boolean }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const color = pct >= 70 ? "var(--rasp)" : pct >= 40 ? "var(--amber)" : "var(--border2)";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: "10px", color: score > 0 ? color : "var(--white-dimmer)", fontWeight: 700 }}>
          {score} / {max}
        </span>
      </div>
      <div style={{ height: "3px", background: "var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`,
          background: color,
          transition: animate ? "width 0.6s ease, background 0.3s ease" : "none",
        }} />
      </div>
    </div>
  );
}

// ─── Donut circle ─────────────────────────────────────────────────────────────
function ScoreDonut({ score, animate }: { score: number; animate: boolean }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 70 ? "var(--rasp)" : score >= 50 ? "var(--amber)" : "var(--border2)";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="butt"
        style={{ transition: animate ? "stroke-dashoffset 0.8s ease, stroke 0.3s ease" : "none" }}
      />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        style={{ fill: color, fontSize: "15px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, transform: "rotate(90deg)", transformOrigin: "36px 36px", transition: animate ? "fill 0.3s ease" : "none" }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [form, setForm] = useState(BLANK_FORM);
  const [scoreData, setScoreData] = useState(computeScore(BLANK_FORM));
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState<"investor" | "founder">("investor");

  useEffect(() => {
    setAnimate(true);
    setScoreData(computeScore(form));
    const t = setTimeout(() => setAnimate(false), 900);
    return () => clearTimeout(t);
  }, [form]);

  const inputStyle = {
    background: "var(--bg3)", border: "1px solid var(--border2)",
    color: "var(--white)", fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px", padding: "8px 12px", width: "100%",
    outline: "none", boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  };
  const labelStyle = {
    fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" as const,
    color: "var(--white-mid)", display: "block", marginBottom: "5px",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
          <span style={{ fontSize: "10px", color: "var(--white-dimmer)", letterSpacing: "0.1em" }}>// interactive demo</span>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <Link href="/log" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none" }}>// build log</Link>
          <Link href="/scope" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px" }}>define your scope →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* HERO */}
        <section style={{ padding: "48px 0 36px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>
            // see how it works · live demo
          </div>
          <h1 className="animate-d1" style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "14px" }}>
            60 seconds.<br />
            <span style={{ color: "var(--rasp)" }}>Investor sees structured inbound.</span><br />
            <span style={{ color: "var(--amber)" }}>Founder gets a passport + a score.</span>
          </h1>
          <p className="animate-d2" style={{ fontSize: "13px", color: "var(--white-mid)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.75 }}>
            Fill in the founder side. Watch the fit score update in real time.<br />
            <span style={{ color: "var(--white-dimmer)", fontSize: "11px" }}>// no sign-in required to explore · click send intro when ready</span>
          </p>
        </section>

        {/* MOBILE TAB SWITCHER */}
        <div className="demo-tabs" style={{ display: "none", marginBottom: "16px", border: "1px solid var(--border2)" }}>
          {(["investor", "founder"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "10px", background: activeTab === tab ? (tab === "investor" ? "var(--rasp-dim)" : "var(--amber-dim)") : "var(--bg2)",
              border: "none", borderBottom: activeTab === tab ? `2px solid ${tab === "investor" ? "var(--rasp)" : "var(--amber)"}` : "2px solid transparent",
              color: activeTab === tab ? (tab === "investor" ? "var(--rasp)" : "var(--amber)") : "var(--white-mid)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer",
            }}>
              // {tab}
            </button>
          ))}
        </div>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)", alignItems: "start" }}>

          {/* LEFT — INVESTOR SCOPE */}
          <div className={`demo-col-investor ${activeTab === "founder" ? "demo-col-hidden" : ""}`}
            style={{ background: "var(--bg2)", padding: "0" }}>
            {/* Header */}
            <div style={{ borderBottom: "2px solid var(--rasp)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--rasp)" }}>// investor scope</span>
              <span className="tag tag-rasp" style={{ fontSize: "9px" }}>
                <span style={{ animation: "blink 2s ease infinite", display: "inline-block" }}>●</span> open to inbound
              </span>
            </div>

            {/* Scope URL */}
            <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <span style={{ fontSize: "10px", color: "var(--rasp)" }}>scopecheck.ai/i/</span>
              <span style={{ fontSize: "10px", color: "var(--white-mid)" }}>raspberrysyndicate</span>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Investor name */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "3px" }}>{INVESTOR.name}</div>
                <div style={{ fontSize: "11px", color: "var(--white-mid)" }}>{INVESTOR.firm} · {INVESTOR.location} · {INVESTOR.type}</div>
                <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
                  {INVESTOR.stages.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>

              {/* Criteria table */}
              <div className="criteria-table" style={{ marginBottom: "18px" }}>
                <div className="criteria-row">
                  <div className="criteria-key">ticket_size</div>
                  <div className="criteria-val"><span style={{ color: "var(--rasp)" }}>€{INVESTOR.ticket_min}K → €{INVESTOR.ticket_max}K</span> <span style={{ color: "var(--white-dim)", fontSize: "10px" }}>// via SPV</span></div>
                </div>
                <div className="criteria-row">
                  <div className="criteria-key">sectors</div>
                  <div className="criteria-val">
                    {INVESTOR.sectors.map((s, i) => (
                      <span key={s}><span style={{ color: "var(--rasp)" }}>{s}</span>{i < INVESTOR.sectors.length - 1 ? " · " : ""}</span>
                    ))}
                  </div>
                </div>
                <div className="criteria-row">
                  <div className="criteria-key">geography</div>
                  <div className="criteria-val" style={{ color: "var(--white)" }}>{INVESTOR.geographies.join(" · ")}</div>
                </div>
                <div className="criteria-row">
                  <div className="criteria-key">wont_invest</div>
                  <div className="criteria-val" style={{ color: "var(--white-mid)" }}>{INVESTOR.wont_invest}</div>
                </div>
                <div className="criteria-row">
                  <div className="criteria-key">how_we_work</div>
                  <div className="criteria-val" style={{ color: "var(--white-mid)", fontStyle: "italic", fontSize: "11px" }}>{INVESTOR.how_we_work}</div>
                </div>
              </div>

              {/* Tip */}
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--rasp)", padding: "10px 14px", fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.65 }}>
                <span style={{ color: "var(--rasp)", fontWeight: 700 }}>This is a live scope.</span> Fill in the founder side →<br />
                <span style={{ fontSize: "10px", color: "var(--white-dimmer)" }}>Your fit score updates as you type.</span>
              </div>
            </div>
          </div>

          {/* RIGHT — FOUNDER FORM */}
          <div className={`demo-col-founder ${activeTab === "investor" && "demo-col-hidden-mobile"}`}
            style={{ background: "var(--bg2)", padding: "0" }}>
            {/* Header */}
            <div style={{ borderBottom: "2px solid var(--amber)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)" }}>// founder intro</span>
              <span style={{ fontSize: "10px", color: "var(--white-dimmer)", letterSpacing: "0.06em" }}>builds your passport</span>
            </div>

            {/* Passport URL preview */}
            <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "var(--amber)" }}>scopecheck.ai/f/</span>
              <span style={{ fontSize: "10px", color: "var(--white-mid)" }}>
                {form.company_name ? form.company_name.toLowerCase().replace(/[^a-z0-9]/g, "") : <span style={{ color: "var(--white-dimmer)" }}>yourcompany</span>}
              </span>
              {form.company_name && (
                <span style={{ marginLeft: "auto", fontSize: "9px", color: "var(--amber)", letterSpacing: "0.08em" }}>// your passport url</span>
              )}
            </div>

            <div style={{ padding: "20px" }}>
              {/* SCORE PREVIEW — live */}
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderTop: `2px solid ${scoreData.total >= 60 ? "var(--rasp)" : scoreData.total >= 30 ? "var(--amber)" : "var(--border2)"}`, marginBottom: "18px", padding: "14px 16px", transition: "border-top-color 0.4s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--white-mid)", marginBottom: "2px" }}>fit score</div>
                    <div style={{ fontSize: "9px", color: "var(--rasp)", letterSpacing: "0.08em" }}>
                      ★ coming soon · AI scoring
                    </div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <ScoreDonut score={scoreData.total} animate={animate} />
                    {!scoreData.hasEnoughData && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "9px", color: "var(--white-dimmer)", textAlign: "center", lineHeight: 1.3 }}>fill<br/>form</span>
                      </div>
                    )}
                  </div>
                </div>
                {scoreData.breakdown.map(row => (
                  <ScoreBar key={row.label} label={row.label} score={row.score} max={row.max} animate={animate} />
                ))}
                {!scoreData.hasEnoughData && (
                  <div style={{ fontSize: "10px", color: "var(--white-dimmer)", textAlign: "center", marginTop: "8px", letterSpacing: "0.06em" }}>
                    // start filling in your intro to see your score
                  </div>
                )}
              </div>

              {/* FORM */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={labelStyle}>your name *</label>
                  <input style={inputStyle} value={form.founder_name} onChange={e => setForm(f => ({ ...f, founder_name: e.target.value }))} placeholder="Harry Founder" />
                </div>
                <div>
                  <label style={labelStyle}>company *</label>
                  <input style={inputStyle} value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Carbonade" />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={labelStyle}>one-liner *</label>
                <input style={inputStyle} value={form.one_liner} onChange={e => setForm(f => ({ ...f, one_liner: e.target.value }))} placeholder="AI-optimised heat pumps for industrial decarbonisation." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={labelStyle}>stage *</label>
                  <select style={{ ...inputStyle, appearance: "none" as const }} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                    <option value="">select</option>
                    {["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>sector *</label>
                  <input style={inputStyle} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} placeholder="ClimateTech" />
                </div>
                <div>
                  <label style={labelStyle}>based in</label>
                  <input style={inputStyle} value={form.geography} onChange={e => setForm(f => ({ ...f, geography: e.target.value }))} placeholder="Berlin, DE" />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={labelStyle}>traction *</label>
                <input style={inputStyle} value={form.traction} onChange={e => setForm(f => ({ ...f, traction: e.target.value }))} placeholder="€180K ARR · 3 enterprise pilots · 94% retention" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>round size (€)</label>
                  <input style={inputStyle} value={form.round_size} onChange={e => setForm(f => ({ ...f, round_size: e.target.value }))} placeholder="2,000,000" />
                </div>
                <div>
                  <label style={labelStyle}>deck link</label>
                  <input style={inputStyle} type="url" value={form.deck_url} onChange={e => setForm(f => ({ ...f, deck_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/i/raspberrysyndicate`}
                className="btn-primary"
                style={{ display: "block", textAlign: "center", padding: "12px", fontSize: "12px", width: "100%", justifyContent: "center", opacity: form.founder_name && form.company_name && form.one_liner && form.stage ? 1 : 0.4, pointerEvents: form.founder_name && form.company_name && form.one_liner && form.stage ? "auto" : "none" }}>
                $ send real intro to Alex Farcet →
              </Link>
              <div style={{ fontSize: "10px", color: "var(--white-dimmer)", textAlign: "center", marginTop: "8px" }}>
                // takes you to the live scope page · your fields will auto-fill on return visits
              </div>
            </div>
          </div>
        </div>

        {/* PASSPORT EXPLAINER */}
        <div style={{ marginTop: "1px", background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", padding: "16px 24px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginRight: "10px" }}>// your passport</span>
            <span style={{ fontSize: "12px", color: "var(--white-mid)" }}>
              A clean shareable URL for your startup. Works like Docsend — without the paywall.
              <span style={{ color: "var(--white-dimmer)" }}> Auto-fills on every investor scope you visit.</span>
            </span>
          </div>
          <Link href="/f/acme" style={{ fontSize: "11px", color: "var(--amber)", textDecoration: "none", whiteSpace: "nowrap", border: "1px solid var(--amber-border)", padding: "6px 12px" }}>
            see example passport →
          </Link>
        </div>

        {/* BOTTOM CTAs */}
        <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Link href="/scope" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--rasp)", padding: "24px", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "8px" }}>// investor</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--white)" }}>Define your scope</div>
            <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "14px" }}>One link. Structured inbound. No back-and-forth.</div>
            <div style={{ fontSize: "11px", color: "var(--rasp)", fontWeight: 700, letterSpacing: "0.06em" }}>$ define your scope →</div>
          </Link>
          <Link href="/passport" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", padding: "24px", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "8px" }}>// founder</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--white)" }}>Build your passport</div>
            <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "14px" }}>Fill in once. Share anywhere. Score before you send.</div>
            <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 700, letterSpacing: "0.06em" }}>$ build your passport →</div>
          </Link>
        </div>

        {/* FOOTER NOTE */}
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "10px", color: "var(--white-dimmer)", letterSpacing: "0.08em" }}>
          <span style={{ color: "var(--rasp)" }}>//</span> fit scoring is a preview · AI-powered matching coming soon ·{" "}
          <Link href="/log" style={{ color: "var(--white-dimmer)", textDecoration: "none" }}>see build log</Link>
        </div>
      </div>

      {/* MOBILE STYLES */}
      <style>{`
        @media (max-width: 640px) {
          .demo-tabs { display: flex !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
          .demo-col-hidden { display: none !important; }
        }
      `}</style>
    </main>
  );
}
