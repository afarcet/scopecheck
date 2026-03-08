"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const STAGES = ["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"];
const SECTORS = ["Applied AI", "ClimateTech", "FinTech", "HealthTech", "DeepTech", "SaaS", "Consumer", "Web3", "Other"];
const GEOS = ["UK", "Germany", "France", "Netherlands", "Nordics", "Southern Europe", "US", "Israel", "Africa", "Global"];

export default function PassportPage() {
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "form" | "done">("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);

  const [form, setForm] = useState({
    handle: "",
    name: "",
    company_name: "",
    one_liner: "",
    stage: "",
    sector: "",
    geography: "",
    round_size: "",
    committed: "",
    traction_summary: "",
    deck_url: "",
    data_room_url: "",
    what_we_want: "",
  });

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || "",
        });
        setForm(f => ({ ...f, name: session.user.user_metadata?.full_name || "" }));
        setStep("form");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || "",
        });
        setForm(f => ({ ...f, name: session.user.user_metadata?.full_name || "" }));
        setStep("form");
      }
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
    const committed = parseInt(form.committed) || 0;

    const { error: insertError } = await supabase.from("founders").insert({
      user_id: user.id,
      handle: form.handle,
      name: user.name || form.name,
      email: user.email,
      company_name: form.company_name,
      one_liner: form.one_liner || null,
      stage: form.stage || null,
      sector: form.sector || null,
      geography: form.geography || null,
      round_size: roundSize,
      committed: committed,
      available: roundSize ? roundSize - committed : null,
      traction_summary: form.traction_summary || null,
      deck_url: form.deck_url || null,
      data_room_url: form.data_room_url || null,
      what_we_want: form.what_we_want || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setStep("done");
    setTimeout(() => router.push(`/f/${form.handle}`), 1500);
  };

  const labelStyle = {
    fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" as const,
    color: "var(--white-mid)", display: "block", marginBottom: "5px",
  };

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
              Create your<br /><span style={{ color: "var(--amber)" }}>founder passport.</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.8, marginBottom: "32px", maxWidth: "400px" }}>
              Fill in once. Share one link. Auto-populates investor applications. Show up at events with a QR code instead of a pitch deck.
            </p>

            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "24px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-mid)", marginBottom: "16px" }}>// your passport will live at</div>
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
              Already have a passport? <a href="/f" style={{ color: "var(--amber)", textDecoration: "none" }}>sign in →</a>
            </p>
            {error && <p style={{ color: "var(--rasp)", fontSize: "11px", marginTop: "10px" }}>{error}</p>}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>// step 2 of 2</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Your company.<br /><span style={{ color: "var(--amber)" }}>Your story.</span>
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

              {/* Sector */}
              <div>
                <label style={labelStyle}>sector *</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {SECTORS.map(s => (
                    <button key={s} type="button" style={chipStyle(form.sector === s)}
                      onClick={() => setForm(f => ({ ...f, sector: s }))}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geography */}
              <div>
                <label style={labelStyle}>based in</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {GEOS.map(g => (
                    <button key={g} type="button" style={chipStyle(form.geography === g)}
                      onClick={() => setForm(f => ({ ...f, geography: g }))}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Round */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>total round size (€K)</label>
                  <input className="input" type="number" value={form.round_size}
                    onChange={e => setForm(f => ({ ...f, round_size: e.target.value }))}
                    placeholder="e.g. 2000" />
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

              {/* Links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>deck URL</label>
                  <input className="input" type="url" value={form.deck_url}
                    onChange={e => setForm(f => ({ ...f, deck_url: e.target.value }))}
                    placeholder="https://deck.link/..." />
                </div>
                <div>
                  <label style={labelStyle}>data room URL</label>
                  <input className="input" type="url" value={form.data_room_url}
                    onChange={e => setForm(f => ({ ...f, data_room_url: e.target.value }))}
                    placeholder="https://..." />
                </div>
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

              <button type="submit" disabled={loading || !form.handle || !form.company_name || !form.stage}
                style={{ background: "var(--amber)", color: "#000", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "13px", cursor: "pointer", opacity: loading || !form.handle || !form.company_name || !form.stage ? 0.5 : 1 }}>
                {loading ? "creating your passport..." : "$ create my founder passport →"}
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
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Passport created.</h2>
            <p style={{ fontSize: "12px", color: "var(--white-mid)" }}>
              Redirecting to <span style={{ color: "var(--amber)" }}>scopecheck.ai/f/{form.handle}</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
