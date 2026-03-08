"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

function UnsubscribeForm() {
  const params = useSearchParams();
  const emailParam = params.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({ intros: false, onboarding: false, digest: false, all: false });

  const handleSave = async () => {
    await supabase.from("email_preferences").upsert({
      email,
      unsubscribe_intros: prefs.all || prefs.intros,
      unsubscribe_onboarding: prefs.all || prefs.onboarding,
      unsubscribe_digest: prefs.all || prefs.digest,
      unsubscribed_all: prefs.all,
    }, { onConflict: "email" });
    setSaved(true);
  };

  const inputStyle = { background: "var(--bg3)", border: "1px solid var(--border2)", color: "var(--white)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", padding: "8px 12px", width: "100%", outline: "none", boxSizing: "border-box" as const };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px" }}>
        <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
      </nav>
      <div style={{ maxWidth: "480px", margin: "60px auto", padding: "0 24px" }}>
        <div style={{ border: "1px solid var(--border2)", background: "var(--bg2)", padding: "32px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>// email preferences</div>
          {saved ? (
            <div>
              <div style={{ fontSize: "24px", color: "var(--amber)", marginBottom: "12px" }}>✓</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Preferences saved.</h2>
              <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.7 }}>Your email preferences have been updated. You can change them at any time.</p>
              <Link href="/" style={{ display: "inline-block", marginTop: "16px", fontSize: "11px", color: "var(--rasp)", textDecoration: "none" }}>← back to scopecheck.ai</Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Email preferences</h2>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-mid)", display: "block", marginBottom: "6px" }}>email address</label>
                <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {([
                  { key: "intros", label: "Intro notifications", desc: "When a founder sends you an intro via your scope" },
                  { key: "onboarding", label: "Onboarding emails", desc: "Tips and setup guidance" },
                  { key: "digest", label: "Weekly digest", desc: "Your weekly pipeline stats" },
                  { key: "all", label: "Unsubscribe from all ScopeCheck emails", desc: "" },
                ] as const).map(({ key, label, desc }) => (
                  <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input type="checkbox" checked={prefs[key]} onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))} style={{ marginTop: "2px", accentColor: "var(--rasp)" }} />
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--white)" }}>{label}</div>
                      {desc && <div style={{ fontSize: "10px", color: "var(--white-dim)" }}>{desc}</div>}
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={handleSave} disabled={!email} className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "11px", padding: "10px" }}>
                Save preferences →
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return <Suspense><UnsubscribeForm /></Suspense>;
}
