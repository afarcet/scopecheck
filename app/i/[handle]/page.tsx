"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { QRButton } from "./qr-button";
import { CopyRow } from "@/components/CopyButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BLANK_INTRO = {
  founder_name: "",
  company_name: "",
  one_liner: "",
  stage: "",
  sector: "",
  geography: "",
  round_size: "",
  committed: "",
  traction: "",
  deck_url: "",
  passport_handle: "",
  custom_answers: {} as Record<string, string>,
};

export default function InvestorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const [handle, setHandle] = useState<string>("");
  const [investor, setInvestor] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Intro flow state
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState<"auth" | "form" | "done">("auth");
  const [introLoading, setIntroLoading] = useState(false);
  const [introError, setIntroError] = useState("");
  const [session, setSession] = useState<{ id: string; email: string } | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [form, setForm] = useState(BLANK_INTRO);
  const [passportUrl, setPassportUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // FIX 2: role-aware nav
  const [userRole, setUserRole] = useState<"investor" | "founder" | "both" | null>(null);

  useEffect(() => {
    params.then(({ handle: h }) => {
      setHandle(h);
      supabase.from("investors").select("*").eq("handle", h).single().then(({ data }) => {
        if (!data) setNotFound(true);
        else {
          setInvestor(data);
          if (data.email) setOwnerEmail(data.email as string);
        }
      });
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        setSession({ id: s.user.id, email: s.user.email! });
        loadUserContext(s.user.id, s.user.email!);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        setSession({ id: s.user.id, email: s.user.email! });
        setIntroStep("form");
        loadUserContext(s.user.id, s.user.email!);
      }
    });

    return () => subscription.unsubscribe();
  }, [params]);

  // FIX 2 + FIX 3: determine role for nav AND pre-fill form from existing passport
  const loadUserContext = async (userId: string, email: string) => {
    const [{ data: invById }, { data: founderById }] = await Promise.all([
      supabase.from("investors").select("handle").eq("user_id", userId).maybeSingle(),
      supabase.from("founders").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    const invData     = invById     ?? (await supabase.from("investors").select("handle").eq("email", email).maybeSingle()).data;
    const founderData = founderById ?? (await supabase.from("founders").select("*").eq("email", email).maybeSingle()).data;

    const role = invData && founderData ? "both" : invData ? "investor" : founderData ? "founder" : null;
    setUserRole(role);

    // FIX 3: pre-fill form if founder record exists
    if (founderData) {
      setForm({
        founder_name:    founderData.name          ?? "",
        company_name:    founderData.company_name  ?? "",
        one_liner:       founderData.one_liner      ?? "",
        stage:           founderData.stage          ?? "",
        sector:          founderData.sector         ?? "",
        geography:       founderData.geography      ?? "",
        round_size:      founderData.round_size     ? String(founderData.round_size) : "",
        committed:       founderData.committed      ? String(founderData.committed)  : "",
        traction:        founderData.traction_summary ?? "",
        deck_url:        founderData.deck_url       ?? "",
        passport_handle: founderData.handle         ?? "",
        custom_answers:  (founderData.custom_answers as Record<string, string>) ?? {},
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIntroLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.href}?intro=1` },
    });
    if (error) setIntroError(error.message);
    setIntroLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("intro") === "1" && session) {
        setShowIntro(true);
        setIntroStep("form");
      }
    }
  }, [session]);

  const handleSendIntro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIntroLoading(true);
    setIntroError("");

    const passportHandle = form.passport_handle ||
      (session.email.split("@")[0]).toLowerCase().replace(/[^a-z0-9-]/g, "");

    // FIX 1: upsert with onConflict user_id — requires unique constraint (migration_v14.sql)
    const { error: founderErr } = await supabase.from("founders").upsert({
      user_id:          session.id,
      handle:           passportHandle,
      name:             form.founder_name,
      email:            session.email,
      company_name:     form.company_name,
      one_liner:        form.one_liner,
      stage:            form.stage,
      sector:           form.sector,
      geography:        form.geography,
      round_size:       form.round_size ? parseInt(form.round_size.replace(/[^0-9]/g, "")) : null,
      committed:        form.committed  ? parseInt(form.committed.replace(/[^0-9]/g, ""))  : null,
      traction_summary: form.traction,
      deck_url:         form.deck_url || null,
    }, { onConflict: "user_id" });

    if (founderErr) {
      setIntroError(founderErr.message);
      setIntroLoading(false);
      return;
    }

    const finalPassportUrl = `https://scopecheck.ai/f/${passportHandle}`;
    setPassportUrl(finalPassportUrl);

    fetch("/api/send-intro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        investorHandle: handle,
        founderName:    form.founder_name,
        companyName:    form.company_name,
        oneLiner:       form.one_liner,
        stage:          form.stage,
        sector:         form.sector,
        traction:       form.traction,
        deckUrl:        form.deck_url || null,
        passportHandle,
        founderEmail:   session?.email,
        customAnswers:  Object.keys(form.custom_answers).length > 0 ? form.custom_answers : null,
      }),
    }).catch(console.error);

    setIntroStep("done");
    setIntroLoading(false);
  };

  const copyPassport = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (notFound) return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--white-mid)", fontSize: "12px" }}>// investor not found</p>
    </main>
  );

  if (!investor) return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--white-dim)", fontSize: "11px", letterSpacing: "0.06em" }}>// loading scope...</p>
    </main>
  );

  const inv = investor as Record<string, unknown>;
  const profileUrl = `https://scopecheck.ai/i/${handle}`;

  const inputStyle = {
    background: "var(--bg3)",
    border: "1px solid var(--border2)",
    color: "var(--white)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "var(--white-mid)",
    display: "block",
    marginBottom: "5px",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
        {/* FIX 2: role-aware nav links */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {(userRole === "investor" || userRole === "both") && (
            <Link href="/dashboard" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none" }}>// pipeline</Link>
          )}
          {(userRole === "founder" || userRole === "both") && (
            <Link href="/founder-dashboard" style={{ fontSize: "10px", color: "var(--amber)", letterSpacing: "0.1em", textDecoration: "none" }}>// passport</Link>
          )}
          <Link href="/log" style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em", textDecoration: "none" }}>// build log</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Investor scope card */}
        <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)", marginBottom: showIntro ? "0" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
            <span style={{ fontSize: "11px", color: "var(--rasp)" }}>scopecheck.ai/i/{handle}</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px", border: "1px solid var(--rasp-border)", color: "var(--rasp)", background: "var(--rasp-dim)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ animation: "blink 2s ease infinite", display: "inline-block" }}>●</span>
              {inv.status === "active" ? "open to inbound" : "paused"}
            </span>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
              <div>
                <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>{inv.name as string}</h1>
                <p style={{ fontSize: "11px", color: "var(--white-mid)" }}>
                  {[inv.firm, inv.location].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {(inv.stages as string[])?.map((s: string) => (
                  <span key={s} style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px", border: "1px solid var(--border2)", color: "var(--white-mid)" }}>
                    {s.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ border: "1px solid var(--border2)", marginBottom: "16px" }}>
              {!!inv.ticket_min && (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>ticket_size</div>
                  <div style={{ padding: "9px 14px", fontSize: "12px" }}><span style={{ color: "var(--rasp)" }}>€{inv.ticket_min as number}K → €{inv.ticket_max as number}K</span></div>
                </div>
              )}
              {((inv.sectors as string[])?.length ?? 0) > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>sectors</div>
                  <div style={{ padding: "9px 14px", fontSize: "12px" }}>
                    {(inv.sectors as string[]).map((s: string, i: number) => (
                      <span key={s}><span style={{ color: "var(--rasp)" }}>{s}</span>{i < (inv.sectors as string[]).length - 1 ? " · " : ""}</span>
                    ))}
                  </div>
                </div>
              )}
              {((inv.geographies as string[])?.length ?? 0) > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>geography</div>
                  <div style={{ padding: "9px 14px", fontSize: "12px", color: "var(--white)" }}>{(inv.geographies as string[]).join(" · ")}</div>
                </div>
              )}
              {!!inv.wont_invest_in && (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>wont_invest</div>
                  <div style={{ padding: "9px 14px", fontSize: "12px", color: "var(--white-mid)" }}>{inv.wont_invest_in as string}</div>
                </div>
              )}
              {!!inv.how_we_work && (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr" }}>
                  <div style={{ padding: "9px 14px", background: "var(--bg3)", fontSize: "10px", color: "var(--white-mid)", borderRight: "1px solid var(--border)", letterSpacing: "0.06em" }}>how_we_work</div>
                  <div style={{ padding: "9px 14px", fontSize: "12px", color: "var(--white-mid)", fontStyle: "italic" }}>{inv.how_we_work as string}</div>
                </div>
              )}
            </div>
            {/* Owner bar vs visitor bar */}
            {session && ((inv as { user_id?: string }).user_id === session.id || (ownerEmail && ownerEmail === session.email)) ? (
              <div className="example-actions" style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <CopyRow url={profileUrl} color="var(--rasp)" />
                <div style={{ display: "flex", gap: "6px", marginTop: "0" }}>
                  <Link href="/dashboard" style={{ background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "9px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
                    pipeline ↗
                  </Link>
                  <Link href="/scope" style={{ background: "var(--rasp)", color: "#fff", border: "1px solid var(--rasp)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "9px 16px", textDecoration: "none", whiteSpace: "nowrap" }}>
                    edit scope →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="example-actions" style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => { setShowIntro(true); if (session) setIntroStep("form"); else setIntroStep("auth"); }}
                  className="example-actions"
                  style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "var(--rasp)", color: "#fff", border: "1px solid var(--rasp)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "9px 16px", cursor: "pointer" }}>
                  {session ? "$ send intro (pre-filled) →" : "$ send intro →"}
                </button>
                <QRButton url={profileUrl} />
                <Link href={`/i/${handle}/for-llm`} style={{ background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "9px 12px", textDecoration: "none" }}>
                  /for-llm
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Inline intro form */}
        {showIntro && (
          <div style={{ border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", background: "var(--bg2)", marginTop: "1px", padding: "24px", animation: "fadeUp 0.25s ease both" }}>
            {introStep === "auth" && (
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// send your intro</div>
                <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "20px" }}>
                  Sign in once — your details save as a passport you can reuse with every investor.
                </p>
                <button onClick={handleGoogleSignIn} disabled={introLoading} style={{ width: "100%", background: "var(--amber)", color: "#000", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000"/></svg>
                  {introLoading ? "connecting..." : "$ continue with Google →"}
                </button>
                {introError && <p style={{ color: "var(--rasp)", fontSize: "11px", marginTop: "10px" }}>{introError}</p>}
                <button onClick={() => setShowIntro(false)} style={{ marginTop: "12px", background: "none", border: "none", color: "var(--white-dim)", fontSize: "10px", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>cancel</button>
              </div>
            )}
            {introStep === "form" && (
              <form onSubmit={handleSendIntro}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "4px" }}>// your intro to {inv.name as string}{inv.firm ? ` at ${inv.firm as string}` : ""}</div>
                    <p style={{ fontSize: "11px", color: "var(--white-dim)" }}>Signed in as {session?.email}</p>
                  </div>
                  <button type="button" onClick={() => setShowIntro(false)} style={{ background: "none", border: "none", color: "var(--white-dim)", fontSize: "10px", cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>cancel</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>your name *</label>
                    <input required style={inputStyle} value={form.founder_name} onChange={e => setForm(f => ({ ...f, founder_name: e.target.value }))} placeholder="Harry Founder" />
                  </div>
                  <div>
                    <label style={labelStyle}>company *</label>
                    <input required style={inputStyle} value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Carbonade" />
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>one-liner *</label>
                  <input required style={inputStyle} value={form.one_liner} onChange={e => setForm(f => ({ ...f, one_liner: e.target.value }))} placeholder="AI-optimised heat pumps for industrial decarbonisation." />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>stage *</label>
                    <select required style={{ ...inputStyle, appearance: "none" as const }} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                      <option value="">select</option>
                      {["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>sector *</label>
                    <input required style={inputStyle} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} placeholder="ClimateTech" />
                  </div>
                  <div>
                    <label style={labelStyle}>based in</label>
                    <input style={inputStyle} value={form.geography} onChange={e => setForm(f => ({ ...f, geography: e.target.value }))} placeholder="Berlin, DE" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>round size (€)</label>
                    <input style={inputStyle} value={form.round_size} onChange={e => setForm(f => ({ ...f, round_size: e.target.value }))} placeholder="2,000,000" />
                  </div>
                  <div>
                    <label style={labelStyle}>committed so far (€)</label>
                    <input style={inputStyle} value={form.committed} onChange={e => setForm(f => ({ ...f, committed: e.target.value }))} placeholder="800,000" />
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>traction *</label>
                  <input required style={inputStyle} value={form.traction} onChange={e => setForm(f => ({ ...f, traction: e.target.value }))} placeholder="€180K ARR · 3 enterprise pilots" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={labelStyle}>deck link</label>
                    <input style={inputStyle} type="url" value={form.deck_url} onChange={e => setForm(f => ({ ...f, deck_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={labelStyle}>passport handle</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRight: "none", padding: "8px 8px", fontSize: "10px", color: "var(--amber)", whiteSpace: "nowrap" }}>f/</span>
                      <input style={{ ...inputStyle, borderLeft: "none" }} value={form.passport_handle} onChange={e => setForm(f => ({ ...f, passport_handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} placeholder="yourcompany" />
                    </div>
                  </div>
                </div>

                {/* Custom questions from investor */}
                {((inv.custom_fields as { id: string; label: string; type: string; options?: string[]; required: boolean }[]) || []).length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>
                      {"// additional questions from "}{(inv.name as string)?.split(" ")[0]}
                    </div>
                    {((inv.custom_fields as { id: string; label: string; type: string; options?: string[]; required: boolean }[]) || []).map((cf) => (
                      <div key={cf.id} style={{ marginBottom: "12px" }}>
                        <label style={labelStyle}>{cf.label}{cf.required ? " *" : ""}</label>
                        {cf.type === "textarea" ? (
                          <textarea required={cf.required} style={{ ...inputStyle, resize: "vertical" }} rows={3}
                            value={form.custom_answers[cf.label] || ""}
                            onChange={e => setForm(f => ({ ...f, custom_answers: { ...f.custom_answers, [cf.label]: e.target.value } }))} />
                        ) : cf.type === "select" ? (
                          <select required={cf.required} style={{ ...inputStyle, appearance: "none" as const }}
                            value={form.custom_answers[cf.label] || ""}
                            onChange={e => setForm(f => ({ ...f, custom_answers: { ...f.custom_answers, [cf.label]: e.target.value } }))}>
                            <option value="">select</option>
                            {(cf.options || []).filter(Boolean).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input required={cf.required} type={cf.type === "url" ? "url" : cf.type === "number" ? "number" : "text"}
                            style={inputStyle} value={form.custom_answers[cf.label] || ""}
                            onChange={e => setForm(f => ({ ...f, custom_answers: { ...f.custom_answers, [cf.label]: e.target.value } }))} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {introError && (
                  <div style={{ background: "rgba(212,40,106,0.08)", border: "1px solid var(--rasp-border)", padding: "10px 14px", fontSize: "12px", color: "var(--rasp)", marginBottom: "12px" }}>{introError}</div>
                )}
                <button
                  type="submit"
                  disabled={introLoading || !form.founder_name || !form.company_name || !form.one_liner || !form.stage || !form.traction}
                  style={{ width: "100%", background: "var(--amber)", color: "#000", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "12px", cursor: "pointer", opacity: introLoading ? 0.6 : 1 }}>
                  {introLoading ? "sending..." : `$ send intro to ${inv.name as string} →`}
                </button>
              </form>
            )}
            {introStep === "done" && (
              <div style={{ animation: "fadeUp 0.25s ease both" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// intro sent ✓</div>
                <p style={{ fontSize: "13px", color: "var(--white)", marginBottom: "6px" }}>
                  {inv.name as string} has been notified.
                </p>
                <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7, marginBottom: "20px" }}>
                  Your startup passport was created. Copy the link to share with other investors.
                </p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--amber)", padding: "10px 14px", fontSize: "12px", color: "var(--amber)", letterSpacing: "0.02em", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {passportUrl}
                  </div>
                  <button onClick={copyPassport} style={{ background: copied ? "var(--amber)" : "var(--bg3)", color: copied ? "#000" : "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                    {copied ? "✓ copied" : "copy link"}
                  </button>
                </div>
                <Link href={passportUrl} style={{ display: "block", marginTop: "10px", fontSize: "11px", color: "var(--white-dim)", textDecoration: "none", letterSpacing: "0.06em" }}>
                  view your passport →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
