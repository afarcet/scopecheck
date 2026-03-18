import {
  Body, Container, Head, Html, Link, Preview, Section, Text
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
  const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <Html>
      <Head />
      <Preview>New intro from {companyName} — {oneLiner}</Preview>
      <Body style={{ backgroundColor: "#ffffff", margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: "520px", margin: "0 auto", fontFamily: font }}>

          <Section style={{ padding: "0 8px" }}>
            <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a", margin: "0 0 20px" }}>
              Hi {investorName},
            </Text>

            <Text style={{ fontSize: "15px", lineHeight: "1.6", color: "#1a1a1a", margin: "0 0 24px" }}>
              <strong>{companyName}</strong> just sent you an intro via ScopeCheck.
            </Text>

            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
              <strong>Company:</strong> {companyName}
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
              <strong>One-liner:</strong> {oneLiner}
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
              <strong>Stage:</strong> {stage}
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
              <strong>Sector:</strong> {sector}
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
              <strong>Traction:</strong> {traction}
            </Text>
            {deckUrl && (
              <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
                <strong>Deck:</strong>{" "}
                <Link href={deckUrl} style={{ color: "#1a73e8" }}>{deckUrl}</Link>
              </Text>
            )}

            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "24px 0 4px" }}>
              <Link href={passportUrl} style={{ color: "#1a73e8" }}>View passport →</Link>
            </Text>
            <Text style={{ fontSize: "14px", lineHeight: "1.8", color: "#333333", margin: "0 0 4px" }}>
              <Link href={dashboardUrl} style={{ color: "#1a73e8" }}>Open pipeline →</Link>
            </Text>

            <Text style={{ fontSize: "12px", lineHeight: "1.6", color: "#999999", margin: "32px 0 0" }}>
              scopecheck.ai ·{" "}
              <Link href={unsubscribeUrl} style={{ color: "#999999" }}>unsubscribe</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
