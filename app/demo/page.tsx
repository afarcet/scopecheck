"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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

const BLANK_FORM = {
  founder_name: "", company_name: "", one_liner: "",
  stage: "", sector: "", geography: "",
  round_size: "", traction: "", deck_url: "",
};

function computeScore(form: typeof BLANK_FORM) {
  const sectors = INVESTOR.sectors.map(s => s.toLowerCase());
  const inputSector = form.sector.toLowerCase();
  const sectorMatch = sectors.some(s => inputSector.includes(s.split(" ")[0].toLowerCase()) || s.includes(inputSector.split(" ")[0]));
  const stageMap: Record<string, number> = { "seed": 20, "early-a": 20, "series a": 14, "pre-seed": 5, "series b+": 7 };
  const stageScore = stageMap[form.stage.toLowerCase()] ?? 0;
  const geos = INVESTOR.geographies.map(g => g.toLowerCase());
  const inputGeo = form.geography.toLowerCase();
  const geoMatch = geos.some(g => inputGeo.includes(g.split(" ")[0]) || g.includes(inputGeo.split(",")[0]?.trim()));
  const hasTraction = form.traction.length > 10;
  const hasRound = form.round_size.length > 0;
  const hasDeck = form.deck_url.length > 5;
  const founderScore  = form.founder_name && form.company_name ? (hasTraction ? 16 : 10) : 0;
  const tractionScore = hasTraction ? (hasRound ? 16 : 11) : 0;
  const sectorScore   = sectorMatch ? 18 : (form.sector.length > 2 ? 7 : 0);
  const stageGeoScore = stageScore > 0 ? stageScore * 0.65 + (geoMatch ? 7 : 3) : 0;
  const structScore   = hasDeck ? 8 : (form.deck_url.length > 0 ? 4 : 0);
  const valueScore    = (hasTraction && sectorMatch) ? 8 : (hasTraction ? 4 : 0);
  const bonusScore    = (sectorMatch && stageScore >= 15 && geoMatch) ? 6 : (sectorMatch && stageScore >= 15 ? 3 : 0);
  const total = Math.min(Math.round(founderScore + tractionScore + sectorScore + stageGeoScore + structScore + valueScore + bonusScore), 90);
  return {
    total,
    breakdown: [
      { label: "Founder Profile",    score: Math.round(founderScore),    max: 20 },
      { label: "Traction & Metrics", score: Math.round(tractionScore),   max: 20 },
      { label: "Sector & Thesis",    score: Math.round(sectorScore),     max: 20 },
      { label: "Stage & Geography",  score: Math.round(stageGeoScore),   max: 20 },
      { label: "Structural Fit",     score: Math.round(structScore),     max: 10 },
      { label: "Value-Add Synergy",  score: Math.round(valueScore),      max: 10 },
    ],
    hasData: form.founder_name.length > 0 || form.company_name.length > 0,
  };
}

function ScoreBar({ label, score, max, animate }: { label: string; score: number; max: number; animate: boolean }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const color = pct >= 70 ? "var(--rasp)" : pct >= 40 ? "var(--amber)" : "var(--border2)";
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontSize: "10px", color: score > 0 ? color : "var(--white-dimmer)", fontWeight: 700 }}>{score} / {max}</span>
      </div>
      <div style={{ height: "3px", background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: animate ? "width 0.5s ease, background 0.3s" : "none" }} />
      </div>
    </div>
  );
}

function ScoreDonut({ score, animate }: { score: number; animate: boolean }) {
  const r = 32, circ = 2 * Math.PI * r;
  const color = score >= 65 ? "var(--rasp)" : score >= 40 ? "var(--amber)" : "var(--border2)";
  const label = score >= 65 ? "strong fit" : score >= 40 ? "partial fit" : score > 0 ? "early signal" : "—";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: animate ? "stroke-dashoffset 0.7s ease, stroke 0.3s" : "none" }} />
        <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
          style={{ fill: color, fontSize: "17px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, transform: "rotate(90deg)", transformOrigin: "40px 40px", transition: animate ? "fill 0.3s" : "none" }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: "10px", color, letterSpacing: "0.08em", transition: "color 0.3s" }}>{label}</span>
    </div>
  );
}

