import {
  Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Hr, Row, Column
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
      <Body style={{ backgroundColor: "#0d0d0d", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0d0d0d", fontFamily: "'Courier New', monospace" }}>

          {/* Header */}
          <Section style={{ padding: "16px 24px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#d4286a", letterSpacing: "0.04em" }}>
              &gt; scopecheck.ai
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: "32px 24px" }}>
            <Text style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#d4286a", margin: "0 0 12px" }}>
              // new intro
            </Text>
            <Heading style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {companyName} introduced themselves.
            </Heading>
            <Text style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 28px", lineHeight: "1.6" }}>
              Via your investor scope · to {investorName}
            </Text>

            {/* Company card */}
            <Section style={{ backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)", borderLeft: "3px solid #d4286a", padding: "16px 20px", marginBottom: "20px" }}>
              <Text style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#f0f0f0" }}>{companyName}</Text>
              <Text style={{ margin: "0 0 12px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>{oneLiner}</Text>
              <Row>
                <Column>
                  <Text style={{ margin: "0 0 2px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>Stage</Text>
                  <Text style={{ margin: 0, fontSize: "11px", color: "#f0f0f0" }}>{stage}</Text>
                </Column>
                <Column>
                  <Text style={{ margin: "0 0 2px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>Sector</Text>
                  <Text style={{ margin: 0, fontSize: "11px", color: "#f0a500" }}>{sector}</Text>
                </Column>
              </Row>
              <Hr style={{ borderColor: "rgba(100,116,139,0.2)", margin: "12px 0" }} />
              <Text style={{ margin: "0 0 2px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>Traction</Text>
              <Text style={{ margin: 0, fontSize: "11px", color: "#f0f0f0" }}>{traction}</Text>
            </Section>

            {/* CTAs */}
            <Section style={{ marginBottom: "8px" }}>
              <Link href={passportUrl} style={{ display: "inline-block", backgroundColor: "#d4286a", color: "#ffffff", fontFamily: "'Courier New', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none", marginRight: "8px" }}>
                View passport →
              </Link>
              {deckUrl && (
                <Link href={deckUrl} style={{ display: "inline-block", backgroundColor: "transparent", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.35)", fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none", marginRight: "8px" }}>
                  View deck ↗
                </Link>
              )}
              <Link href={dashboardUrl} style={{ display: "inline-block", backgroundColor: "transparent", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.35)", fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none" }}>
                Open pipeline →
              </Link>
            </Section>

            <Text style={{ fontSize: "11px", color: "#475569", marginTop: "20px", lineHeight: "1.7" }}>
              {founderName} sent this intro through your ScopeCheck scope page. It has been added to your inbound pipeline.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ padding: "14px 24px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "10px", color: "#475569", letterSpacing: "0.06em" }}>
              scopecheck.ai · by raspberry.ventures ·{" "}
              <Link href={unsubscribeUrl} style={{ color: "#475569" }}>unsubscribe from intro notifications</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
