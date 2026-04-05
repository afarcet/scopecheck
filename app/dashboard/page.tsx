"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ââââââââââââââââââââââââââââââââââââââââââââââ
   Types
   ââââââââââââââââââââââââââââââââââââââââââââââ */

type PipelineColumn = "new" | "shortlisted" | "considering" | "watching" | "passed";
type Source = "inbound" | "scouted" | "referral" | "manual";
type Decision = "call" | "pass" | "watch" | "invest" | "not_yet";

interface UnifiedCard {
  id: string;
  table: "intros" | "pipeline";          // which table this came from
  company: string;
  founder: string;
  one_liner: string;
  sector: string;
  stage: string;
  geography: string;
  round_size: number | null;             // in thousands
  round_currency: string;
  lead_investor: string;
  has_lead: boolean;
  composite_score: number | null;
  source: Source;
  traction: string;
  deck_url: string;
  passport_handle: string;
  custom_answers: Record<string, string> | null;
  date: string;                           // ISO timestamp
  column: PipelineColumn;
  alex_decision: Decision | null;
  alex_reasoning: string;
  // original state value (for pipeline items)
  raw_state: string;
}

/* ââââââââââââââââââââââââââââââââââââââââââââââ
   Helpers
   ââââââââââââââââââââââââââââââââââââââââââââââ */

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

function formatRoundSize(thousands: number | null, currency: string): string {
  if (!thousands) return "";
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "Â£" : "â¬";
  if (thousands >= 1000) return `${symbol}${(thousands / 1000).toFixed(thousands % 1000 === 0 ? 0 : 1)}M`;
  return `${symbol}${thousands}k`;
}

/** Map intros.status â pipeline column */
function introStatusToColumn(status: string): PipelineColumn {
  if (status === "considering") return "considering";
  if (status === "passed") return "passed";
  return "new";
}

/** Map pipeline.state â pipeline column */
function pipelineStateToColumn(state: string): PipelineColumn {
  switch (state) {
    case "new":
    case "qualified":
      return "new";
    case "shortlisted":
    case "outreach":
    case "scheduled":
      return "shortlisted";
    case "called":
    case "considering":
      return "considering";
    case "watching":
      return "watching";
    case "passed":
      return "passed";
    case "invested":
      return "passed";   // show invested in passed for now
    default:
      return "new";
  }
}

/** Reverse: column â target state for each table */
function columnToIntroStatus(col: PipelineColumn): string {
  if (col === "considering") return "considering";
  if (col === "passed") return "passed";
  return "new";
}
function columnToPipelineState(col: PipelineColumn): string {
  switch (col) {
    case "new":          return "new";
    case "shortlisted":  return "shortlisted";
    case "considering":  return "considering";
    case "watching":     return "watching";
    case "passed":       return "passed";
  }
}

/* ââââââââââââââââââââââââââââââââââââââââââââââ
   Column config
   ââââââââââââââââââââââââââââââââââââââââââââââ */

const COLUMNS: { key: PipelineColumn; label: string; color: string; empty: string }[] = [
  { key: "new",          label: "New",          color: "var(--amber)",  empty: "// no new deals" },
  { key: "shortlisted",  label: "Shortlisted",  color: "#a78bfa",      empty: "// nothing shortlisted yet" },
  { key: "considering",  label: "Considering",   color: "#60a5fa",      empty: "// nothing here yet" },
  { key: "watching",     label: "Watching",      color: "#34d399",      empty: "// not watching anything" },
  { key: "passed",       label: "Passed",        color: "var(--slate, #64748b)", empty: "// no passed deals" },
];

/* ââââââââââââââââââââââââââââââââââââââââââââââ
   Source tag colors
   ââââââââââââââââââââââââââââââââââââââââââââââ */

const SOURCE_STYLES: Record<Source, { bg: string; color: string; border: string }> = {
  inbound:  { bg: "var(--rasp-dim)",  color: "var(--rasp)",  border: "var(--rasp-border)" },
  scouted:  { bg: "var(--amber-dim)", color: "var(--amber)", border: "var(--amber-border)" },
  referral: { bg: "var(--pink-dim)",  color: "var(--pink)",  border: "var(--pink-border)" },
  manual:   { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "rgba(100,116,139,0.35)" },
};

