import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Hr, Row, Column } from "@react-email/components";

// Investor weekly digest
export function InvestorDigest({
  name = "Alex",
  newIntros = 3,
  totalPipeline = 12,
  considering = 4,
  topIntro = { company: "Carbonade", oneLiner: "AI heat pumps for industrial decarbonisation", sector: "ClimateTech" },
  dashboardUrl = "https://scopecheck.ai/dashboard",
  unsubscribeUrl = "https://scopecheck.ai/unsubscribe",
}: {
  name?: string;
  newIntros?: number;
  totalPipeline?: number;
  considering?: number;
  topIntro?: { company: string; oneLiner: string; sector: string };
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <Html><Head />
      <Preview>{`Your ScopeCheck week: ${newIntros} new intros, ${considering} under consideration.`}</Preview>
      <Body style={{ backgroundColor: "#0d0d0d", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0d0d0d", fontFamily: "'Courier New', monospace" }}>
          <Section style={{ padding: "16px 24px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#d4286a" }}>&gt; scopecheck.ai</Text>
          </Section>
          <Section style={{ padding: "32px 24px" }}>
            <Text style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#d4286a", margin: "0 0 12px" }}>// weekly pipeline</Text>
            <Heading style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f0", margin: "0 0 20px" }}>
              Your week in deal flow, {name}.
            </Heading>
            <Row style={{ marginBottom: "20px" }}>
              {[
                { label: "new intros" as string, value: String(newIntros), color: "#d4286a" },
                { label: "pipeline total", value: String(totalPipeline), color: "#f0f0f0" },
                { label: "considering", value: String(considering), color: "#60a5fa" },
              ].map((stat) => (
                <Column key={String(stat.label)} style={{ textAlign: "center", padding: "12px", backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)" }}>
                  <Text style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: stat.color }}>{stat.value}</Text>
                  <Text style={{ margin: 0, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>{stat.label}</Text>
                </Column>
              ))}
            </Row>
            {topIntro && (
              <>
                <Text style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569", margin: "0 0 8px" }}>Top new intro this week</Text>
                <Section style={{ backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)", borderLeft: "3px solid #d4286a", padding: "14px 16px", marginBottom: "20px" }}>
                  <Text style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#f0f0f0" }}>{topIntro.company}</Text>
                  <Text style={{ margin: "0 0 6px", fontSize: "11px", color: "#94a3b8" }}>{topIntro.oneLiner}</Text>
                  <Text style={{ margin: 0, fontSize: "10px", color: "#f0a500" }}>{topIntro.sector}</Text>
                </Section>
              </>
            )}
            <Link href={dashboardUrl} style={{ display: "inline-block", backgroundColor: "#d4286a", color: "#ffffff", fontFamily: "'Courier New', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none" }}>
              Open pipeline →
            </Link>
          </Section>
          <Section style={{ padding: "14px 24px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "10px", color: "#475569" }}>
              scopecheck.ai · sent weekly · <Link href={unsubscribeUrl} style={{ color: "#475569" }}>unsubscribe from digest</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Founder weekly digest
export function FounderDigest({
  name = "Harry",
  companyName = "Carbonade",
  passportViews = 14,
  introsSent = 3,
  statusUpdates = 1,
  passportUrl = "https://scopecheck.ai/f/carbonade",
  unsubscribeUrl = "https://scopecheck.ai/unsubscribe",
}: {
  name?: string;
  companyName?: string;
  passportViews?: number;
  introsSent?: number;
  statusUpdates?: number;
  passportUrl?: string;
  unsubscribeUrl?: string;
}) {
  return (
    <Html><Head />
      <Preview>{`${companyName}: ${passportViews} passport views this week.`}</Preview>
      <Body style={{ backgroundColor: "#0d0d0d", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0d0d0d", fontFamily: "'Courier New', monospace" }}>
          <Section style={{ padding: "16px 24px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#d4286a" }}>&gt; scopecheck.ai</Text>
          </Section>
          <Section style={{ padding: "32px 24px" }}>
            <Text style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#f0a500", margin: "0 0 12px" }}>// weekly passport stats</Text>
            <Heading style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f0", margin: "0 0 20px" }}>
              {companyName}&apos;s week on ScopeCheck.
            </Heading>
            <Row style={{ marginBottom: "24px" }}>
              {[
                { label: "passport views", value: String(passportViews), color: "#f0a500" },
                { label: "intros sent", value: String(introsSent), color: "#f0f0f0" },
                { label: "status updates", value: String(statusUpdates), color: "#60a5fa" },
              ].map((stat) => (
                <Column key={String(stat.label)} style={{ textAlign: "center", padding: "12px", backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)" }}>
                  <Text style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: stat.color }}>{stat.value}</Text>
                  <Text style={{ margin: 0, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>{stat.label}</Text>
                </Column>
              ))}
            </Row>
            <Text style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.8", margin: "0 0 20px" }}>
              Hi {name}, your passport was viewed {passportViews} times this week. Keep sharing the link — every view is a potential conversation.
            </Text>
            <Link href={passportUrl} style={{ display: "inline-block", backgroundColor: "#f0a500", color: "#000000", fontFamily: "'Courier New', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none" }}>
              View your passport →
            </Link>
          </Section>
          <Section style={{ padding: "14px 24px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "10px", color: "#475569" }}>
              scopecheck.ai · sent weekly · <Link href={unsubscribeUrl} style={{ color: "#475569" }}>unsubscribe from digest</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
