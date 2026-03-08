"use client";

import Link from "next/link";

// This will eventually pull from Supabase so Alex can add entries via a simple form
// For now, entries are hardcoded — easiest to update by editing this file
// Format: newest first

const LOG_ENTRIES = [
  {
    id: "021",
    date: "2026-03-08",
    time: "18:00",
    tag: "product",
    title: "The inline apply flow is the killer feature — and it's invisible on the homepage",
    body: `Ended today's session with a clear product question for tomorrow: how do you show that a founder can apply to an investor directly from their scope page?\n\nRight now the homepage explains what the product does, but doesn't demonstrate the moment of value. That moment is: a founder lands on an investor's scope, sees that they match, and hits send — without leaving the page, without signing up first, without a separate application form.\n\nThat's not a feature. That's the product. Everything else — passports, kanban, /for-llm — is infrastructure that makes that moment better over time.\n\nThe homepage currently treats investors and founders symmetrically. The inline apply flow breaks that symmetry in the most useful way: it makes the investor's scope page the acquisition channel for founders. Every scope is a landing page. Every send intro is a founder onboarded.\n\nThe question for Monday: how do you make that visible before someone clicks.`,
    meta: "homepage strategy · inline apply · acquisition mechanic",
  },
  {
    id: "020",
    date: "2026-03-08",
    time: "17:30",
    tag: "build",
    title: "UX polish session: sign out, copy icon, owner view, nav identity",
    body: `A focused session on the logged-in experience:\n\nSign out: added to the homepage nav and both dashboards. Previously you had to clear cookies to switch accounts.\n\nCopy icon: replaced the text-label "copy" button with a Google-style two-stacked-pages SVG icon. Flips to a checkmark (amber) for 2 seconds on click. Clean, no label needed.\n\nOwner view on scope page: when you visit your own /i/handle signed in, you no longer see the "send intro" button. Instead you see your profile URL with a copy icon, plus pipeline and edit scope links. The page now knows if you're the owner.\n\nNav identity: email and sign out are now grouped as a single bordered unit — \`email | sign out\`. Cleaner than having the email floating between two buttons.\n\nEdit scope pre-fills: clicking "edit scope" now loads your existing data into the form. Previously it showed a blank form.`,
    meta: "ux · sign out · copy icon · owner view · nav identity",
  },
  {
    id: "019",
    date: "2026-03-08",
    time: "17:00",
    tag: "build",
    title: "Live example on homepage: real QR, real /for-llm, real scope",
    body: `The example investor card on the homepage was pointing to a static demo. Replaced with the live /i/raspberrysyndicate scope — Alex Farcet / Raspberry Ventures.\n\nThe reasoning: a demo that works is better than a demo that looks like it works. A founder landing on the homepage can now click "send intro" on the example card and actually send an intro. That intro will land in the real kanban. The demo is the product.\n\nAlso replaced the dead QR and /for-llm buttons with live versions. The QR renders the actual URL. The /for-llm link opens the machine-readable criteria page. Both are real infrastructure, not mockups.\n\nSmall copy change in "how it works": removed the line about finding investors on ScopeCheck. Founders share their passport — they don't need to find investors here first. The product works when founders bring the link to investors, not just the other way round.`,
    meta: "homepage · live example · real QR · copy update",
  },
    {
    id: "016",
    date: "2026-03-08",
    time: "15:00",
    tag: "build",
    title: "Inline intro flow: the scope page is now a complete transaction",
    body: `The killer insight from today\'s product session: a founder visiting an investor scope shouldn\'t have to navigate away to apply. The scope page is now a complete transaction.\n\nClick "send intro", a form slides open inline. Investor criteria on one side, your response fields on the other. Hit send — three things happen simultaneously: intro lands in the investor\'s kanban, investor gets notified, and your startup passport is created at scopecheck.ai/f/yourcompany.\n\nYou get the passport link right there to copy and share with the next investor. Fields pre-fill on every subsequent scope you visit.\n\nThe passport isn\'t a prerequisite for applying. It\'s the reward for applying.`,
    meta: "scope page → inline form → passport created as side effect",
  },
  {
    id: "015",
    date: "2026-03-08",
    time: "14:30",
    tag: "product",
    title: "Define once, reach many — the one-to-many reframe",
    body: `A cynical view of the MVP: this is a lot of infrastructure for something you could do with a Google Form.\n\nThe answer: Google Forms can\'t score fit. Can\'t pre-fill fields from a saved passport. Can\'t build match intelligence from structured data over time. The schema is the moat.\n\nBut the more important reframe is the multiplier. A founder doesn\'t send one intro — they send thirty. A good investor scope doesn\'t filter one founder — it filters two hundred. The value is in the one-to-many, on both sides simultaneously.\n\nThis also clarifies the product arc: structured data now → fit scoring next → proactive matching later. Each layer is only possible because the previous one exists.`,
    meta: "product strategy · one-to-many multiplier · three-layer arc",
  },
  {
    id: "014",
    date: "2026-03-08",
    time: "14:00",
    tag: "product",
    title: "Define your scope. Build your passport.",
    body: `Spent time today on language. The original CTAs said \"create investor profile\" and \"create founder passport\" — both used \"create\", which is neutral to the point of saying nothing.\n\nInvestors define. They\'re drawing a boundary around what they look for. It\'s a filtering act.\nFounders build. They\'re assembling a story, putting together something that represents them.\n\nDifferent verbs, different audiences, same rhythm. "Define your scope. Build your passport." That became the new tagline — and it writes the CTAs for free.`,
    meta: "copywriting · define vs build · verbal identity",
  },
  {
    id: "013",
    date: "2026-03-08",
    time: "13:30",
    tag: "build",
    title: "Added /i/ routing for consistency. Kanban cards fixed. Dashboard auth guard.",
    body: `Three things in one build session:\n\n/i/ prefix added for investors (scopecheck.ai/i/handle), mirroring /f/ for founders. Old URLs redirect automatically — no broken links.\n\nKanban cards: the left-border colour accent was disappearing on expand/collapse due to conditional border logic. Fixed to always show the column colour. Also added full bidirectional movement — you can move a startup back from Considering to New if you change your mind.\n\nDashboard auth guard: the kanban was accessible without being signed in. Now redirects to /scope if no active session.`,
    meta: "routing · kanban ux · auth guard",
  },
  {
    id: "012",
    date: "2026-03-08",
    time: "13:00",
    tag: "build",
    title: "Day 2: startup passport, investor scope, and a nav that works on mobile",
    body: `A few naming and navigation fixes from user testing (user #001 = me):\n\n\"Founder passport\" → \"startup passport\". The passport belongs to the startup and its fundraising round, not the individual founder. Subtle but it matters for Series A+ where there are multiple co-founders.\n\n\"Create investor profile\" → \"Define your investor scope\". The button now says what the action actually does.\n\nNav: when signed in, the top nav now shows Dashboard and My Scope links. Previously you had to scroll to section 03 to find your way back in. Obvious in retrospect.\n\nSign out: added to /scope and /passport so you can switch accounts without clearing cookies manually.`,
    meta: "naming · nav · sign out flow",
  },
    {
    id: "011",
    date: "2026-03-08",
    time: "01:30",
    tag: "build",
    title: "OAuth was redirecting to localhost. Fixed.",
    body: `Classic OAuth gotcha. After setting up Google Sign-In, successful auth was bouncing users back to localhost instead of scopecheck.ai.\n\nTwo fixes: set Site URL in Supabase to https://scopecheck.ai, and add it to the allowed redirect URLs. Thirty seconds once you know where to look.\n\nAlso caught a subtler bug — session detection on /scope and /passport was using useState instead of useEffect, so the post-OAuth redirect wasn't being caught. Swapped in useEffect with onAuthStateChange. Clean flow now.`,
    meta: "supabase url config + useEffect fix",
  },
  {
    id: "010",
    date: "2026-03-08",
    time: "01:15",
    tag: "build",
    title: "Google OAuth: 40 minutes of plumbing for one button",
    body: `Proper Google Sign-In requires touching four systems: Google Cloud Console (project, consent screen, OAuth credentials), Supabase (enable provider, paste credentials), DNS (done), and codebase (done).\n\nThe consent screen setup has four steps and asks Internal vs External. External is right — you want any Google account to work, not just raspberry.ventures users.\n\nOne gotcha: the Supabase callback URL must be registered in Google Cloud, otherwise auth silently fails. Worth noting for anyone setting this up.`,
    meta: "google cloud console · supabase auth providers",
  },
  {
    id: "009",
    date: "2026-03-08",
    time: "00:55",
    tag: "product",
    title: "Removed the waitlist. Deliver value immediately.",
    body: `Early version had a waitlist gate — submit your email, wait to be let in. Classic early-stage instinct: control quality, avoid spam.\n\nBut at zero users, that logic is backwards. Every extra step is a reason to leave. The waitlist implied scarcity we didn't have yet.\n\nReplaced both CTAs with direct onboarding: /scope for investors, /passport for founders. No gate. Sign in with Google, fill in your criteria, get your link.\n\nThe word "join" was also wrong for investors. Busy, senior people don't join things. They define their scope. Hence /scope.`,
    meta: "ux decision · removed friction",
  },
  {
    id: "008",
    date: "2026-03-08",
    time: "00:30",
    tag: "build",
    title: "scopecheck.ai is live",
    body: `Deployed. GitHub to Vercel to Cloudflare DNS to SSL certificate generated. The full chain in under an hour.\n\nVercel auto-detects Next.js, pulls from GitHub on every push, redeploys in ~60 seconds. Cloudflare holds the domain — key thing is setting DNS records to proxy-off (grey cloud, not orange) so Vercel handles SSL itself. Orange cloud breaks the SSL handshake.\n\nAt this point profiles are static demo data. The next session makes them data-driven so real users see their own content.`,
    meta: "github · vercel · cloudflare",
  },
  {
    id: "007",
    date: "2026-03-07",
    time: "21:30",
    tag: "design",
    title: "Raspberry > green. Obviously.",
    body: `The first design pass used terminal green — the kind you see on dev tools everywhere. Looked right technically, but felt wrong. Too generic. Then it clicked: I run Raspberry Ventures. Raspberry is literally my favourite fruit. The brand colour was sitting right there the whole time.\n\nSo we switched. Dark background, raspberry #d4286a as primary, warm amber for data highlights. The blinking cursor at the terminal prompt is raspberry-coloured. Small detail, but it makes me smile every time I look at it.`,
    meta: "color: #d4286a → committed",
  },
  {
    id: "006",
    date: "2026-03-07",
    time: "20:15",
    tag: "build",
    title: "The full codebase is scaffolded",
    body: `Phase 0 through Phase 4 is coded and building clean. Next.js app router, Supabase schema ready to run, all routes stubbed:\n\n/[handle] — investor profile with QR\n/[handle]/apply — founder application form\n/[handle]/for-llm — machine readable criteria\n/f/[handle] — founder passport\n/dashboard — investor kanban\n/log — this page\n\nThe kanban triage is satisfying. Thumbs up moves a deal to considering, thumbs down fires a rejection email using the investor's own template. Simple and fast.\n\nStack: Next.js 15 + Supabase + Vercel. No native app — QR display is a full-screen tap on the mobile web page. That's 90% of the value for near-zero build cost.`,
    meta: "npm run build → 0 errors",
  },
  {
    id: "005",
    date: "2026-03-07",
    time: "19:00",
    tag: "product",
    title: "The /for-llm page might be the most important feature nobody will notice",
    body: `Every investor and founder profile auto-generates a plain-text machine-readable version at /for-llm. No HTML, no styling — just clean key: value pairs that any LLM or search crawler can parse without effort.\n\nThis is the AI-native angle made tangible. Right now it's just a page. In two years, it's how AI deal-sourcing agents discover and match investors with founders without anyone filling in a form.\n\nWe build it now because retrofitting AI readability later is always harder. And honestly, the /for-llm link at the bottom of every profile is a small signal that tells the right kind of person: this was built by someone who thinks about where this is going.`,
    meta: "auto-generated alongside every profile",
  },
  {
    id: "004",
    date: "2026-03-07",
    time: "18:30",
    tag: "product",
    title: "QR codes: no app needed",
    body: `Someone asked if this needs a native app. It doesn't — and building one would be a mistake at this stage.\n\nHere's the use case: founder is at a networking event, meets an investor. They want to share their passport instantly. Pulling up scopecheck.ai/f/yourcompany on your phone and tapping "Show QR" fills the screen with a scannable code. The investor's phone camera reads it, lands on the passport page.\n\nThat interaction takes 4 seconds. A native app would take 4 minutes to explain and install.\n\nPWA (installable web app) comes later. For now, mobile-optimised web + a full-screen QR tap is everything the use case needs.`,
    meta: "qrcode.react → full screen on tap",
  },
  {
    id: "003",
    date: "2026-03-07",
    time: "17:45",
    tag: "strategy",
    title: "Why founders first, even though investors pay",
    body: `The honest tension in this product: founders have the most pain (filling in the same info 50 times, applying into black boxes) but they're notoriously hard to monetise. Investors have a real operational pain too but they're slower to adopt new tools.\n\nThe answer: build for founders first because they drive the flywheel. A founder creates their passport, shares scopecheck.ai/f/theircompany with investors, an investor clicks it and thinks "I want one of these for my inbound." That's a product-led growth loop that doesn't require cold sales.\n\nThe "what we're looking for in an investor" field on the founder passport is a deliberate choice. Most tools don't ask founders what they want. That signal — this product respects you — is what makes founders share it enthusiastically.`,
    meta: "founder → investor → founder loop",
  },
  {
    id: "002",
    date: "2026-03-07",
    time: "16:00",
    tag: "insight",
    title: "The bit.ly analogy and why it matters",
    body: `The positioning clicked when I stopped thinking about this as a platform and started thinking about it as a smarter link.\n\nbit.ly shortens URLs. ScopeCheck makes URLs carry structured context. An investor's link isn't just a webpage — it's a machine-readable description of exactly what they're looking for. A founder's link isn't just a profile — it's a portable pitch that pre-fills application forms anywhere.\n\nThis framing changes what you build. You're not building a marketplace. You're building infrastructure. The difference matters for how you talk about it, how you distribute it, and what success looks like in year 3.`,
    meta: "positioning → infrastructure, not platform",
  },
  {
    id: "001",
    date: "2026-03-07",
    time: "14:00",
    tag: "origin",
    title: "Why does every investor rebuild the same front door?",
    body: `I get 20+ founder messages a week. Every single one lands differently — LinkedIn DM, WhatsApp forward, cold email, intro from a mutual connection. There's no structure. No memory. No way to triage efficiently.\n\nMeanwhile I watch founders spend hours crafting cold outreach into black boxes. They don't know if they fit. They don't know if anyone read it. They fill in the same information 50 different times.\n\nThe weird thing: every investor builds the same intake process from scratch. Every syndicate lead has the same "we invest in world-changing founders" page that says nothing. Every solo GP is drowning in WhatsApp deal flow with no infrastructure to handle it.\n\nI already built a manual version of this on my own site — my Scope Check page. Today I bought scopecheck.ai. Let's build it properly.`,
    meta: "domain purchased · project started",
  },
];

