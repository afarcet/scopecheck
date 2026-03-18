import {
  Body, Head, Html, Link, Preview, Text
} from "@react-email/components";

interface Props {
  investorName: string;
  founderName: string;
  companyName: string;
  oneLiner: string;
  stage: string;
  sector: string;
  traction: string;
  deckUrl?: string;
  passportUrl: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export default function InvestorNotification({
  investorName = "Alex",
  founderName = "Harry Founder",
  companyName = "Carbonade",
  oneLiner = "AI-optimised heat pumps for industrial decarbonisation.",
  stage = "Seed",
  sector = "ClimateTech",
  traction = "€180K ARR · 3 enterprise pilots",
  deckUrl,
  passportUrl = "https://scopecheck.ai/f/carbonade",
  dashboardUrl = "https://scopecheck.ai/dashboard",
  unsubscribeUrl = "https://scopecheck.ai/unsubscribe",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>New intro from {companyName} — {oneLiner}</Preview>
      <Body style={{ margin: 0, padding: 0 }}>
        <Text style={{ fontFamily: "sans-serif", fontSize: "14px", lineHeight: "1.6", color: "#222" }}>
          Hi {investorName},<br /><br />
          <strong>{companyName}</strong> just sent you an intro via ScopeCheck.<br /><br />
          <strong>Company:</strong> {companyName}<br />
          <strong>One-liner:</strong> {oneLiner}<br />
          <strong>Stage:</strong> {stage}<br />
          <strong>Sector:</strong> {sector}<br />
          <strong>Traction:</strong> {traction}<br />
          {deckUrl && <><strong>Deck:</strong> <Link href={deckUrl} style={{ color: "#1a73e8" }}>{deckUrl}</Link><br /></>}
          <br />
          <Link href={passportUrl} style={{ color: "#1a73e8" }}>View passport →</Link><br />
          <Link href={dashboardUrl} style={{ color: "#1a73e8" }}>Open pipeline →</Link>
        </Text>
        <Text style={{ fontFamily: "sans-serif", fontSize: "11px", lineHeight: "1.4", color: "#999" }}>
          scopecheck.ai · <Link href={unsubscribeUrl} style={{ color: "#999" }}>unsubscribe</Link>
        </Text>
      </Body>
    </Html>
  );
}
