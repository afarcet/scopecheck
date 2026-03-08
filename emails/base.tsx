// Shared base styles for all ScopeCheck emails

export const base = {
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  bg: "#0d0d0d",
  bgCard: "#111827",
  bgCode: "#1a1f2e",
  rasp: "#d4286a",
  amber: "#f0a500",
  white: "#f0f0f0",
  whiteMid: "#94a3b8",
  whiteDim: "#475569",
  border: "rgba(100,116,139,0.2)",
  border2: "rgba(100,116,139,0.35)",
};

export const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: base.bg,
  fontFamily: base.fontFamily,
};

export const header = {
  padding: "20px 24px",
  borderBottom: `1px solid ${base.border}`,
};

export const logoText = {
  fontSize: "13px",
  fontWeight: 700,
  color: base.rasp,
  letterSpacing: "0.04em",
};

export const body = {
  padding: "32px 24px",
};

export const footer = {
  padding: "16px 24px",
  borderTop: `1px solid ${base.border}`,
  fontSize: "10px",
  color: base.whiteDim,
  letterSpacing: "0.06em",
};
