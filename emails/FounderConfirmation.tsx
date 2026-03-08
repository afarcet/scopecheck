import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Hr } from "@react-email/components";

interface Props {
  founderName: string;
  companyName: string;
  investorName: string;
  investorFirm?: string;
  passportUrl: string;
  unsubscribeUrl: string;
}

export default function FounderConfirmation({
  founderName = "Harry",
  companyName = "Carbonade",
  investorName = "Alex Farcet",
  investorFirm = "Raspberry Ventures",
  passportUrl = "https://scopecheck.ai/f/carbonade",
  unsubscribeUrl = "https://scopecheck.ai/unsubscribe",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Intro sent to {investorName}. Your passport is ready to share.</Preview>
      <Body style={{ backgroundColor: "#0d0d0d", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0d0d0d", fontFamily: "'Courier New', monospace" }}>
          <Section style={{ padding: "16px 24px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#d4286a", letterSpacing: "0.04em" }}>&gt; scopecheck.ai</Text>
          </Section>

          <Section style={{ padding: "32px 24px" }}>
            <Text style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#f0a500", margin: "0 0 12px" }}>// intro sent ✓</Text>
            <Heading style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              {investorName} has been notified.
            </Heading>
            <Text style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 28px", lineHeight: "1.6" }}>
              Your intro for {companyName} was sent to {investorName}{investorFirm ? ` at ${investorFirm}` : ""}.
            </Text>

            <Section style={{ backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)", borderLeft: "3px solid #f0a500", padding: "16px 20px", marginBottom: "20px" }}>
              <Text style={{ margin: "0 0 4px", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>Your passport</Text>
              <Text style={{ margin: "0 0 12px", fontSize: "13px", color: "#f0a500" }}>{passportUrl}</Text>
              <Text style={{ margin: 0, fontSize: "11px", color: "#94a3b8", lineHeight: "1.7" }}>
                Share this link with any investor — on ScopeCheck or anywhere else. You won&apos;t need to fill in your details again.
              </Text>
            </Section>

            <Text style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.7", margin: "0 0 20px" }}>
              <strong style={{ color: "#f0f0f0" }}>Next: share your passport.</strong> Add it to your LinkedIn about section, your email signature, or drop it in any investor conversation. It takes 30 seconds and means you never repeat yourself again.
            </Text>

            <Link href={passportUrl} style={{ display: "inline-block", backgroundColor: "#f0a500", color: "#000000", fontFamily: "'Courier New', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none" }}>
              View your passport →
            </Link>
          </Section>

          <Section style={{ padding: "14px 24px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "10px", color: "#475569", letterSpacing: "0.06em" }}>
              scopecheck.ai · by raspberry.ventures · <Link href={unsubscribeUrl} style={{ color: "#475569" }}>unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
