"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Core fields every investor requires
const CORE_FIELDS = [
  { key: "founder_name", label: "Your name", type: "text", placeholder: "Harry Founder", required: true },
  { key: "founder_email", label: "Your email", type: "email", placeholder: "you@company.com", required: true },
  { key: "company_name", label: "Company name", type: "text", placeholder: "Acme Climate", required: true },
  { key: "one_liner", label: "One-liner", type: "text", placeholder: "We decarbonise industrial heating using AI-optimised heat pumps.", required: true },
  { key: "stage", label: "Current stage", type: "select", options: ["Pre-seed", "Seed", "Series A", "Series B+"], required: true },
  { key: "sector", label: "Primary sector", type: "text", placeholder: "ClimateTech - industrial decarbonisation", required: true },
  { key: "geography", label: "Based in / operating in", type: "text", placeholder: "Berlin, Germany" },
  { key: "round_size", label: "Total round size (EUR)", type: "text", placeholder: "2,000,000" },
  { key: "committed", label: "Amount already committed (EUR)", type: "text", placeholder: "800,000" },
  { key: "available", label: "Amount still available (EUR)", type: "text", placeholder: "1,200,000" },
  { key: "traction", label: "Traction summary", type: "textarea", placeholder: "EUR 180K ARR, 3 paying enterprise pilots, LOI from major utility...", required: true },
  { key: "deck_url", label: "Pitch deck link", type: "url", placeholder: "https://..." },
  { key: "data_room_url", label: "Data room (optional)", type: "url", placeholder: "https://fulldeal.ai/..." },
  { key: "lead_investor", label: "Lead investor", type: "text", placeholder: "XYZ Ventures (leading at EUR 1.5M)" },
  { key: "why_us", label: "Why are you reaching out to us specifically?", type: "textarea", placeholder: "Your focus on ClimateTech and European market aligns perfectly with..." },
];

export default function ApplyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const [investor, setInvestor] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
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

    const passportHandle = (form.company_name || "startup")
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
          {CORE_FIELDS.map((field) => (
            <div key={field.key} style={{ marginBottom: "1.2rem" }}>
              <label className="label">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  className="input"
                  placeholder={field.placeholder}
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                  required={"required" in field && field.required}
                />
              ) : field.type === "select" ? (
                <select
                  className="input"
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={"required" in field && field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="input"
                  placeholder={field.placeholder}
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={"required" in field && field.required}
                />
              )}
            </div>
          ))}

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
"use client";

import { useState, use } from "react";
import Link from "next/link";

const MOCK_INVESTOR = {
  name: "Alex Farcet",
  firm: "Raspberry Ventures",
  handle: "alex",
  sectors: ["ClimateTech", "Applied AI"],
  stages: ["Seed", "Early Series A"],
  ticket_min: 50000,
  ticket_max: 650000,
};

// Core fields every investor requires
const CORE_FIELDS = [
  { key: "founder_name", label: "Your name", type: "text", placeholder: "Harry Founder" },
  { key: "founder_email", label: "Your email", type: "email", placeholder: "you@company.com", required: true },
  { key: "company_name", label: "Company name", type: "text", placeholder: "Acme Climate" },
  { key: "one_liner", label: "One-liner", type: "text", placeholder: "We decarbonise industrial heating using AI-optimised heat pumps." },
  { key: "stage", label: "Current stage", type: "select", options: ["Pre-seed", "Seed", "Series A", "Series B+"] },
  { key: "sector", label: "Primary sector", type: "text", placeholder: "ClimateTech — industrial decarbonisation" },
  { key: "geography", label: "Based in / operating in", type: "text", placeholder: "Berlin, Germany · EU market" },
  { key: "round_size", label: "Total round size (€)", type: "text", placeholder: "2,000,000" },
  { key: "committed", label: "Amount already committed (€)", type: "text", placeholder: "800,000" },
  { key: "available", label: "Amount still available (€)", type: "text", placeholder: "1,200,000" },
  { key: "traction", label: "Traction summary", type: "textarea", placeholder: "€180K ARR, 3 paying enterprise pilots, LOI from major utility..." },
  { key: "deck_url", label: "Pitch deck link", type: "url", placeholder: "https://..." },
  { key: "data_room_url", label: "Data room (optional)", type: "url", placeholder: "https://fulldeal.ai/..." },
  { key: "lead_investor", label: "Lead investor", type: "text", placeholder: "XYZ Ventures (leading at €1.5M)" },
  { key: "why_us", label: "Why are you reaching out to us specifically?", type: "textarea", placeholder: "Your focus on ClimateTech and European market aligns perfectly with..." },
];

export default function ApplyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const investor = MOCK_INVESTOR;
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: save to Supabase applications table + notify investor
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "56px", height: "56px", border: "1px solid var(--amber)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "1.4rem", color: "var(--amber)" }}>✓</div>
          <h2 className="font-display" style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "0.8rem" }}>Application sent</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--slate-light)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            {investor.name} at {investor.firm} has been notified. You&apos;ll hear back if there&apos;s a fit.
          </p>
          <Link href={`/${handle}`} className="btn-secondary" style={{ display: "inline-flex" }}>← Back to profile</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <nav style={{ borderBottom: "1px solid var(--navy-border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={`/${handle}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--slate)", fontSize: "0.8rem" }}>←</span>
          <span className="font-display" style={{ fontSize: "1.1rem", color: "var(--cream)" }}>{investor.name}</span>
        </Link>
        <span className="font-mono-dm" style={{ fontSize: "0.7rem", color: "var(--slate)", letterSpacing: "0.1em" }}>
          scopecheck.ai/{handle}/apply
        </span>
      </nav>

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p className="font-mono-dm" style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "0.8rem" }}>
            Applying to
          </p>
          <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "0.4rem" }}>
            {investor.name} · {investor.firm}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--slate)", fontWeight: 300 }}>
            Focuses on {investor.sectors.join(", ")} · {investor.stages.join(", ")} · Ticket €{(investor.ticket_min / 1000).toFixed(0)}K–€{(investor.ticket_max / 1000).toFixed(0)}K
          </p>
        </div>

        {/* Pre-fill notice */}
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", padding: "0.9rem 1.2rem", marginBottom: "2rem", display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--amber)", fontSize: "0.8rem", marginTop: "0.1rem" }}>ℹ</span>
          <p style={{ fontSize: "0.82rem", color: "var(--amber)", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            Have a ScopeCheck passport? <Link href="/join" style={{ color: "var(--amber)", textDecoration: "underline" }}>Sign in</Link> and your core details will pre-fill automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {CORE_FIELDS.map((field) => (
            <div key={field.key} style={{ marginBottom: "1.2rem" }}>
              <label className="label">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  className="input"
                  placeholder={field.placeholder}
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              ) : field.type === "select" ? (
                <select
                  className="input"
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  <option value="">Select…</option>
                  {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="input"
                  placeholder={field.placeholder}
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={"required" in field && field.required}
                />
              )}
            </div>
          ))}

          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--navy-border)" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "Submitting…" : `Submit to ${investor.name} →`}
            </button>
            <p style={{ fontSize: "0.78rem", color: "var(--slate)", textAlign: "center", marginTop: "0.8rem", fontWeight: 300 }}>
              Your application will be sent directly to {investor.name}. No spam, no third parties.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
