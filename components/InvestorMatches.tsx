"use client";

import { useEffect, useState } from "react";

type Match = {
  id: string;
  name: string;
  firm: string;
  title: string | null;
  relevance: string[];
  score: number;
};

export function InvestorMatches({
  sector,
  stage,
  geography,
}: {
  sector: string;
  stage: string;
  geography: string;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sector && !stage && !geography) {
      setLoading(false);
      return;
    }
    fetch(
      `/api/investor-matches?sector=${encodeURIComponent(sector)}&stage=${encodeURIComponent(stage)}&geography=${encodeURIComponent(geography)}`
    )
      .then((r) => r.json())
      .then((data) => setMatches(data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [sector, stage, geography]);

  if (loading) {
    return (
      <div style={{ padding: "1.5rem 0" }}>
        <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "0.75rem" }}>
          Investor Matches
        </h3>
        <p style={{ color: "var(--white-dim)", fontSize: "0.85rem" }}>Finding relevant investors...</p>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div style={{ padding: "1.5rem 0", borderTop: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "0.75rem" }}>
        Suggested Investors ({matches.length})
      </h3>
      <p style={{ fontSize: "0.8rem", color: "var(--white-dim)", marginBottom: "1rem", lineHeight: 1.4 }}>
        Based on your sector, stage, and geography, these investors from the Raspberry network may be a fit.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {matches.map((m) => (
          <div key={m.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ color: "var(--white)", fontSize: "0.9rem", fontWeight: 500 }}>{m.name}</span>
              {m.firm && m.firm !== m.name && (
                <span style={{ color: "var(--white-dim)", fontSize: "0.8rem", marginLeft: "0.5rem" }}>{m.firm}</span>
              )}
              {m.title && (
                <span style={{ color: "var(--white-dim)", fontSize: "0.75rem", marginLeft: "0.5rem", opacity: 0.7 }}>
                  &middot; {m.title}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {m.relevance.slice(0, 2).map((r, i) => (
                <span key={i} style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", color: "var(--green, #4ade80)", whiteSpace: "nowrap" }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
