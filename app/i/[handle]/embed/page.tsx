"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EmbedScopePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const [handle, setHandle] = useState("");
  const [investor, setInvestor] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Intro form state
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [savingPassport, setSavingPassport] = useState(false);
  const [passportSaved, setPassportSaved] = useState(false);
  const [passportUrl, setPassportUrl] = useState("");
  const [form, setForm] = useState({
    founder_name: "",
    founder_email: "",
    company_name: "",
    one_liner: "",
    stage: "",
    sector: "",
    traction: "",
    deck_url: "",
  });

  useEffect(() => {
    params.then(({ handle: h }) => {
      setHandle(h);
      supabase
        .from("investors")
        .select("*")
        .eq("handle", h)
        .single()
        .then(({ data }) => {
          if (!data) setNotFound(true);
          else setInvestor(data);
        });
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/send-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorHandle: handle,
          founderName: form.founder_name,
          founderEmail: form.founder_email || undefined,
          companyName: form.company_name,
          oneLiner: form.one_liner,
          stage: form.stage || undefined,
          sector: form.sector || undefined,
          traction: form.traction || undefined,
          deckUrl: form.deck_url || undefined,
          passportHandle: form.company_name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleSavePassport = async () => {
    if (!form.founder_email) return;
    setSavingPassport(true);
    try {
      const res = await fetch("/api/save-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderName: form.founder_name,
          founderEmail: form.founder_email,
          companyName: form.company_name,
          oneLiner: form.one_liner,
          stage: form.stage || undefined,
          sector: form.sector || undefined,
          traction: form.traction || undefined,
          deckUrl: form.deck_url || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPassportSaved(true);
      setPassportUrl(data.passportUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingPassport(false);
    }
  };

  // ── Design tokens (dark only — dark embed looks best on light host sites) ──
  const c = {
    bg: "#0d0d0d",
    bg2: "#111111",
    bg3: "#181818",
    border: "#222222",
    border2: "#2a2a2a",
    white: "#ffffff",
    mid: "rgba(255,255,255,0.55)",
    dim: "rgba(255,255,255,0.3)",
    dimmer: "rgba(255,255,255,0.18)",
    rasp: "#d4286a",
    raspDim: "rgba(212,40,106,0.12)",
    amber: "#f0a500",
    amberDim: "rgba(240,165,0,0.12)",
    green: "#34d399",
  };

  const mono = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

  if (notFound) {
    return (
      <div style={{ fontFamily: mono, background: c.bg, color: c.mid, padding: "24px", fontSize: "12px", textAlign: "center" }}>
        scope not found
      </div>
    );
  }

  if (!investor) {
    return (
      <div style={{ fontFamily: mono, background: c.bg, color: c.dim, padding: "24px", fontSize: "11px", textAlign: "center" }}>
        loading scope...
      </div>
    );
  }

  const name = investor.name as string;
  const firm = investor.firm as string;
  const status = investor.status as string;
  const ticketMin = investor.ticket_min as number | null;
  const ticketMax = investor.ticket_max as number | null;
  const stages = (investor.stages as string[]) || [];
  const sectors = (investor.sectors as string[]) || [];
  const geographies = (investor.geographies as string[]) || [];
  const wontInvest = investor.wont_invest_in as string;
  const howWeWork = investor.how_we_work as string;

  const ticket =
    ticketMin && ticketMax
      ? `\u20AC${ticketMin}K \u2192 \u20AC${ticketMax}K`
      : ticketMin
        ? `from \u20AC${ticketMin}K`
        : ticketMax
          ? `up to \u20AC${ticketMax}K`
          : null;

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    borderBottom: `1px solid ${c.border}`,
  } as React.CSSProperties;

  const labelCell = {
    padding: "7px 12px",
    color: c.dim,
    fontFamily: mono,
    fontSize: "11px",
    letterSpacing: "0.04em",
  } as React.CSSProperties;

  const valueCell = {
    padding: "7px 12px",
    color: c.white,
    fontFamily: mono,
    fontSize: "12px",
  } as React.CSSProperties;

  const inputStyle = {
    background: c.bg3,
    border: `1px solid ${c.border2}`,
    color: c.white,
    fontFamily: mono,
    fontSize: "11px",
    padding: "7px 10px",
    width: "100%",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: "9px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: c.dim,
    display: "block",
    marginBottom: "3px",
  };

  return (
    <div style={{ fontFamily: mono, background: c.bg, color: c.white, minHeight: "fit-content" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ border: `1px solid ${c.border}`, background: c.bg2 }}>

        {/* Header bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 14px", borderBottom: `1px solid ${c.border}`, background: c.bg }}>
          <a href={`https://scopecheck.ai/i/${handle}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "10px", color: c.rasp, letterSpacing: "0.04em", textDecoration: "none" }}>
            scopecheck.ai/i/{handle}
          </a>
          {status === "active" && (
            <span style={{ fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", color: c.green, display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: c.green, display: "inline-block" }} />
              open to inbound
            </span>
          )}
        </div>

        {/* Identity + stages */}
        <div style={{ padding: "14px 14px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>{name}</div>
              {firm && <div style={{ fontSize: "12px", color: c.mid, marginTop: "1px" }}>{firm}</div>}
            </div>
            {stages.length > 0 && (
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {stages.map((s) => (
                  <span key={s} style={{ fontSize: "9px", padding: "2px 7px", border: `1px solid ${c.border2}`, color: c.mid, letterSpacing: "0.04em", textTransform: "lowercase" }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scope data */}
        <div>
          {ticket && (
            <div style={rowStyle}>
              <div style={labelCell}>ticket_size</div>
              <div style={{ ...valueCell, color: c.rasp }}>{ticket}</div>
            </div>
          )}
          {sectors.length > 0 && (
            <div style={rowStyle}>
              <div style={labelCell}>sectors</div>
              <div style={{ ...valueCell, color: c.rasp }}>{sectors.join(" \u00B7 ")}</div>
            </div>
          )}
          {geographies.length > 0 && (
            <div style={rowStyle}>
              <div style={labelCell}>geography</div>
              <div style={valueCell}>{geographies.join(" \u00B7 ")}</div>
            </div>
          )}
          {wontInvest && (
            <div style={rowStyle}>
              <div style={labelCell}>won&apos;t_invest</div>
              <div style={{ ...valueCell, color: c.mid }}>{wontInvest}</div>
            </div>
          )}
          {howWeWork && (
            <div style={{ ...rowStyle, borderBottom: "none" }}>
              <div style={labelCell}>how_we_work</div>
              <div style={{ ...valueCell, color: c.mid, fontStyle: "italic", fontSize: "11px", lineHeight: "1.6" }}>{howWeWork}</div>
            </div>
          )}
        </div>

        {/* ── CTA / Form area ── */}
        {!showForm && !sent && (
          <div style={{ padding: "10px 14px 12px", borderTop: `1px solid ${c.border}` }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: c.rasp, color: "#fff", border: "none", fontFamily: mono,
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                padding: "9px 16px", cursor: "pointer",
              }}
            >
              $ send intro &rarr;
            </button>
            <span style={{ fontSize: "9px", color: c.dimmer, marginLeft: "10px", letterSpacing: "0.06em" }}>
              powered by{" "}
              <a href="https://scopecheck.ai" target="_blank" rel="noopener noreferrer" style={{ color: c.rasp, textDecoration: "none" }}>
                scopecheck.ai
              </a>
            </span>
          </div>
        )}

        {/* ── Inline intro form ── */}
        {showForm && !sent && (
          <form onSubmit={handleSubmit} style={{ borderTop: `1px solid ${c.border}`, padding: "14px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: c.amber, marginBottom: "10px" }}>
              // send your intro to {name.split(" ")[0]}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
              <div>
                <label style={labelStyle}>your name *</label>
                <input required style={inputStyle} value={form.founder_name}
                  onChange={e => setForm(f => ({ ...f, founder_name: e.target.value }))}
                  placeholder="Jane Smith" />
              </div>
              <div>
                <label style={labelStyle}>email</label>
                <input type="email" style={inputStyle} value={form.founder_email}
                  onChange={e => setForm(f => ({ ...f, founder_email: e.target.value }))}
                  placeholder="jane@startup.com" />
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>company *</label>
              <input required style={inputStyle} value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Acme Climate" />
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>one-liner *</label>
              <input required style={inputStyle} value={form.one_liner}
                onChange={e => setForm(f => ({ ...f, one_liner: e.target.value }))}
                placeholder="AI-powered carbon accounting for supply chains" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
              <div>
                <label style={labelStyle}>stage</label>
                <select style={{ ...inputStyle, appearance: "none" as const }} value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                  <option value="">select</option>
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Early-A">Early-A</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B+">Series B+</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>sector</label>
                <input style={inputStyle} value={form.sector}
                  onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                  placeholder="ClimateTech" />
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>traction *</label>
              <input required style={inputStyle} value={form.traction}
                onChange={e => setForm(f => ({ ...f, traction: e.target.value }))}
                placeholder="\u20AC180K ARR \u00B7 3 enterprise pilots" />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>deck link</label>
              <input type="url" style={inputStyle} value={form.deck_url}
                onChange={e => setForm(f => ({ ...f, deck_url: e.target.value }))}
                placeholder="https://..." />
            </div>

            {error && (
              <div style={{ background: "rgba(212,40,106,0.08)", border: `1px solid ${c.rasp}`, padding: "6px 10px", fontSize: "11px", color: c.rasp, marginBottom: "8px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button type="submit"
                disabled={sending || !form.founder_name || !form.company_name || !form.one_liner || !form.traction}
                style={{
                  background: c.amber, color: "#000", border: "none", fontFamily: mono,
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                  padding: "9px 16px", cursor: "pointer",
                  opacity: sending || !form.founder_name || !form.company_name || !form.one_liner || !form.traction ? 0.5 : 1,
                }}
              >
                {sending ? "sending..." : `$ send to ${name.split(" ")[0]} \u2192`}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", color: c.dim, fontFamily: mono, fontSize: "10px", cursor: "pointer", letterSpacing: "0.06em" }}>
                cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Success state ── */}
        {sent && (
          <div style={{ borderTop: `1px solid ${c.border}`, padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: c.green, marginBottom: "8px" }}>
              // intro sent ✓
            </div>
            <p style={{ fontSize: "12px", color: c.white, marginBottom: "4px" }}>
              {name} has been notified.
            </p>

            {!passportSaved ? (
              <div style={{ marginTop: "10px", marginBottom: "8px" }}>
                <p style={{ fontSize: "10px", color: c.dim, lineHeight: 1.6, marginBottom: "8px" }}>
                  Save your details as a reusable startup passport — share it with any investor, anywhere.
                </p>
                {error && (
                  <div style={{ background: "rgba(212,40,106,0.08)", border: `1px solid ${c.rasp}`, padding: "6px 10px", fontSize: "11px", color: c.rasp, marginBottom: "8px", textAlign: "left" }}>
                    {error}
                  </div>
                )}
                {form.founder_email ? (
                  <button
                    onClick={handleSavePassport}
                    disabled={savingPassport}
                    style={{
                      background: c.amber, color: "#000", border: "none", fontFamily: mono,
                      fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                      padding: "9px 16px", cursor: "pointer",
                      opacity: savingPassport ? 0.5 : 1,
                    }}
                  >
                    {savingPassport ? "saving..." : "$ save my passport →"}
                  </button>
                ) : (
                  <a href="https://scopecheck.ai/passport" target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-block", background: c.amber, color: "#000", fontFamily: mono,
                      fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                      padding: "9px 16px", textDecoration: "none",
                    }}>
                    $ create passport &rarr;
                  </a>
                )}
              </div>
            ) : (
              <div style={{ marginTop: "10px", marginBottom: "8px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: c.amber, marginBottom: "6px" }}>
                  // passport saved ✓
                </div>
                <p style={{ fontSize: "11px", color: c.white, lineHeight: 1.6, marginBottom: "4px" }}>
                  Check your email — we sent you the link.
                </p>
                <a href={passportUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: c.amber, textDecoration: "none" }}>
                  {passportUrl}
                </a>
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              <span style={{ fontSize: "9px", color: c.dimmer, letterSpacing: "0.06em" }}>
                powered by{" "}
                <a href="https://scopecheck.ai" target="_blank" rel="noopener noreferrer" style={{ color: c.rasp, textDecoration: "none" }}>
                  scopecheck.ai
                </a>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
