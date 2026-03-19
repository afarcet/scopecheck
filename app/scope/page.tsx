"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CopyButton } from "@/components/CopyButton";

const STAGES = ["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"];
const SECTORS = ["Applied AI", "ClimateTech", "FinTech", "HealthTech", "DeepTech", "SaaS", "Consumer", "Web3", "Other"];
const GEOS = ["Europe", "UK", "US", "Israel", "Africa", "LATAM", "Asia", "Global"];
const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
];

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "url" | "number";
  options?: string[];
  required: boolean;
}

export default function ScopePage() {
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "form" | "done">("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    handle: "",
    name: "",
    firm: "",
    location: "",
    ticket_min: "",
    ticket_max: "",
    stages: [] as string[],
    sectors: [] as string[],
    geographies: [] as string[],
    wont_invest_in: "",
    how_we_work: "",
    custom_fields: [] as CustomField[],
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/scope` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStep("auth");
  };

  useEffect(() => {
    const handleSession = async (session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } } | null) => {
      if (!session?.user) return;
      const { data: existing } = await supabase.from("investors").select("*").eq("user_id", session.user.id).maybeSingle();
      setUser({ id: session.user.id, email: session.user.email!, name: session.user.user_metadata?.full_name || "" });
      if (existing) {
        setIsEdit(true);
        setForm({
          handle: existing.handle || "",
          name: existing.name || "",
          firm: existing.firm || "",
          location: existing.location || "",
          ticket_min: existing.ticket_min?.toString() || "",
          ticket_max: existing.ticket_max?.toString() || "",
          stages: existing.stages || [],
          sectors: existing.sectors || [],
          geographies: existing.geographies || [],
          wont_invest_in: existing.wont_invest_in || "",
          how_we_work: existing.how_we_work || "",
          custom_fields: (existing.custom_fields as CustomField[]) || [],
        });
      } else {
        setForm(f => ({
          ...f,
          name: session.user.user_metadata?.full_name || "",
          handle: (session.user.email?.split("@")[0] || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
        }));
      }
      setStep("form");
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session?.user ? session : null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session?.user ? session : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  // Custom fields management
  const addCustomField = () => {
    setForm(f => ({
      ...f,
      custom_fields: [
        ...f.custom_fields,
        { id: crypto.randomUUID(), label: "", type: "text", required: false },
      ],
    }));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setForm(f => ({
      ...f,
      custom_fields: f.custom_fields.map(cf =>
        cf.id === id ? { ...cf, ...updates } : cf
      ),
    }));
  };

  const removeCustomField = (id: string) => {
    setForm(f => ({
      ...f,
      custom_fields: f.custom_fields.filter(cf => cf.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    const payload = {
      user_id: user.id,
      handle: form.handle,
      name: form.name,
      email: user.email,
      firm: form.firm || null,
      location: form.location || null,
      ticket_min: form.ticket_min ? parseInt(form.ticket_min) : null,
      ticket_max: form.ticket_max ? parseInt(form.ticket_max) : null,
      stages: form.stages,
      sectors: form.sectors,
      geographies: form.geographies,
      wont_invest_in: form.wont_invest_in || null,
      how_we_work: form.how_we_work || null,
      custom_fields: form.custom_fields.length > 0 ? form.custom_fields : null,
      status: "active" as const,
    };

    if (isEdit) {
      // Update existing investor
      const { error: updateError } = await supabase
        .from("investors")
        .update(payload)
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      // Check handle availability for new investors
      const { data: existing } = await supabase
        .from("investors")
        .select("handle")
        .eq("handle", form.handle)
        .single();

      if (existing) {
        setError(`Handle "${form.handle}" is taken — try another.`);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("investors").insert(payload);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CopyButton } from "@/components/CopyButton";

const STAGES = ["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"];
const SECTORS = ["Applied AI", "ClimateTech", "FinTech", "HealthTech", "DeepTech", "SaaS", "Consumer", "Web3", "Other"];
const GEOS = ["Europe", "UK", "US", "Israel", "Africa", "LATAM", "Asia", "Global"];
const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
];

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "url" | "number";
  options?: string[];
  required: boolean;
}

export default function ScopePage() {
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "form" | "done">("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    handle: "",
    name: "",
    firm: "",
    location: "",
    ticket_min: "",
    ticket_max: "",
    stages: [] as string[],
    sectors: [] as string[],
    geographies: [] as string[],
    wont_invest_in: "",
    how_we_work: "",
    requires_lead: false,
    custom_fields: [] as CustomField[],
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/scope` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStep("auth");
  };

  useEffect(() => {
    const handleSession = async (session: { user: { id: string; email?: string; user_metadata?: Record<string, string> } } | null) => {
      if (!session?.user) return;
      const { data: existing } = await supabase.from("investors").select("*").eq("user_id", session.user.id).maybeSingle();
      setUser({ id: session.user.id, email: session.user.email!, name: session.user.user_metadata?.full_name || "" });
      if (existing) {
        setIsEdit(true);
        setForm({
          handle: existing.handle || "",
          name: existing.name || "",
          firm: existing.firm || "",
          location: existing.location || "",
          ticket_min: existing.ticket_min?.toString() || "",
          ticket_max: existing.ticket_max?.toString() || "",
          stages: existing.stages || [],
          sectors: existing.sectors || [],
          geographies: existing.geographies || [],
          wont_invest_in: existing.wont_invest_in || "",
          how_we_work: existing.how_we_work || "",
          requires_lead: existing.requires_lead || false,
          custom_fields: (existing.custom_fields as CustomField[]) || [],
        });
      } else {
        setForm(f => ({
          ...f,
          name: session.user.user_metadata?.full_name || "",
          handle: (session.user.email?.split("@")[0] || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
        }));
      }
      setStep("form");
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session?.user ? session : null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session?.user ? session : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  // Custom fields management
  const addCustomField = () => {
    setForm(f => ({
      ...f,
      custom_fields: [
        ...f.custom_fields,
        { id: crypto.randomUUID(), label: "", type: "text", required: false },
      ],
    }));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setForm(f => ({
      ...f,
      custom_fields: f.custom_fields.map(cf =>
        cf.id === id ? { ...cf, ...updates } : cf
      ),
    }));
  };

  const removeCustomField = (id: string) => {
    setForm(f => ({
      ...f,
      custom_fields: f.custom_fields.filter(cf => cf.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    const payload = {
      user_id: user.id,
      handle: form.handle,
      name: form.name,
      email: user.email,
      firm: form.firm || null,
      location: form.location || null,
      ticket_min: form.ticket_min ? parseInt(form.ticket_min) : null,
      ticket_max: form.ticket_max ? parseInt(form.ticket_max) : null,
      stages: form.stages,
      sectors: form.sectors,
      geographies: form.geographies,
      wont_invest_in: form.wont_invest_in || null,
      how_we_work: form.how_we_work || null,
      requires_lead: form.requires_lead,
      custom_fields: form.custom_fields.length > 0 ? form.custom_fields : null,
      status: "active" as const,
    };

    if (isEdit) {
      // Update existing investor
      const { error: updateError } = await supabase
        .from("investors")
        .update(payload)
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      // Check handle availability for new investors
      const { data: existing } = await supabase
        .from("investors")
        .select("handle")
        .eq("handle", form.handle)
        .single();

      if (existing) {
        setError(`Handle "${form.handle}" is taken — try another.`);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("investors").insert(payload);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    setStep("done");
    setTimeout(() => router.push(`/i/${form.handle}`), 1500);
  };

  const inputStyle = {
    background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--white)",
    fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", padding: "9px 12px",
    width: "100%", outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" as const,
    color: "var(--white-mid)", display: "block", marginBottom: "5px",
  };

  const chipStyle = (active: boolean) => ({
    fontSize: "11px", padding: "4px 10px", border: `1px solid ${active ? "var(--rasp)" : "var(--border2)"}`,
    background: active ? "var(--rasp-dim)" : "transparent", color: active ? "var(--rasp)" : "var(--white-mid)",
    cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
    transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</a>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--white-mid)", letterSpacing: "0.1em" }}>// investor scope {isEdit ? "editor" : "setup"}</span>
          {user && (
            <button onClick={handleSignOut} style={{ fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
              sign out
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {step === "auth" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>// step 1 of 2</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "10px", letterSpacing: "-0.02em" }}>
              Create your<br /><span style={{ color: "var(--rasp)" }}>investor scope.</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.8, marginBottom: "32px", maxWidth: "400px" }}>
              Define your criteria once. Share one link. Founders apply in a structured format — no more unstructured inbound.
            </p>

            <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "24px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-mid)", marginBottom: "16px" }}>// your scope will live at</div>
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderLeft: "2px solid var(--rasp)", padding: "10px 14px", fontSize: "13px", color: "var(--rasp)", marginBottom: "20px", letterSpacing: "0.02em" }}>
                scopecheck.ai/i/<span style={{ color: "var(--white-mid)" }}>yourhandle</span>
              </div>
              <button onClick={handleGoogleSignIn} disabled={loading}
                style={{ width: "100%", background: "var(--rasp)", color: "#fff", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
                {loading ? "connecting..." : "$ continue with Google →"}
              </button>
            </div>

            <p style={{ fontSize: "11px", color: "var(--white-dimmer)", textAlign: "center" }}>
              <button onClick={handleGoogleSignIn} style={{ background: "none", border: "none", color: "var(--rasp)", fontFamily: "inherit", fontSize: "inherit", cursor: "pointer", padding: 0, letterSpacing: "0.06em" }}>sign in →</button>
            </p>
            {error && <p style={{ color: "var(--rasp)", fontSize: "11px", marginTop: "10px" }}>{error}</p>}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} style={{ animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>// {isEdit ? "edit your scope" : "step 2 of 2"}</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Your criteria.<br /><span style={{ color: "var(--rasp)" }}>Your scope check.</span>
            </h1>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", marginBottom: "28px" }}>Signed in as <span style={{ color: "var(--white)" }}>{user?.email}</span></p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>your handle *</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRight: "none", padding: "9px 10px", fontSize: "11px", color: "var(--rasp)", whiteSpace: "nowrap" }}>scopecheck.ai/i/</span>
                    <input required style={{ ...inputStyle, borderLeft: "none" }} value={form.handle}
                      disabled={isEdit}
                      onChange={e => setForm(f => ({ ...f, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                      placeholder="alexvc" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>your name *</label>
                  <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Farcet" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>firm / fund</label>
                  <input className="input" value={form.firm} onChange={e => setForm(f => ({ ...f, firm: e.target.value }))} placeholder="Raspberry Ventures" />
                </div>
                <div>
                  <label style={labelStyle}>location</label>
                  <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lisbon, Portugal" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>ticket size (€K)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px", alignItems: "center" }}>
                  <input className="input" type="number" value={form.ticket_min} onChange={e => setForm(f => ({ ...f, ticket_min: e.target.value }))} placeholder="min e.g. 50" />
                  <span style={{ color: "var(--white-dim)", fontSize: "12px" }}>→</span>
                  <input className="input" type="number" value={form.ticket_max} onChange={e => setForm(f => ({ ...f, ticket_max: e.target.value }))} placeholder="max e.g. 650" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>stages *</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {STAGES.map(s => (
                    <button key={s} type="button" style={chipStyle(form.stages.includes(s))}
                      onClick={() => setForm(f => ({ ...f, stages: toggleArray(f.stages, s) }))}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>sectors *</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {SECTORS.map(s => (
                    <button key={s} type="button" style={chipStyle(form.sectors.includes(s))}
                      onClick={() => setForm(f => ({ ...f, sectors: toggleArray(f.sectors, s) }))}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>geographies *</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {GEOS.map(g => (
                    <button key={g} type="button" style={chipStyle(form.geographies.includes(g))}
                      onClick={() => setForm(f => ({ ...f, geographies: toggleArray(f.geographies, g) }))}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>won&apos;t invest in</label>
                <input className="input" value={form.wont_invest_in}
                  onChange={e => setForm(f => ({ ...f, wont_invest_in: e.target.value }))}
                  placeholder="e.g. crypto, pre-seed, gaming" />
              </div>

              <div>
                <label style={labelStyle}>how you work / what founders can expect</label>
                <textarea className="input" value={form.how_we_work}
                  onChange={e => setForm(f => ({ ...f, how_we_work: e.target.value }))}
                  placeholder="We co-invest via SPV alongside lead investors. We decide within 2 weeks."
                  rows={3} style={{ resize: "vertical" }} />
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "4px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>require lead investor</label>
                  <p style={{ fontSize: "10px", color: "var(--white-dimmer)", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                    Only show intros from founders who have a confirmed lead investor.
                  </p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button"
                      style={{
                        fontSize: "11px", padding: "6px 12px",
                        border: `1px solid ${form.requires_lead ? "var(--rasp)" : "var(--border2)"}`,
                        background: form.requires_lead ? "var(--rasp-dim)" : "transparent",
                        color: form.requires_lead ? "var(--rasp)" : "var(--white-mid)",
                        cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                        transition: "all 0.15s",
                      } as React.CSSProperties}
                      onClick={() => setForm(f => ({ ...f, requires_lead: true }))}>
                      Yes
                    </button>
                    <button type="button"
                      style={{
                        fontSize: "11px", padding: "6px 12px",
                        border: `1px solid ${!form.requires_lead ? "var(--rasp)" : "var(--border2)"}`,
                        background: !form.requires_lead ? "var(--rasp-dim)" : "transparent",
                        color: !form.requires_lead ? "var(--rasp)" : "var(--white-mid)",
                        cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                        transition: "all 0.15s",
                      } as React.CSSProperties}
                      onClick={() => setForm(f => ({ ...f, requires_lead: false }))}>
                      No
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom questions section */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: "2px" }}>custom questions</label>
                    <p style={{ fontSize: "10px", color: "var(--white-dimmer)", margin: 0 }}>
                      Ask founders specific questions beyond the standard fields.
                    </p>
                  </div>
                  {form.custom_fields.length < 5 && (
                    <button type="button" onClick={addCustomField}
                      style={{ background: "var(--bg3)", color: "var(--rasp)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
                      + add question
                    </button>
                  )}
                </div>

                {form.custom_fields.map((cf, i) => (
                  <div key={cf.id} style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "14px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-dim)" }}>
                        question {i + 1}
                      </span>
                      <button type="button" onClick={() => removeCustomField(cf.id)}
                        style={{ background: "none", border: "none", color: "var(--white-dim)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", cursor: "pointer", padding: "2px 6px" }}>
                        × remove
                      </button>
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                      <input style={inputStyle} value={cf.label}
                        onChange={e => updateCustomField(cf.id, { label: e.target.value })}
                        placeholder="e.g. What's your IP moat?" />
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <select style={{ ...inputStyle, width: "auto", minWidth: "120px" }} value={cf.type}
                        onChange={e => updateCustomField(cf.id, { type: e.target.value as CustomField["type"], options: e.target.value === "select" ? [""] : undefined })}>
                        {FIELD_TYPES.map(ft => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>

                      <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--white-mid)", cursor: "pointer" }}>
                        <input type="checkbox" checked={cf.required}
                          onChange={e => updateCustomField(cf.id, { required: e.target.checked })}
                          style={{ accentColor: "var(--rasp)" }} />
                        required
                      </label>
                    </div>

                    {cf.type === "select" && (
                      <div style={{ marginTop: "10px" }}>
                        <label style={{ ...labelStyle, fontSize: "9px" }}>dropdown options (one per line)</label>
                        <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3}
                          value={(cf.options || []).join("
")}
                          onChange={e => updateCustomField(cf.id, { options: e.target.value.split("
") })}
                          placeholder={"Option 1
Option 2
Option 3"} />
                      </div>
                    )}
                  </div>
                ))}

                {form.custom_fields.length === 0 && (
                  <div style={{ textAlign: "center", padding: "16px", color: "var(--white-dimmer)", fontSize: "11px", border: "1px dashed var(--border2)" }}>
                    // no custom questions yet — founders will answer the standard fields only
                  </div>
                )}
              </div>

              {error && (
                <div style={{ background: "rgba(212,40,106,0.08)", border: "1px solid var(--rasp-border)", padding: "10px 14px", fontSize: "12px", color: "var(--rasp)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !form.handle || !form.name || form.stages.length === 0}
                style={{ background: "var(--rasp)", color: "#fff", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", padding: "13px", cursor: "pointer", opacity: loading || !form.handle || !form.name || form.stages.length === 0 ? 0.5 : 1 }}>
                {loading ? (isEdit ? "saving..." : "creating your scope...") : isEdit ? "$ save changes →" : "$ create my investor scope →"}
              </button>

              <p style={{ fontSize: "11px", color: "var(--white-dimmer)", textAlign: "center" }}>
                {isEdit ? "Changes save instantly." : "You can edit everything after. This takes 30 seconds."}
              </p>
            </div>
          </form>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px", color: "var(--rasp)" }}>✓</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>{isEdit ? "Scope updated." : "Scope created."}</h2>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", marginBottom: "16px" }}>
              Your scope is live at:
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0", maxWidth: "400px", margin: "0 auto 16px" }}>
              <div style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--rasp)", borderRight: "none", padding: "9px 14px", fontSize: "12px", color: "var(--rasp)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                scopecheck.ai/i/{form.handle}
              </div>
              <CopyButton text={`https://scopecheck.ai/i/${form.handle}`} style={{ borderLeft: "none" }} />
            </div>
            <p style={{ fontSize: "11px", color: "var(--white-dim)" }}>Redirecting to your scope...</p>
          </div>
        )}
      </div>
    </main>
  );
}
