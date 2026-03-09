"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "new" | "considering" | "passed";

interface Application {
  id: string;
  company: string;
  founder: string;
  one_liner: string;
  sector: string;
  stage: string;
  traction: string;
  deck_url: string;
  received: string;
  status: Status;
}

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "new",         label: "New inbound", color: "var(--amber)"  },
  { key: "considering", label: "Considering",  color: "#60a5fa"      },
  { key: "passed",      label: "Passed",       color: "var(--slate)" },
];

export default function Dashboard() {
  const router = useRouter();

  const [apps,           setApps]           = useState<Application[]>([]);
  const [expanded,       setExpanded]       = useState<string | null>(null);
  const [authChecked,    setAuthChecked]    = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [userEmail,      setUserEmail]      = useState("");
  const [investorHandle, setInvestorHandle] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.push("/scope");
        return;
      }

      const email  = session.user.email ?? "";
      const userId = session.user.id;
      setUserEmail(email);

      // Resolve investor handle — user_id first, email fallback
      let handle = "";
      const { data: invById } = await supabase
        .from("investors")
        .select("handle")
        .eq("user_id", userId)
        .maybeSingle();

      if (invById) {
        handle = invById.handle;
      } else {
        const { data: invByEmail } = await supabase
          .from("investors")
          .select("handle")
          .eq("email", email)
          .maybeSingle();
        if (invByEmail) handle = invByEmail.handle;
      }

      setInvestorHandle(handle);
      setAuthChecked(true);

      if (!handle) {
        setLoading(false);
        return;
      }

      // Load real intros for this investor
      const { data: rows } = await supabase
        .from("intros")
        .select("*")
        .eq("investor_handle", handle)
        .order("created_at", { ascending: false });

      if (rows) {
        setApps(
          rows.map((r) => ({
            id:        r.id,
            company:   r.company_name ?? "",
            founder:   r.founder_name ?? "",
            one_liner: r.one_liner    ?? "",
            sector:    r.sector       ?? "",
            stage:     r.stage        ?? "",
            traction:  r.traction     ?? "",
            deck_url:  r.deck_url     ?? "",
            received:  formatRelativeTime(r.created_at),
            status:    (r.status as Status) ?? "new",
          }))
        );
      }

      setLoading(false);
    });
  }, [router]);

  // Persist status change to Supabase and update local state
  const move = async (id: string, status: Status) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setExpanded(null);
    await supabase.from("intros").update({ status }).eq("id", id);
  };

  const byStatus = (status: Status) => apps.filter((a) => a.status === status);

  if (!authChecked || loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--white-dim)", letterSpacing: "0.08em" }}>// loading pipeline...</span>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* NAV */}
      <nav style={{
        borderBottom: "1px solid var(--border)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textDecoration: "none" }}>
            &gt; scopecheck.ai
          </Link>
          <span style={{ color: "var(--border2)" }}>|</span>
          <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--white-dim)" }}>
            inbound pipeline
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {userEmail && (
            <span style={{ fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.04em", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
          )}
          {investorHandle && (
            <Link
              href={`/i/${investorHandle}`}
              style={{ background: "var(--bg2)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 10px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              my scope ↗
            </Link>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            style={{ background: "none", border: "none", color: "var(--white-dim)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 0", cursor: "pointer", letterSpacing: "0.06em" }}
          >
            sign out
          </button>
        </div>
      </nav>

      {/* COLUMN SUMMARY BAR */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "8px 20px", display: "flex", gap: "24px", background: "var(--bg2)" }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, display: "inline-block" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)" }}>{col.label}</span>
            <span style={{ fontSize: "11px", color: "var(--white)", fontWeight: 600 }}>{byStatus(col.key).length}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "10px", color: "var(--white-dimmer)" }}>
          {apps.length === 0 ? "// no intros yet" : `// ${apps.length} total`}
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", minHeight: "calc(100vh - 100px)" }}>
        {COLUMNS.map((col, ci) => (
          <div
            key={col.key}
            style={{ borderRight: ci < 2 ? "1px solid var(--border)" : "none", padding: "20px 16px" }}
          >
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.color }} />
              <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: col.color }}>{col.label}</span>
              <span style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0 6px", fontSize: "10px", color: "var(--white-dim)" }}>
                {byStatus(col.key).length}
              </span>
            </div>

            {/* Cards */}
            {byStatus(col.key).map((app) => (
              <div
                key={app.id}
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                style={{
                  background:   expanded === app.id ? "var(--bg3)" : "var(--bg2)",
                  border:       "1px solid var(--border2)",
                  borderLeft:   `3px solid ${col.color}`,
                  padding:      "14px",
                  marginBottom: "8px",
                  cursor:       "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>{app.company}</span>
                  {app.sector && (
                    <span style={{ fontSize: "9px", letterSpacing: "0.08em", padding: "2px 6px", border: "1px solid var(--border2)", color: "var(--white-dim)" }}>
                      {app.sector}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: "0 0 8px", lineHeight: 1.5 }}>
                  {app.one_liner}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--white-dim)" }}>
                  <span>{app.received}</span>
                  {app.stage && <span style={{ color: "var(--amber)" }}>{app.stage}</span>}
                </div>

                {/* Expanded detail */}
                {expanded === app.id && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                    {app.traction && (
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "3px" }}>traction</div>
                        <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0 }}>{app.traction}</p>
                      </div>
                    )}
                    {app.founder && (
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "3px" }}>founder</div>
                        <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0 }}>{app.founder}</p>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                      {app.deck_url && (
                        <a
                          href={app.deck_url}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1, textAlign: "center", background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "7px 10px", textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          view deck ↗
                        </a>
                      )}
                      <Link
                        href={`/f/${app.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, textAlign: "center", background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "7px 10px", textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        passport →
                      </Link>
                      {/* Bidirectional movement */}
                      {col.key !== "new" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); move(app.id, "new"); }}
                          style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--white-dim)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "7px 10px", cursor: "pointer" }}
                        >← new</button>
                      )}
                      {col.key !== "considering" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); move(app.id, "considering"); }}
                          style={{ background: "var(--rasp)", color: "#fff", border: "1px solid var(--rasp)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700, padding: "7px 10px", cursor: "pointer" }}
                        >👍 consider</button>
                      )}
                      {col.key !== "passed" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); move(app.id, "passed"); }}
                          style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "var(--white-mid)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "7px 10px", cursor: "pointer" }}
                        >👎 pass</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {byStatus(col.key).length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--white-dimmer)", fontSize: "11px" }}>
                {col.key === "new" ? "// no new inbound yet" : col.key === "considering" ? "// nothing here yet" : "// no passed deals"}
              </div>
            )}
          </div>
        ))}
      </div>

    </main>
  );
}
