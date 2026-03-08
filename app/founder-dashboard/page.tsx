"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CopyButton } from "@/components/CopyButton";

interface FounderData {
  id: string;
  handle: string;
  company_name: string;
  one_liner: string;
  stage: string;
  sector: string;
  round_size: number;
  committed: number;
  traction_summary: string;
  view_count: number;
}

interface Application {
  id: string;
  created_at: string;
  investor_handle: string;
  investor_name: string;
  status: string;
}

export default function FounderDashboard() {
  const router = useRouter();
  const [founder, setFounder] = useState<FounderData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push("/passport"); return; }
      setUserEmail(session.user.email!);

      const { data: f } = await supabase
        .from("founders")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!f) { router.push("/passport"); return; }
      setFounder(f);

      // Fetch applications this founder has sent
      const { data: apps } = await supabase
        .from("applications")
        .select("id, created_at, status, investors(handle, name)")
        .eq("founder_id", f.id)
        .order("created_at", { ascending: false });

      setApplications(
        (apps || []).map((a: Record<string, unknown>) => {
          const inv = a.investors as { handle: string; name: string } | null;
          return {
            id: a.id as string,
            created_at: a.created_at as string,
            status: a.status as string,
            investor_handle: inv?.handle || "",
            investor_name: inv?.name || "Unknown investor",
          };
        })
      );
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: "11px", color: "var(--slate)", letterSpacing: "0.08em", fontFamily: "JetBrains Mono, monospace" }}>// loading...</span>
    </main>
  );

  if (!founder) return null;

  const passportUrl = `https://scopecheck.ai/f/${founder.handle}`;
  const pct = founder.round_size > 0 ? Math.round(((founder.committed || 0) / founder.round_size) * 100) : 0;

  const statusColor = (s: string) =>
    s === "considering" ? "#60a5fa" : s === "passed" ? "var(--white-dim)" : "var(--amber)";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>&gt; scopecheck.ai</Link>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.08em" }}>signed in as {userEmail}</span>
          <Link href={`/f/${founder.handle}`} className="btn-secondary" style={{ padding: "5px 12px", fontSize: "10px" }}>view passport ↗</Link>
          <Link href="/passport" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px" }}>edit passport →</Link>
          <button onClick={async () => { const { supabase } = await import("@/lib/supabase"); await supabase.auth.signOut(); window.location.href = "/"; }} style={{ background: "none", border: "1px solid var(--border2)", color: "var(--white-dim)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 10px", cursor: "pointer", letterSpacing: "0.06em" }}>
            sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "6px" }}>// founder dashboard</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "4px" }}>{founder.company_name}</h1>
          <p style={{ fontSize: "12px", color: "var(--white-mid)" }}>{founder.one_liner}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", marginBottom: "24px" }}>
          {[
            { label: "passport views", value: founder.view_count || 0, color: "var(--amber)" },
            { label: "intros sent", value: applications.length, color: "var(--white)" },
            { label: "under consideration", value: applications.filter(a => a.status === "considering").length, color: "#60a5fa" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "var(--bg2)", padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 700, color, marginBottom: "6px", fontFamily: "JetBrains Mono, monospace" }}>{value}</div>
              <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-dim)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Passport link */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderTop: "2px solid var(--amber)", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "10px" }}>// your passport</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
            <div style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--amber)", borderRight: "none", padding: "9px 14px", fontSize: "12px", color: "var(--amber)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {passportUrl}
            </div>
            <CopyButton text={passportUrl} style={{ borderLeft: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <Link href={`/f/${founder.handle}`} className="btn-secondary" style={{ fontSize: "10px", padding: "6px 14px" }}>View live ↗</Link>
            <Link href="/passport" className="btn-primary" style={{ fontSize: "10px", padding: "6px 14px" }}>Edit passport →</Link>
          </div>
        </div>

        {/* Round progress */}
        {founder.round_size > 0 && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "20px 24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)" }}>// round progress</div>
              <span style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 600 }}>{pct}% committed</span>
            </div>
            <div style={{ height: "6px", background: "var(--bg3)", borderRadius: "3px", marginBottom: "12px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--amber)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {[
                { label: "raising", val: `€${(founder.round_size / 1000000).toFixed(1)}M` },
                { label: "committed", val: `€${((founder.committed || 0) / 1000000).toFixed(1)}M` },
                { label: "available", val: `€${((founder.round_size - (founder.committed || 0)) / 1000).toFixed(0)}K` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--amber)", fontFamily: "JetBrains Mono, monospace" }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intros sent */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", padding: "20px 24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-mid)", marginBottom: "16px" }}>// intros sent</div>
          {applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--white-dim)", fontSize: "12px" }}>
              <p style={{ margin: "0 0 12px" }}>No intros sent yet.</p>
              <Link href="/" style={{ color: "var(--amber)", fontSize: "11px", textDecoration: "none" }}></Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              {applications.map(app => (
                <div key={app.id} style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "2px" }}>{app.investor_name}</div>
                    <div style={{ fontSize: "10px", color: "var(--white-dim)" }}>
                      {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {app.investor_handle && (
                        <> · <Link href={`/i/${app.investor_handle}`} style={{ color: "var(--rasp)", textDecoration: "none" }}>view scope ↗</Link></>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 8px", border: `1px solid ${statusColor(app.status)}`, color: statusColor(app.status), background: "transparent" }}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
