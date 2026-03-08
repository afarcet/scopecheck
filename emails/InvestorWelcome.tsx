import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";

interface Props {
  name: string;
  handle: string;
  scopeUrl: string;
  day: 0 | 2 | 7;
  unsubscribeUrl: string;
}

const COPY = {
  0: {
    preview: "Your investor scope is live.",
    tag: "// day 0 · scope is live",
    heading: "Your scope is live.",
    body: `Share it anywhere founders might reach you — email signature, LinkedIn about section, WhatsApp when someone cold-pitches you. Every founder who clicks it already knows your criteria before they say a word.\n\nNo more repeating what you look for. Structured inbound from day one.`,
    cta: "View your scope →",
    tagColor: "#d4286a",
  },
  2: {
    preview: "One thing that works: add your scope link to LinkedIn.",
    tag: "// day 2 · quick win",
    heading: "The 30-second habit that changes your inbound.",
    body: `The investors getting the most structured deal flow from ScopeCheck do one thing: they add their scope link to their LinkedIn about section and their email signature.\n\nTakes 30 seconds. Means every conversation starts structured — before you've said a word.`,
    cta: "Copy your scope link →",
    tagColor: "#d4286a",
  },
  7: {
    preview: "Nothing in yet? Here's why.",
    tag: "// day 7 · check in",
    heading: "Nothing in yet?",
    body: `You have a scope but no intros yet. That usually means the link hasn't travelled far enough.\n\nTry sharing it the next time someone cold-pitches you — reply with your ScopeCheck link instead of a manual response. The difference is immediate.`,
    cta: "View your scope →",
    tagColor: "#d4286a",
  },
};

export default function InvestorWelcome({
  name = "Alex",
  handle = "raspberry",
  scopeUrl = "https://scopecheck.ai/i/raspberry",
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
            <Text style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: c.tagColor, margin: "0 0 12px" }}>{c.tag}</Text>
            <Heading style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              {c.heading}
            </Heading>
            <Text style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px" }}>Hi {name},</Text>
            {c.body.split("\n\n").map((para, i) => (
              <Text key={i} style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.8", margin: "0 0 12px" }}>{para}</Text>
            ))}
            <Section style={{ backgroundColor: "#111827", border: "1px solid rgba(100,116,139,0.35)", borderLeft: "3px solid #d4286a", padding: "12px 16px", marginBottom: "20px" }}>
              <Text style={{ margin: 0, fontSize: "12px", color: "#d4286a" }}>{scopeUrl}</Text>
            </Section>
            <Link href={scopeUrl} style={{ display: "inline-block", backgroundColor: "#d4286a", color: "#ffffff", fontFamily: "'Courier New', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", padding: "10px 20px", textDecoration: "none" }}>
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
