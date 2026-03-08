import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";

interface Props {
  name: string;
  companyName: string;
  passportUrl: string;
  day: 0 | 2 | 7;
  unsubscribeUrl: string;
}

const COPY = {
  0: {
    preview: "Your startup passport is ready.",
    tag: "// day 0 · passport is live",
    heading: "Your passport is ready.",
    body: `Your startup details live at the link below. Share it with any investor — on ScopeCheck or anywhere else. Every time you apply through a ScopeCheck scope, your fields pre-fill automatically.\n\nYou won't need to repeat yourself again.`,
    cta: "View your passport →",
  },
  2: {
    preview: "30 seconds that changes how investors find you.",
    tag: "// day 2 · quick win",
    heading: "Put your passport where investors will see it.",
    body: `The founders who move fastest do one thing early: they add their passport link to their LinkedIn about section and their email signature.\n\nIt takes 30 seconds. It means that when an investor looks you up — which they will — they land on a structured, professional summary of your round instead of a blank page.\n\nYour passport travels with you. Make it visible.`,
    cta: "Copy your passport link →",
  },
  7: {
    preview: "Ready to send your first intro?",
    tag: "// day 7 · check in",
    heading: "Ready to send your first intro?",
    body: `You have a passport but haven't sent an intro yet. When you're ready, find an investor on ScopeCheck, visit their scope page, and hit "send intro" — your fields pre-fill from your passport. Takes under a minute.\n\nYour passport link is also worth sharing proactively — in any investor conversation you're already having.`,
    cta: "View your passport →",
  },
};

export default function FounderWelcome({
  name = "Harry",
  companyName = "Carbonade",
  passportUrl = "https://scopecheck.ai/f/carbonade",
  day = 0,
  unsubscribeUrl = "https://scopecheck.ai/unsubscribe",
}: Props) {
  const c = COPY[day];
  return (
    <Html>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={{ backgroundColor: "#0d0d0d", margin: 0, padding: "20px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0d0d0d", fontFamily: "'Courier New', monospace" }}>
          <Section style={{ padding: "16px 24px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#d4286a" }}>&gt; scopecheck.ai</Text>
          </Section>
          <Section style={{ padding: "32px 24px" }}>
            <Text style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#f0a500", margin: "0 0 12px" }}>{c.tag}</Text>
            <Heading style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{c.heading}</Heading>
            <Text style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px" }}>Hi {name},</Text>
            {c.body.split("\n\n").map((para, i) => (
              <Text key={i} style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.8", margin: "0 0 12px" }}>{para}</Text>
            ))}
            <Section style={{ backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)", borderLeft: "3px solid #f0a500", padding: "12px 16px", marginBottom: "20px" }}>
              <Text style={{ margin: 0, fontSize: "12px", color: "#f0a500" }}>{passportUrl}</Text>
            </Section>
            <Link href={passportUrl} style={{ display: "inline-block", backgroundColor: "#f0a500", color: "#000000", fontFamily: "'Courier New', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none" }}>
              {c.cta}
            </Link>
          </Section>
          <Section style={{ padding: "14px 24px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
            <Text style={{ margin: 0, fontSize: "10px", color: "#475569" }}>
              scopecheck.ai · <Link href={unsubscribeUrl} style={{ color: "#475569" }}>unsubscribe from onboarding emails</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