/* ââââââââââââââââââââââââââââââââââââââââââââââ
   Component
   ââââââââââââââââââââââââââââââââââââââââââââââ */

export default function Dashboard() {
  const router = useRouter();

  const [cards,          setCards]          = useState<UnifiedCard[]>([]);
  const [expanded,       setExpanded]       = useState<string | null>(null);
  const [authChecked,    setAuthChecked]    = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [userEmail,      setUserEmail]      = useState("");
  const [investorHandle, setInvestorHandle] = useState("");

  // Inline note editing
  const [editingNote,    setEditingNote]    = useState<string | null>(null);
  const [noteText,       setNoteText]       = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.push("/scope");
        return;
      }

      const email  = session.user.email ?? "";
      const userId = session.user.id;
      setUserEmail(email);

      // Resolve investor handle
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

      // ââ Fetch both tables in parallel ââ
      const [introsResult, pipelineResult] = await Promise.all([
        supabase
          .from("intros")
          .select("*")
          .eq("investor_handle", handle)
          .order("created_at", { ascending: false }),
        supabase
          .from("pipeline")
          .select("*")
          .order("composite_score", { ascending: false, nullsFirst: false }),
      ]);

      const unified: UnifiedCard[] = [];

      // Map intros rows
      if (introsResult.data) {
        for (const r of introsResult.data) {
          unified.push({
            id:              r.id,
            table:           "intros",
            company:         r.company_name ?? "",
            founder:         r.founder_name ?? "",
            one_liner:       r.one_liner ?? "",
            sector:          r.sector ?? "",
            stage:           r.stage ?? "",
            geography:       r.country ?? "",
            round_size:      null,
            round_currency:  "EUR",
            lead_investor:   r.lead_details ?? "",
            has_lead:        r.has_lead ?? false,
            composite_score: r.scope_fit_score?.total ?? null,
            source:          "inbound",
            traction:        r.traction ?? "",
            deck_url:        r.deck_url ?? "",
            passport_handle: r.founder_handle ?? "",
            custom_answers:  r.custom_answers ?? null,
            date:            r.created_at,
            column:          introStatusToColumn(r.status ?? "new"),
            alex_decision:   null,
            alex_reasoning:  "",
            raw_state:       r.status ?? "new",
          });
        }
      }

      // Map pipeline rows
      if (pipelineResult.data) {
        for (const r of pipelineResult.data) {
          unified.push({
            id:              r.id,
            table:           "pipeline",
            company:         r.company_name ?? "",
            founder:         r.founder_name ?? "",
            one_liner:       r.one_liner ?? "",
            sector:          r.sector ?? "",
            stage:           r.stage ?? "",
            geography:       r.geography ?? "",
            round_size:      r.round_size,
            round_currency:  r.round_currency ?? "EUR",
            lead_investor:   r.lead_investor ?? "",
            has_lead:        r.has_lead ?? false,
            composite_score: r.composite_score ? Number(r.composite_score) : null,
            source:          (r.source as Source) ?? "manual",
            traction:        r.traction_summary ?? "",
            deck_url:        r.deck_url ?? "",
            passport_handle: "",
            custom_answers:  null,
            date:            r.first_seen_at ?? r.created_at,
            column:          pipelineStateToColumn(r.state ?? "new"),
            alex_decision:   (r.alex_decision as Decision) ?? null,
            alex_reasoning:  r.alex_reasoning ?? "",
            raw_state:       r.state ?? "new",
          });
        }
      }

      setCards(unified);
      setLoading(false);
    });
  }, [router]);

  /* ââ Move card to a different column ââ */
  const moveCard = async (id: string, targetCol: PipelineColumn) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, column: targetCol } : c))
    );
    setExpanded(null);

    const card = cards.find((c) => c.id === id);
    if (!card) return;

    if (card.table === "intros") {
      await supabase.from("intros").update({ status: columnToIntroStatus(targetCol) }).eq("id", id);
    } else {
      const newState = columnToPipelineState(targetCol);
      await supabase
        .from("pipeline")
        .update({ state: newState, state_changed_at: new Date().toISOString() })
        .eq("id", id);
    }
  };

  /* ââ Set decision on pipeline card ââ */
  const setDecision = async (id: string, decision: Decision) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, alex_decision: decision } : c))
    );

    const card = cards.find((c) => c.id === id);
    if (!card) return;

    if (card.table === "pipeline") {
      await supabase.from("pipeline").update({ alex_decision: decision }).eq("id", id);
    }
    // For intros: decision maps to status change
    if (card.table === "intros") {
      const statusMap: Partial<Record<Decision, string>> = { pass: "passed", call: "considering" };
      if (statusMap[decision]) {
        await supabase.from("intros").update({ status: statusMap[decision] }).eq("id", id);
      }
    }
  };

  /* ââ Save note ââ */
  const saveNote = async (id: string, text: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, alex_reasoning: text } : c))
    );
    setEditingNote(null);

    const card = cards.find((c) => c.id === id);
    if (!card) return;

    if (card.table === "pipeline") {
      await supabase.from("pipeline").update({ alex_reasoning: text }).eq("id", id);
    }
    // For intros, write to investor_notes via the intro row
    // (intros table doesn't have investor_notes directly, skip for now)
  };

  /* ââ Sorted + filtered cards per column ââ */
  const byColumn = useMemo(() => {
    const result: Record<PipelineColumn, UnifiedCard[]> = {
      new: [], shortlisted: [], considering: [], watching: [], passed: [],
    };
    for (const card of cards) {
      result[card.column].push(card);
    }
    // Sort New: composite_score DESC, then date DESC
    result.new.sort((a, b) => {
      if (a.composite_score !== null && b.composite_score !== null) {
        return b.composite_score - a.composite_score;
      }
      if (a.composite_score !== null) return -1;
      if (b.composite_score !== null) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    // Other columns: date DESC
    for (const col of ["shortlisted", "considering", "watching", "passed"] as PipelineColumn[]) {
      result[col].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return result;
  }, [cards]);

  /* ââ Loading state ââ */
  if (!authChecked || loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--white-dim)", letterSpacing: "0.08em" }}>// loading pipeline...</span>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ââ NAV ââ */}
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
            pipeline
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
              my scope â
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

      {/* ââ COLUMN SUMMARY BAR ââ */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "8px 20px", display: "flex", gap: "24px", background: "var(--bg2)", overflowX: "auto" }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)" }}>{col.label}</span>
            <span style={{ fontSize: "11px", color: "var(--white)", fontWeight: 600 }}>{byColumn[col.key].length}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "10px", color: "var(--white-dimmer)", whiteSpace: "nowrap" }}>
          {cards.length === 0 ? "// no deals yet" : `// ${cards.length} total`}
        </div>
      </div>

      {/* ââ KANBAN BOARD ââ */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, minHeight: "calc(100vh - 100px)", overflowX: "auto" }}>
        {COLUMNS.map((col, ci) => (
          <div
            key={col.key}
            style={{
              borderRight: ci < COLUMNS.length - 1 ? "1px solid var(--border)" : "none",
              padding: "20px 12px",
              minWidth: "220px",
            }}
          >
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
              <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: col.color }}>{col.label}</span>
              <span style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0 6px", fontSize: "10px", color: "var(--white-dim)" }}>
                {byColumn[col.key].length}
              </span>
            </div>

            {/* Cards */}
            {byColumn[col.key].map((card) => {
              const srcStyle = SOURCE_STYLES[card.source] ?? SOURCE_STYLES.manual;
              const isExpanded = expanded === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => setExpanded(isExpanded ? null : card.id)}
                  style={{
                    background:   isExpanded ? "var(--bg3)" : "var(--bg2)",
                    border:       "1px solid var(--border2)",
                    borderLeft:   `3px solid ${col.color}`,
                    padding:      "12px",
                    marginBottom: "8px",
                    cursor:       "pointer",
                  }}
                >
                  {/* Row 1: Company + source tag */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "13px", lineHeight: 1.3 }}>{card.company}</span>
                    <span style={{
                      fontSize: "8px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      border: `1px solid ${srcStyle.border}`,
                      background: srcStyle.bg,
                      color: srcStyle.color,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}>
                      {card.source === "scouted" || card.source === "manual" && card.table === "pipeline" ? "scouted" : card.source}
                    </span>
                  </div>

                  {/* Row 2: One-liner */}
                  {card.one_liner && (
                    <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: "0 0 6px", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {card.one_liner}
                    </p>
                  )}

                  {/* Row 3: Sector tag */}
                  {card.sector && (
                    <div style={{ marginBottom: "6px" }}>
                      <span style={{ fontSize: "9px", letterSpacing: "0.08em", padding: "2px 6px", border: "1px solid var(--border2)", color: "var(--white-dim)" }}>
                        {card.sector}
                      </span>
                    </div>
                  )}

                  {/* Row 4: Stage + Geography + Round */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "10px", color: "var(--white-dim)", marginBottom: "4px" }}>
                    {card.stage && <span style={{ color: "var(--amber)" }}>{card.stage}</span>}
                    {card.stage && card.geography && <span>Â·</span>}
                    {card.geography && <span>{card.geography}</span>}
                    {card.round_size && (
                      <>
                        <span>Â·</span>
                        <span style={{ color: "var(--white-mid)" }}>{formatRoundSize(card.round_size, card.round_currency)}</span>
                      </>
                    )}
                  </div>

                  {/* Row 5: Lead investor + Score badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px" }}>
                    <span style={{ color: "var(--white-dimmer)" }}>
                      {card.lead_investor ? `Led by ${card.lead_investor}` : card.has_lead ? "Has lead" : ""}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {card.composite_score !== null && (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "3px",
                          background: card.composite_score >= 70 ? "var(--amber-dim)" : card.composite_score >= 40 ? "rgba(96,165,250,0.12)" : "rgba(100,116,139,0.12)",
                          color: card.composite_score >= 70 ? "var(--amber)" : card.composite_score >= 40 ? "#60a5fa" : "#94a3b8",
                          border: `1px solid ${card.composite_score >= 70 ? "var(--amber-border)" : card.composite_score >= 40 ? "rgba(96,165,250,0.35)" : "rgba(100,116,139,0.35)"}`,
                        }}>
                          {Math.round(card.composite_score)}
                        </span>
                      )}
                      <span style={{ color: "var(--white-dimmer)" }}>{formatRelativeTime(card.date)}</span>
                    </div>
                  </div>

                  {/* ââ EXPANDED DETAIL ââ */}
                  {isExpanded && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>

                      {/* Decision badge */}
                      {card.alex_decision && (
                        <div style={{ marginBottom: "10px" }}>
                          <span style={{
                            fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase",
                            padding: "3px 8px",
                            background: card.alex_decision === "call" ? "var(--rasp-dim)" : card.alex_decision === "pass" ? "rgba(239,68,68,0.1)" : "var(--amber-dim)",
                            color: card.alex_decision === "call" ? "var(--rasp)" : card.alex_decision === "pass" ? "#ef4444" : "var(--amber)",
                            border: `1px solid ${card.alex_decision === "call" ? "var(--rasp-border)" : card.alex_decision === "pass" ? "rgba(239,68,68,0.3)" : "var(--amber-border)"}`,
                          }}>
                            decision: {card.alex_decision}
                          </span>
                        </div>
                      )}

                      {card.traction && (
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "3px" }}>traction</div>
                          <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0 }}>{card.traction}</p>
                        </div>
                      )}

                      {card.founder && (
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "3px" }}>founder</div>
                          <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0 }}>{card.founder}</p>
                        </div>
                      )}

                      {card.custom_answers && Object.entries(card.custom_answers).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "3px" }}>{key}</div>
                          <p style={{ fontSize: "11px", color: "var(--white-mid)", margin: 0 }}>{value}</p>
                        </div>
                      ))}

                      {/* Notes section */}
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "3px" }}>notes</div>
                        {editingNote === card.id ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              rows={3}
                              style={{
                                background: "var(--bg)",
                                border: "1px solid var(--border2)",
                                color: "var(--white)",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "11px",
                                padding: "8px",
                                resize: "vertical",
                                outline: "none",
                                width: "100%",
                              }}
                              placeholder="Add your reasoning or notes..."
                            />
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); saveNote(card.id, noteText); }}
                                style={{ background: "var(--rasp)", color: "#fff", border: "1px solid var(--rasp)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 10px", cursor: "pointer" }}
                              >save</button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingNote(null); }}
                                style={{ background: "transparent", border: "1px solid var(--border2)", color: "var(--white-dim)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "5px 10px", cursor: "pointer" }}
                              >cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNote(card.id);
                              setNoteText(card.alex_reasoning);
                            }}
                            style={{
                              fontSize: "11px",
                              color: card.alex_reasoning ? "var(--white-mid)" : "var(--white-dimmer)",
                              margin: 0,
                              cursor: "text",
                              fontStyle: card.alex_reasoning ? "normal" : "italic",
                              padding: "4px 0",
                            }}
                          >
                            {card.alex_reasoning || "click to add notes..."}
                          </p>
                        )}
                      </div>

                      {/* Action buttons row 1: Links */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                        {card.deck_url && (
                          <a
                            href={card.deck_url}
                            target="_blank"
                            rel="noopener"
                            onClick={(e) => e.stopPropagation()}
                            style={{ flex: 1, textAlign: "center", background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "7px 10px", textDecoration: "none", whiteSpace: "nowrap" }}
                          >
                            view deck â
                          </a>
                        )}
                        {card.passport_handle && (
                          <Link
                            href={`/f/${card.passport_handle}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ flex: 1, textAlign: "center", background: "var(--bg3)", color: "var(--white-mid)", border: "1px solid var(--border2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", padding: "7px 10px", textDecoration: "none", whiteSpace: "nowrap" }}
                          >
                            passport â
                          </Link>
                        )}
                      </div>

                      {/* Action buttons row 2: Move between columns */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                        {COLUMNS.filter((c) => c.key !== col.key).map((target) => (
                          <button
                            key={target.key}
                            onClick={(e) => { e.stopPropagation(); moveCard(card.id, target.key); }}
                            style={{
                              flex: 1,
                              background: "transparent",
                              border: `1px solid ${target.color}`,
                              color: target.color,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "9px",
                              padding: "6px 4px",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.04em",
                            }}
                          >
                            â {target.label}
                          </button>
                        ))}
                      </div>

                      {/* Action buttons row 3: Decisions */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {([
                          { key: "call" as Decision, label: "Call", bg: "var(--rasp)", border: "var(--rasp)", color: "#fff" },
                          { key: "watch" as Decision, label: "Watch", bg: "transparent", border: "var(--amber-border)", color: "var(--amber)" },
                          { key: "not_yet" as Decision, label: "Not yet", bg: "transparent", border: "var(--border2)", color: "var(--white-dim)" },
                          { key: "pass" as Decision, label: "Pass", bg: "transparent", border: "rgba(239,68,68,0.3)", color: "#ef4444" },
                        ]).map((btn) => (
                          <button
                            key={btn.key}
                            onClick={(e) => { e.stopPropagation(); setDecision(card.id, btn.key); }}
                            style={{
                              flex: 1,
                              background: card.alex_decision === btn.key ? btn.bg : "transparent",
                              border: `1px solid ${btn.border}`,
                              color: btn.color,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "10px",
                              fontWeight: card.alex_decision === btn.key ? 700 : 400,
                              padding: "7px 4px",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              opacity: card.alex_decision && card.alex_decision !== btn.key ? 0.4 : 1,
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {byColumn[col.key].length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--white-dimmer)", fontSize: "11px" }}>
                {col.empty}
              </div>
            )}
          </div>
        ))}
      </div>

    </main>
  );
}
