"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CopyButton } from "@/components/CopyButton";
import { STAGES, SECTORS, COUNTRIES } from "@/lib/constants";

export default function PassportPage() {
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "form" | "done">("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    handle: "",
    name: "",
    company_name: "",
    one_liner: "",
    stage: "",
    sectors: [] as string[],
    country: "",
    round_size: "",
    min_ticket: "",
    committed: "",
    traction_summary: "",
    founder_background: "",
    deck_url: "",
    linkedin_url: "",
    data_room_url: "",
    what_we_want: "",
    has_lead: false,
    lead_details: "",
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStep("auth");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/passport` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  useEffect(() => {
    const handleSession = async (su: { id: string; email?: string; user_metadata?: Record<string, string> } | null) => {
      if (!su) return;
      const { data: existing } = await supabase.from("founders").select("*").eq("user_id", su.id).maybeSingle();
      setUser({ id: su.id, email: su.email!, name: su.user_metadata?.full_name || "" });
      if (existing) {
        setForm({
          handle: existing.handle || "",
          name: existing.name || su.user_metadata?.full_name || "",
          company_name: existing.company_name || existing.company || "",
          one_liner: existing.one_liner || "",
          stage: existing.stage || "",
          sectors: Array.isArray(existing.sectors) ? existing.sectors : [],
          country: existing.country || "",
          round_size: existing.round_size?.toString() || "",
          min_ticket: existing.min_ticket?.toString() || "",
          committed: existing.committed?.toString() || "",
          traction_summary: existing.traction_summary || "",
          founder_background: existing.founder_background || "",
          deck_url: existing.deck_url || "",
          linkedin_url: existing.linkedin_url || "",
          data_room_url: existing.data_room_url || "",
          what_we_want: existing.what_we_want || "",
          has_lead: existing.has_lead || false,
          lead_details: existing.lead_details || "",
        });
      } else {
        setForm(f => ({ ...f, name: su.user_metadata?.full_name || "" }));
      }
      setStep("form");
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleSession(session.user as { id: string; email?: string; user_metadata?: Record<string, string> });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleSession(session.user as { id: string; email?: string; user_metadata?: Record<string, string> });
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    const { data: existing } = await supabase
      .from("founders")
      .select("handle")
      .eq("handle", form.handle)
      .single();

    if (existing) {
      setError(`Handle "${form.handle}" is taken — try another.`);
      setLoading(false);
      return;
    }

    const roundSize = parseInt(form.round_size) || null;
    const minTicket = parseInt(form.min_ticket) || null;
    const committed = parseInt(form.committed) || 0;

    const payload = {
      user_id: user.id,
      handle: form.handle,
      name: user.name || form.name,
      email: user.email,
      company_name: form.company_name,
      one_liner: form.one_liner || null,
      stage: form.stage || null,
      sectors: form.sectors.length > 0 ? form.sectors : null,
      country: form.country || null,
      round_size: roundSize,
      min_ticket: minTicket,
      committed: committed,
      available: roundSize ? roundSize - committed : null,
      founder_background: form.founder_background || null,
      deck_url: form.deck_url || null,
      linkedin_url: form.linkedin_url || null,
      data_room_url: form.data_room_url || null,
      what_we_want: form.what_we_want || null,
      has_lead: form.has_lead,
      lead_details: form.lead_details || null,
    };

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("founders")
        .update(payload)
        .eq("user_id", user.id);
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { data: existing } = await supabase
        .from("founders")
        .select("handle")
        .eq("handle", form.handle)
        .single();
      if (existing) {
        setError(`Handle "${form.handle}" is taken — try another.`);
        setLoading(false);
        return;
      }
      const { error: insertError } = await supabase.from("founders").insert(payload);
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    setStep("done");
    setTimeout(() => router.push(`/f/${form.handle}`), 1500);
  };

  const labelStyle = {
    fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" as const,
    color: "var(--white-mid)", display: "block", marginBottom: "5px",
  };

  const inputStyle = {
    background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--white)",
    fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", padding: "9px 12px",
    width: "100%", outline: "none",
  } as React.CSSProperties;

  const chipStyle = (active: boolean, color = "var(--amber)") => ({
    fontSize: "11px", padding: "4px 10px",
    border: `1px solid ${active ? color : "var(--border2)"}`,
    background: active ? "rgba(240,165,0,0.12)" : "transparent",
    color: active ? color : "var(--white-mid)",
    cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
    transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</a>
        <span style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em" }}>// founder passport</span>
      </nav>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {step === "auth" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// step 1 of 2</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "10px", letterSpacing: "-0.02em" }}>
              Create your<br /><span style={{ color: "var(--amber)" }}>startup passport.</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.8, marginBottom: "32px", maxWidth: "400px" }}>
              Fill in once. Share one link. Auto-populates investor applications. Show up at events with a QR code instead of a pitch deck.
            </p>

            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "24px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-mid)", marginBottom: "16px" }}>// your startup passport will live at</div>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--amber)", padding: "10px 14px", fontSize: "13px", color: "var(--amber)", marginBottom: "20px", letterSpacing: "0.02em" }}>
                scopecheck.ai/f/<span style={{ color: "var(--white-mid)" }}>yourcompany</span>
              </div>
              <button onClick={handleGoogleSignIn} disabled={loading}
                style={{ width: "100%", background: "var(--amber)", color: "#000", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000"/></svg>
                {loading ? "connecting..." : "$ continue with Google →"}
              </button>
            </div>

            <p style={{ fontSize: "11px", color: "var(--white-dimmer)", textAlign: "center" }}>
              Already have a passport? <button onClick={handleGoogleSignIn} style={{ background: "none", border: "none", color: "var(--amber)", fontFamily: "inherit", fontSize: "inherit", cursor: "pointer", padding: 0, letterSpacing: "0.06em" }}>sign in →</button>
            </p>
            {error && <p style={{ color: "var(--rasp)", fontSize: "11px", marginTop: "10px" }}>{error}</p>}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// step 2 of 2</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Your startup.<br /><span style={{ color: "var(--amber)" }}>Your passport.</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", marginBottom: "28px" }}>Signed in as <span style={{ color: "var(--white)" }}>{user?.email}</span></p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Company + handle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>company name *</label>
                  <input required className="input" value={form.company_name}
                    onChange={e => {
                      const name = e.target.value;
                      const handle = name.toLowerCase().replace(/[^a-z0-9]/g, "");
                      setForm(f => ({ ...f, company_name: name, handle }));
                    }}
                    placeholder="Carbonade" />
                </div>
                <div>
                  <label style={labelStyle}>passport handle *</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRight: "none", padding: "9px 8px", fontSize: "10px", color: "var(--amber)", whiteSpace: "nowrap" }}>f/</span>
                    <input required className="input" style={{ borderLeft: "none" }} value={form.handle}
                      disabled={isEdit}
                      onChange={e => setForm(f => ({ ...f, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                      placeholder="carbonade" />
                  </div>
                </div>
              </div>

              {/* One liner */}
              <div>
                <label style={labelStyle}>one-liner *</label>
                <input required className="input" value={form.one_liner}
                  onChange={e => setForm(f => ({ ...f, one_liner: e.target.value }))}
                  placeholder="AI-optimised heat pumps for industrial decarbonisation." />
              </div>

              {/* Stage */}
              <div>
                <label style={labelStyle}>stage *</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {STAGES.map(s => (
                    <button key={s} type="button" style={chipStyle(form.stage === s)}
                      onClick={() => setForm(f => ({ ...f, stage: s }))}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sectors - multi-select */}
              <div>
                <label style={labelStyle}>sectors (max 3) *</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {SECTORS.map(s => (
                    <button key={s} type="button"
                      style={chipStyle(form.sectors.includes(s))}
                      onClick={() => {
                        if (form.sectors.includes(s)) {
                          setForm(f => ({ ...f, sectors: f.sectors.filter(x => x !== s) }));
                        } else if (form.sectors.length < 3) {
                          setForm(f => ({ ...f, sectors: [...f.sectors, s] }));
                        }
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <label style={labelStyle}>country *</label>
                <select className="input" style={inputStyle} value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  <option value="">Select a country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Round */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>total round size (€K)</label>
                  <input className="input" type="number" value={form.round_size}
                    onChange={e => setForm(f => ({ ...f, round_size: e.target.value }))}
                    placeholder="e.g. 2000" />
                </div>
                <div>
                  <label style={labelStyle}>min ticket (€K)</label>
                  <input className="input" type="number" value={form.min_ticket}
                    onChange={e => setForm(f => ({ ...f, min_ticket: e.target.value }))}
                    placeholder="e.g. 50" />
                </div>
                <div>
                  <label style={labelStyle}>committed so far (€K)</label>
                  <input className="input" type="number" value={form.committed}
                    onChange={e => setForm(f => ({ ...f, committed: e.target.value }))}
                    placeholder="e.g. 1200" />
                </div>
              </div>

              {/* Traction */}
              <div>
                <label style={labelStyle}>traction summary</label>
                <textarea className="input" value={form.traction_summary}
                  onChange={e => setForm(f => ({ ...f, traction_summary: e.target.value }))}
                  placeholder="€180K ARR · 3 enterprise pilots · LOI from major utility"
                  rows={2} style={{ resize: "vertical" }} />
              </div>

              {/* Founder background */}
              <div>
                <label style={labelStyle}>founder / team background</label>
                <textarea className="input" value={form.founder_background}
                  onChange={e => setForm(f => ({ ...f, founder_background: e.target.value }))}
                  placeholder="Worked at Google and McKinsey · Founded two B2B SaaS companies · PhD in Materials Science"
                  rows={2} style={{ resize: "vertical" }} />
              </div>

              {/* Links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>deck URL</label>
                  <input className="input" type="url" value={form.deck_url}
                    onChange={e => setForm(f => ({ ...f, deck_url: e.target.value }))}
                    placeholder="https://deck.link/..." />
                </div>
                <div>
                  <label style={labelStyle}>linkedin URL</label>
                  <input className="input" type="url" value={form.linkedin_url}
                    onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..." />
                </div>
              </div>

              {/* Data room */}
              <div>
                <label style={labelStyle}>data room URL</label>
                <input className="input" type="url" value={form.data_room_url}
                  onChange={e => setForm(f => ({ ...f, data_room_url: e.target.value }))}
                  placeholder="https://..." />
              </div>

              {/* Lead investor section */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "4px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>lead investor confirmed?</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button"
                      style={chipStyle(form.has_lead)}
                      onClick={() => setForm(f => ({ ...f, has_lead: true }))}>
                      Yes
                    </button>
                    <button type="button"
                      style={chipStyle(!form.has_lead)}
                      onClick={() => setForm(f => ({ ...f, has_lead: false, lead_details: "" }))}>
                      No
                    </button>
                  </div>
                </div>
                {form.has_lead && (
                  <div>
                    <label style={labelStyle}>lead details</label>
                    <input className="input" value={form.lead_details}
                      onChange={e => setForm(f => ({ ...f, lead_details: e.target.value }))}
                      placeholder="e.g. Acme VC leading €1M, decision by March 15" />
                  </div>
                )}
              </div>

              {/* What we want */}
              <div>
                <label style={labelStyle}>what we&apos;re looking for in an investor</label>
                <textarea className="input" value={form.what_we_want}
                  onChange={e => setForm(f => ({ ...f, what_we_want: e.target.value }))}
                  placeholder="Deep B2B SaaS experience, EU network, fast decisions."
                  rows={2} style={{ resize: "vertical" }} />
              </div>

              {error && (
                <div style={{ background: "rgba(212,40,106,0.08)", border: "1px solid var(--rasp-border)", padding: "10px 14px", fontSize: "12px", color: "var(--rasp)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !form.handle || !form.company_name || !form.stage || form.sectors.length === 0 || !form.country}
                style={{ background: "var(--amber)", color: "#000", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "13px", cursor: "pointer", opacity: loading || !form.handle || !form.company_name || !form.stage || form.sectors.length === 0 || !form.country ? 0.5 : 1 }}>
                {loading ? (isEdit ? "saving..." : "creating your startup passport...") : isEdit ? "$ save changes →" : "$ create my startup passport →"}
              </button>

              <p style={{ fontSize: "11px", color: "var(--white-dimmer)", textAlign: "center" }}>
                You can update this anytime as your round progresses.
              </p>
            </div>
          </form>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px", color: "var(--amber)" }}>✓</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>{isEdit ? "Passport updated." : "Startup passport created."}</h2>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", marginBottom: "16px" }}>
              Your passport is live at:
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0", maxWidth: "400px", margin: "0 auto 16px" }}>
              <div style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--amber)", borderRight: "none", padding: "9px 14px", fontSize: "12px", color: "var(--amber)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                scopecheck.ai/f/{form.handle}
              </div>
              <CopyButton text={`https://scopecheck.ai/f/${form.handle}`} style={{ borderLeft: "none" }} />
            </div>
            <p style={{ fontSize: "11px", color: "var(--white-dim)" }}>Redirecting to your passport...</p>
          </div>
        )}
      </div>
    </main>
  );
}
