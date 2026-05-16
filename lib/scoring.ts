// Raspberry scope-match scoring utility
// Scores a founder intro against Raspberry's investment thesis

export type ScopeSignal = "strong" | "moderate" | "low";

interface ScoringInput {
  stage?: string;
  sector?: string;
  geography?: string;
  roundSize?: number;
  cofounderCount?: string;
  priorFounder?: boolean;
  priorExit?: boolean;
  domainExperience?: string;
}

// Stage scoring: Pre-seed/Seed = 2, Series A = 1, later = 0
function scoreStage(stage?: string): number {
  if (!stage) return 0;
  const s = stage.toLowerCase();
  if (s.includes("pre-seed") || s.includes("preseed") || s.includes("seed") || s === "pre-revenue") return 2;
  if (s.includes("series a") || s === "a") return 1;
  return 0;
}

// Sector scoring: ClimateTech/DeepTech/Robotics/AI = 2, other B2B = 1, consumer/crypto = 0
function scoreSector(sector?: string): number {
  if (!sector) return 0;
  const s = sector.toLowerCase();
  const strongSectors = ["climate", "cleantech", "deeptech", "deep tech", "robotics", "ai", "artificial intelligence", "machine learning", "hardware", "energy", "sustainability"];
  const moderateSectors = ["b2b", "saas", "enterprise", "fintech", "healthtech", "biotech", "logistics", "supply chain", "industrial", "manufacturing", "agritech", "proptech", "construction"];
  const weakSectors = ["consumer", "crypto", "web3", "nft", "gaming", "social", "media", "e-commerce", "ecommerce", "marketplace"];
  if (strongSectors.some(k => s.includes(k))) return 2;
  if (weakSectors.some(k => s.includes(k))) return 0;
  if (moderateSectors.some(k => s.includes(k))) return 1;
  return 1; // default to moderate for unknown sectors
}

// Geography scoring: Europe = 2, other = 1
function scoreGeography(geo?: string): number {
  if (!geo) return 1;
  const g = geo.toLowerCase();
  const europe = ["europe", "eu", "uk", "france", "germany", "portugal", "spain", "italy", "netherlands", "belgium", "sweden", "denmark", "norway", "finland", "ireland", "switzerland", "austria", "poland", "czech", "romania", "estonia", "latvia", "lithuania", "london", "paris", "berlin", "lisbon", "amsterdam", "copenhagen", "stockholm"];
  if (europe.some(k => g.includes(k))) return 2;
  return 1;
}

// Founder signal scoring: repeat + exit = 2, domain or cofounders = 1, solo first-timer = 0
function scoreFounderSignals(input: ScoringInput): number {
  let score = 0;
  if (input.priorFounder) score += 1;
  if (input.priorExit) score += 1;
  if (score >= 2) return 2;
  if (input.domainExperience && input.domainExperience.trim().length > 10) score += 1;
  if (input.cofounderCount && input.cofounderCount !== "1" && input.cofounderCount !== "solo") score += 1;
  return Math.min(score, 2);
}

export function computeScopeSignal(input: ScoringInput): { signal: ScopeSignal; score: number; maxScore: number } {
  const stageScore = scoreStage(input.stage);
  const sectorScore = scoreSector(input.sector);
  const geoScore = scoreGeography(input.geography);
  const founderScore = scoreFounderSignals(input);

  const score = stageScore + sectorScore + geoScore + founderScore;
  const maxScore = 8;

  let signal: ScopeSignal;
  if (score >= 7) signal = "strong";
  else if (score >= 4) signal = "moderate";
  else signal = "low";

  return { signal, score, maxScore };
}

// Human-readable label for display
export function signalLabel(signal: ScopeSignal): string {
  switch (signal) {
    case "strong": return "Strong match";
    case "moderate": return "Moderate match";
    case "low": return "Low match";
  }
}

// Short explanation for the founder
export function signalExplanation(signal: ScopeSignal): string {
  switch (signal) {
    case "strong":
      return "Your profile aligns well with Raspberry\u2019s investment thesis. Alex will review and get back to you shortly.";
    case "moderate":
      return "There\u2019s partial alignment with Raspberry\u2019s scope. Alex will take a closer look and revert.";
    case "low":
      return "Based on first signals, this may be outside Raspberry\u2019s current scope. Alex will still review and respond.";
  }
}
