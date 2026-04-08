"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CustomField = {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
};

export default function ApplyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const [investor, setInvestor] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("investors")
      .select("*")
      .eq("handle", handle)
      .single()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setInvestor(data);
      });
  }, [handle]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const passportHandle = (form.passport_handle || form.company_name || "startup")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      const res = await fetch("/api/send-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorHandle: handle,
          founderName: form.founder_name,
          founderEmail: form.founder_email,
          companyName: form.company_name,
          oneLiner: form.one_liner,
          stage: form.stage,
          sector: form.sector,
          traction: form.traction,
          deckUrl: form.deck_url || null,
          passportHandle,
          customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send intro");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--slate)", fontSize: "0.9rem" }}>Investor not found</p>
      </main>
    );
  }

  if (!investor) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--slate)", fontSize: "0.85rem" }}>Loading...</p>
      </main>
    );
  }

  const inv = investor;
  const invName = inv.name as string;
  const invFirm = inv.firm as string;
  const invSectors = (inv.sectors as string[]) || [];
  const invStages = (inv.stages as string[]) || [];
  const invTicketMin = inv.ticket_min as number;
  const invTicketMax = inv.ticket_max as number;
  const customFields = (inv.custom_fields as CustomField[]) || [];

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "56px", height: "56px", border: "1px solid var(--amber)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "1.4rem", color: "var(--amber)" }}>{"✓"}</div>
          <h2 className="font-display" style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "0.8rem" }}>Application sent</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--slate-light)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            {invName} at {invFirm} has been notified. You&apos;ll hear back if there&apos;s a fit.
          </p>
          <Link href={`/i/${handle}`} className="btn-secondary" style={{ display: "inline-flex" }}>{"←"} Back to profile</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <nav style={{ borderBottom: "1px solid var(--navy-border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={`/i/${handle}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--slate)", fontSize: "0.8rem" }}>{"←"}</span>
          <span className="font-display" style={{ fontSize: "1.1rem", color: "var(--cream)" }}>{invName}</span>
        </Link>
        <span className="font-mono-dm" style={{ fontSize: "0.7rem", color: "var(--slate)", letterSpacing: "0.1em" }}>
          scopecheck.ai/i/{handle}/apply
        </span>
      </nav>

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.8rem" }}>
            Applying to
          </p>
          <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "0.4rem" }}>
            {invName} {"·"} {invFirm}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--slate)", fontWeight: 300 }}>
            Focuses on {invSectors.join(", ")} {"·"} {invStages.join(", ")}{invTicketMin ? ` · Ticket €${(invTicketMin / 1000).toFixed(0)}K–€${(invTicketMax / 1000).toFixed(0)}K` : ""}
          </p>
        </div>

        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", padding: "0.9rem 1.2rem", marginBottom: "2rem", display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--amber)", fontSize: "0.8rem", marginTop: "0.1rem" }}>{"ℹ"}</span>
          <p style={{ fontSize: "0.82rem", color: "var(--amber)", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            Have a ScopeCheck passport? <Link href="/join" style={{ color: "var(--amber)", textDecoration: "underline" }}>Sign in</Link> and your core details will pre-fill automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Founder details */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label className="label">Your name *</label>
            <input type="text" className="input" placeholder="Harry Founder" value={form.founder_name || ""} onChange={(e) => handleChange("founder_name", e.target.value)} required />
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label className="label">Your email *</label>
            <input type="email" className="input" placeholder="you@company.com" value={form.founder_email || ""} onChange={(e) => handleChange("founder_email", e.target.value)} required />
          </div>

          {/* Company details */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label className="label">Company name *</label>
            <input type="text" className="input" placeholder="Acme Climate" value={form.company_name || ""} onChange={(e) => handleChange("company_name", e.target.value)} required />
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label className="label">One-liner *</label>
            <input type="text" className="input" placeholder="We decarbonise industrial heating using AI-optimised heat pumps." value={form.one_liner || ""} onChange={(e) => handleChange("one_liner", e.target.value)} required />
          </div>

          {/* Stage, sector, geography row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
            <div>
              <label className="label">Stage *</label>
              <select className="input" value={form.stage || ""} onChange={(e) => handleChange("stage", e.target.value)} required>
                <option value="">Select...</option>
                {["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sector *</label>
              <input type="text" className="input" placeholder="ClimateTech" value={form.sector || ""} onChange={(e) => handleChange("sector", e.target.value)} required />
            </div>
            <div>
              <label className="label">Based in</label>
              <input type="text" className="input" placeholder="Berlin, DE" value={form.geography || ""} onChange={(e) => handleChange("geography", e.target.value)} />
            </div>
          </div>

          {/* Round details row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
            <div>
              <label className="label">Round size ({"€"})</label>
              <input type="text" className="input" placeholder="2,000,000" value={form.round_size || ""} onChange={(e) => handleChange("round_size", e.target.value)} />
            </div>
            <div>
              <label className="label">Committed so far ({"€"})</label>
              <input type="text" className="input" placeholder="800,000" value={form.committed || ""} onChange={(e) => handleChange("committed", e.target.value)} />
            </div>
          </div>

          {/* Traction */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label className="label">Traction *</label>
            <textarea className="input" placeholder={"€180K ARR · 3 enterprise pilots"} value={form.traction || ""} onChange={(e) => handleChange("traction", e.target.value)} rows={3} style={{ resize: "vertical" }} required />
          </div>

          {/* Deck + passport handle row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
            <div>
              <label className="label">Deck link</label>
              <input type="url" className="input" placeholder="https://..." value={form.deck_url || ""} onChange={(e) => handleChange("deck_url", e.target.value)} />
            </div>
            <div>
              <label className="label">Passport handle</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ background: "rgba(245,158,11,0.06)", border: "1px solid var(--navy-border)", borderRight: "none", padding: "0.55rem 0.5rem", fontSize: "0.75rem", color: "var(--amber)", whiteSpace: "nowrap" }}>f/</span>
                <input type="text" className="input" style={{ borderLeft: "none" }} placeholder="yourcompany" value={form.passport_handle || ""} onChange={(e) => handleChange("passport_handle", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
              </div>
            </div>
          </div>

          {/* Optional extras: lead investor + data room */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
            <div>
              <label className="label">Lead investor</label>
              <input type="text" className="input" placeholder="XYZ Ventures" value={form.lead_investor || ""} onChange={(e) => handleChange("lead_investor", e.target.value)} />
            </div>
            <div>
              <label className="label">Data room</label>
              <input type="url" className="input" placeholder="https://..." value={form.data_room_url || ""} onChange={(e) => handleChange("data_room_url", e.target.value)} />
            </div>
          </div>

          {/* Custom questions from investor */}
          {customFields.length > 0 && (
            <div style={{ borderTop: "1px solid var(--navy-border)", paddingTop: "1.2rem", marginTop: "0.5rem", marginBottom: "1.2rem" }}>
              <p className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "1rem" }}>
                Additional questions from {invName.split(" ")[0]}
              </p>
              {customFields.map((cf) => (
                <div key={cf.id} style={{ marginBottom: "1.2rem" }}>
                  <label className="label">{cf.label}{cf.required ? " *" : ""}</label>
                  {cf.type === "textarea" ? (
                    <textarea
                      className="input"
                      rows={3}
                      style={{ resize: "vertical" }}
                      required={cf.required}
                      value={customAnswers[cf.label] || ""}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [cf.label]: e.target.value }))}
                    />
                  ) : cf.type === "select" ? (
                    <select
                      className="input"
                      required={cf.required}
                      value={customAnswers[cf.label] || ""}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [cf.label]: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {(cf.options || []).filter(Boolean).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={cf.type === "url" ? "url" : cf.type === "number" ? "number" : "text"}
                      className="input"
                      required={cf.required}
                      value={customAnswers[cf.label] || ""}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [cf.label]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(212,40,106,0.08)", border: "1px solid rgba(212,40,106,0.3)", padding: "0.8rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--rasp, #d4286a)" }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--navy-border)" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "Submitting..." : `Submit to ${invName} →`}
            </button>
            <p style={{ fontSize: "0.78rem", color: "var(--slate)", textAlign: "center", marginTop: "0.8rem", fontWeight: 300 }}>
              Your application will be sent directly to {invName}. No spam, no third parties.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