export default function DemoPage() {
  const [form, setForm] = useState(BLANK_FORM);
  const [scoreData, setScoreData] = useState(computeScore(BLANK_FORM));
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    setScoreData(computeScore(form));
    const t = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(t);
  }, [form]);

  const inp = {
    background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--white)",
    fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", padding: "8px 10px",
    width: "100%", outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.15s",
  };
  const lbl = {
    fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const,
    color: "var(--white-mid)", display: "block", marginBottom: "4px",
  };

  const canSend = form.founder_name && form.company_name && form.one_liner && form.stage;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
          <span style={{ fontSize: "10px", color: "var(--white-dimmer)", letterSpacing: "0.1em" }}>// interactive demo</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/log" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none" }}>// build log</Link>
          <Link href="/scope" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px" }}>define your scope →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* HERO */}
        <section style={{ padding: "40px 0 32px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--white-dimmer)", marginBottom: "14px" }}>
            // interactive demo · no sign-in required
          </div>
          <h1 className="animate-d1" style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "12px" }}>
            An investor's scope. Your startup's fit.<br />
            <span style={{ color: "var(--white-mid)", fontWeight: 400, fontSize: "0.75em" }}>Fill in your intro on the right — the score reacts as you type.</span>
          </h1>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", fontSize: "11px", color: "var(--white-dimmer)" }}>
            <span><span style={{ color: "var(--rasp)" }}>←</span> real investor criteria</span>
            <span>·</span>
            <span>fill in your startup <span style={{ color: "var(--amber)" }}>→</span></span>
            <span>·</span>
            <span>see live fit score <span style={{ color: "var(--rasp)" }}>↓</span></span>
          </div>
        </section>

        {/* TWO-COLUMN */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)", alignItems: "start" }}>

          {/* LEFT — INVESTOR SCOPE */}
          <div style={{ background: "var(--bg2)" }}>
            {/* Header row — matches right column exactly */}
            <div style={{ borderBottom: "2px solid var(--rasp)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "46px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--rasp)" }}>// investor scope</span>
              <span className="tag tag-rasp" style={{ fontSize: "9px" }}>
                <span style={{ animation: "blink 2s ease infinite", display: "inline-block" }}>●</span>&nbsp;open to inbound
              </span>
            </div>
            {/* URL row — matches right */}
            <div style={{ padding: "9px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)", height: "37px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "var(--rasp)" }}>scopecheck.ai/i/</span>
              <span style={{ fontSize: "10px", color: "var(--white-mid)" }}>raspberrysyndicate</span>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "3px" }}>{INVESTOR.name}</div>
                <div style={{ fontSize: "11px", color: "var(--white-mid)", marginBottom: "8px" }}>{INVESTOR.firm} · {INVESTOR.location} · {INVESTOR.type}</div>
                <div style={{ display: "flex", gap: "5px" }}>
                  {INVESTOR.stages.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
              <div className="criteria-table" style={{ marginBottom: "16px" }}>
                <div className="criteria-row">
                  <div className="criteria-key">ticket_size</div>
                  <div className="criteria-val"><span style={{ color: "var(--rasp)" }}>€{INVESTOR.ticket_min}K → €{INVESTOR.ticket_max}K</span> <span style={{ color: "var(--white-dim)", fontSize: "10px" }}>// via SPV</span></div>
                </div>
                <div className="criteria-row">
                  <div className="criteria-key">sectors</div>
                  <div className="criteria-val">{INVESTOR.sectors.map((s, i) => <span key={s}><span style={{ color: "var(--rasp)" }}>{s}</span>{i < INVESTOR.sectors.length - 1 ? " · " : ""}</span>)}</div>
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
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--rasp)", padding: "10px 14px", fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.65 }}>
                <span style={{ color: "var(--rasp)", fontWeight: 700 }}>This is a live scope.</span> Fill in your startup on the right →<br />
                <span style={{ fontSize: "10px", color: "var(--white-dimmer)" }}>The fit score below updates as you type.</span>
              </div>
            </div>
          </div>

          {/* RIGHT — FOUNDER FORM */}
          <div style={{ background: "var(--bg2)" }}>
            {/* Header row — same height as left */}
            <div style={{ borderBottom: "2px solid var(--amber)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "46px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)" }}>// your startup intro</span>
              <span style={{ fontSize: "10px", color: "var(--white-dimmer)", letterSpacing: "0.06em" }}>builds your passport</span>
            </div>
            {/* URL preview row — same height as left */}
            <div style={{ padding: "9px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)", height: "37px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "var(--amber)" }}>scopecheck.ai/f/</span>
              <span style={{ fontSize: "10px", color: form.company_name ? "var(--white-mid)" : "var(--white-dimmer)" }}>
                {form.company_name ? form.company_name.toLowerCase().replace(/[^a-z0-9]/g, "") : "yourcompany"}
              </span>
            </div>
            {/* FORM — no score here */}
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={lbl}>your name *</label>
                  <input style={inp} value={form.founder_name} onChange={e => setForm(f => ({ ...f, founder_name: e.target.value }))} placeholder="Harry Founder" />
                </div>
                <div>
                  <label style={lbl}>company *</label>
                  <input style={inp} value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Carbonade" />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={lbl}>one-liner *</label>
                <input style={inp} value={form.one_liner} onChange={e => setForm(f => ({ ...f, one_liner: e.target.value }))} placeholder="AI-optimised heat pumps for industrial decarbonisation." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <label style={lbl}>stage *</label>
                  <select style={{ ...inp, appearance: "none" as const }} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                    <option value="">select</option>
                    {["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>sector *</label>
                  <input style={inp} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} placeholder="ClimateTech" />
                </div>
                <div>
                  <label style={lbl}>based in</label>
                  <input style={inp} value={form.geography} onChange={e => setForm(f => ({ ...f, geography: e.target.value }))} placeholder="Berlin, DE" />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={lbl}>traction *</label>
                <input style={inp} value={form.traction} onChange={e => setForm(f => ({ ...f, traction: e.target.value }))} placeholder="€180K ARR · 3 enterprise pilots · 94% retention" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={lbl}>round size (€)</label>
                  <input style={inp} value={form.round_size} onChange={e => setForm(f => ({ ...f, round_size: e.target.value }))} placeholder="2,000,000" />
                </div>
                <div>
                  <label style={lbl}>deck link</label>
                  <input style={inp} type="url" value={form.deck_url} onChange={e => setForm(f => ({ ...f, deck_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <Link href="/i/raspberrysyndicate"
                className={canSend ? "btn-primary" : ""}
                style={{
                  display: "block", textAlign: "center", padding: "11px", fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.06em",
                  textDecoration: "none", width: "100%", justifyContent: "center",
                  background: canSend ? "var(--amber)" : "var(--bg3)",
                  color: canSend ? "#000" : "var(--white-dimmer)",
                  border: `1px solid ${canSend ? "var(--amber)" : "var(--border)"}`,
                  cursor: canSend ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  pointerEvents: canSend ? "auto" : "none",
                }}>
                {canSend ? "$ send real intro to Alex Farcet →" : "// fill in your intro to unlock"}
              </Link>
              {canSend && (
                <div style={{ fontSize: "10px", color: "var(--white-dimmer)", textAlign: "center", marginTop: "6px" }}>
                  // takes you to the live scope · fields auto-fill on return visits
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SCORE BRIDGE — full width, below both columns */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", marginBottom: "2px" }}>
          <div style={{ borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--white-mid)" }}>
              <span style={{ color: "var(--rasp)" }}>↑</span> investor scope &nbsp;·&nbsp; <span style={{ color: "var(--amber)" }}>↑</span> your passport
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--white-dimmer)" }}>fit score</span>
            <span style={{ fontSize: "9px", color: "var(--rasp)", border: "1px solid var(--rasp-border)", padding: "2px 7px", letterSpacing: "0.08em" }}>★ AI scoring · coming soon</span>
          </div>
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "32px", alignItems: "center" }}>
            {/* Donut */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <ScoreDonut score={scoreData.total} animate={animate} />
              {!scoreData.hasData && (
                <span style={{ fontSize: "9px", color: "var(--white-dimmer)", letterSpacing: "0.08em", marginTop: "2px" }}>// fill in intro above</span>
              )}
            </div>
            {/* Bars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
              {scoreData.breakdown.map(row => (
                <ScoreBar key={row.label} label={row.label} score={row.score} max={row.max} animate={animate} />
              ))}
            </div>
          </div>
        </div>

        {/* PASSPORT STRIP */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", padding: "14px 24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "40px" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginRight: "10px" }}>// your passport</span>
            <span style={{ fontSize: "12px", color: "var(--white-mid)" }}>
              A shareable URL for your startup. Works like Docsend — without the paywall.
              <span style={{ color: "var(--white-dimmer)" }}> Auto-fills on every investor scope you visit.</span>
            </span>
          </div>
          <Link href="/f/acme" style={{ fontSize: "11px", color: "var(--amber)", textDecoration: "none", border: "1px solid var(--amber-border)", padding: "6px 12px", whiteSpace: "nowrap" }}>
            see example passport →
          </Link>
        </div>

        {/* BOTTOM CTAs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Link href="/scope" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--rasp)", padding: "22px", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "8px" }}>// investor</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px", color: "var(--white)" }}>Define your scope</div>
            <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "12px" }}>One link. Structured inbound. No back-and-forth.</div>
            <div style={{ fontSize: "11px", color: "var(--rasp)", fontWeight: 700, letterSpacing: "0.06em" }}>$ define your scope →</div>
          </Link>
          <Link href="/passport" style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", padding: "22px", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "8px" }}>// founder</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px", color: "var(--white)" }}>Build your passport</div>
            <div style={{ fontSize: "11px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "12px" }}>Fill in once. Share anywhere. Score before you send.</div>
            <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 700, letterSpacing: "0.06em" }}>$ build your passport →</div>
          </Link>
        </div>
        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "10px", color: "var(--white-dimmer)" }}>
          <span style={{ color: "var(--rasp)" }}>//</span> fit scoring is a preview · AI-powered matching coming soon ·{" "}
          <Link href="/log" style={{ color: "var(--white-dimmer)", textDecoration: "none" }}>build log</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