const TAG_COLOURS: Record<string, { color: string; bg: string; border: string }> = {
  origin:   { color: "var(--rasp)",   bg: "var(--rasp-dim)",   border: "var(--rasp-border)" },
  product:  { color: "var(--amber)",  bg: "var(--amber-dim)",  border: "var(--amber-border)" },
  build:    { color: "#60a5fa",       bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)" },
  strategy: { color: "#a78bfa",       bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)" },
  design:   { color: "var(--pink)",   bg: "var(--pink-dim)",   border: "var(--pink-border)" },
  insight:  { color: "#34d399",       bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" },
};

export default function LogPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "var(--rasp)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em" }}>&gt; scopecheck.ai</span>
        </Link>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <Link href="/log" style={{ fontSize: "10px", color: "var(--rasp)", letterSpacing: "0.1em", textDecoration: "none" }}>// build log</Link>
          <Link href="/#access" className="btn-primary" style={{ padding: "5px 12px", fontSize: "10px" }}>get access →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Header */}
        <div style={{ padding: "48px 0 32px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "12px" }}>
            // build log
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "14px" }}>
            Building ScopeCheck<br />
            <span style={{ color: "var(--rasp)" }}>in public.</span>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--white-mid)", lineHeight: 1.8, maxWidth: "480px", marginBottom: "20px" }}>
            Every decision, insight, and mistake — logged as it happens. This is what it looks like to build a product from scratch with AI, in 2026, as a non-technical founder.
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a href="https://www.linkedin.com/in/alexfarcet/" target="_blank" rel="noopener" className="btn-secondary" style={{ fontSize: "10px", padding: "5px 12px" }}>
              follow on LinkedIn ↗
            </a>
            <Link href="/" className="btn-secondary" style={{ fontSize: "10px", padding: "5px 12px" }}>
              ← back to scopecheck
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", marginBottom: "40px" }}>
          {[
            { label: "days building", value: "2" },
            { label: "log entries",   value: LOG_ENTRIES.length.toString() },
            { label: "lines of code", value: "~1.2K" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg2)", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white-dim)", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--rasp)", letterSpacing: "-0.02em" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tag filter hint */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "28px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.08em" }}>tags:</span>
          {Object.entries(TAG_COLOURS).map(([tag, style]) => (
            <span key={tag} style={{ fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px", border: `1px solid ${style.border}`, color: style.color, background: style.bg }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Log entries */}
        <div style={{ position: "relative" }}>

          {/* Timeline line */}
          <div style={{ position: "absolute", left: "11px", top: 0, bottom: 0, width: "1px", background: "var(--border)" }} />

          {LOG_ENTRIES.map((entry, i) => {
            const tagStyle = TAG_COLOURS[entry.tag] || TAG_COLOURS.insight;
            return (
              <div key={entry.id} style={{ display: "flex", gap: "20px", marginBottom: "40px", position: "relative" }}>

                {/* Timeline dot */}
                <div style={{ flexShrink: 0, width: "24px", paddingTop: "2px", zIndex: 1 }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: `2px solid ${tagStyle.color}`, background: "var(--bg)", marginLeft: "7px" }} />
                </div>

                {/* Entry */}
                <div style={{ flex: 1, paddingBottom: "8px" }}>

                  {/* Meta row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" }}>
                      {entry.date} {entry.time}
                    </span>
                    <span style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "1px 6px", border: `1px solid ${tagStyle.border}`, color: tagStyle.color, background: tagStyle.bg }}>
                      {entry.tag}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--white-dimmer)", letterSpacing: "0.04em" }}>
                      #{entry.id}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                    {entry.title}
                  </h2>

                  {/* Body */}
                  <div style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.85, marginBottom: "12px" }}>
                    {entry.body.split("\n\n").map((para, j) => (
                      <p key={j} style={{ marginBottom: "10px" }}>
                        {para.split("\n").map((line, k) => (
                          <span key={k}>
                            {line.startsWith("/") || line.startsWith("→") ? (
                              <span style={{ color: "var(--rasp)", fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>{line}</span>
                            ) : line}
                            {k < para.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>

                  {/* Meta tag */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg3)", border: "1px solid var(--border2)", padding: "4px 10px", fontSize: "10px", color: "var(--white-dim)", letterSpacing: "0.06em" }}>
                    <span style={{ color: tagStyle.color }}>▸</span>
                    {entry.meta}
                  </div>

                </div>
              </div>
            );
          })}

          {/* End of log */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flexShrink: 0, width: "24px" }}>
              <div style={{ width: "10px", height: "10px", background: "var(--border2)", marginLeft: "7px" }} />
            </div>
            <div style={{ paddingTop: "2px" }}>
              <span style={{ fontSize: "11px", color: "var(--white-dimmer)", letterSpacing: "0.08em" }}>
                // more entries coming · building daily
              </span>
              <span style={{ display: "inline-block", width: "7px", height: "12px", background: "var(--rasp)", animation: "blink 1.1s step-end infinite", verticalAlign: "middle", marginLeft: "4px" }} />
            </div>
          </div>

        </div>

        {/* Follow CTA */}
        <div style={{ marginTop: "48px", background: "var(--bg2)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--rasp)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--rasp)", marginBottom: "4px" }}>// follow the build</div>
            <p style={{ fontSize: "12px", color: "var(--white-mid)", lineHeight: 1.6 }}>
              I post about this on LinkedIn — product decisions, AI learnings, what&apos;s working and what isn&apos;t.
            </p>
          </div>
          <a href="https://www.linkedin.com/in/alexfarcet/" target="_blank" rel="noopener" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
            follow on LinkedIn →
          </a>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "720px", margin: "0 auto" }}>
        <span style={{ fontSize: "11px", color: "var(--white-mid)" }}>
          scopecheck.ai · built by <a href="https://alexfarcet.com" target="_blank" rel="noopener" style={{ color: "var(--rasp)", textDecoration: "none" }}>Alex Farcet</a>
        </span>
        <span style={{ fontSize: "10px", color: "var(--white-dim)" }}>// built in public with AI · 2026</span>
      </footer>

    </main>
  );
}
