# ScopeCheck.ai

**The smarter link for deal flow.**

Investors define their criteria once. Founders build their pitch passport once. The infrastructure layer that deal flow has always needed.

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Create a project at [supabase.com](https://supabase.com)
3. Go to Settings → API and copy your URL and anon key
4. Paste them into `.env.local`
5. Run the schema: go to Supabase → SQL Editor → paste contents of `supabase/schema.sql` → Run

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables (same as `.env.local`)
4. Deploy — Vercel auto-detects Next.js
5. Add custom domain `scopecheck.ai` in Vercel → Settings → Domains
6. Update DNS at your registrar to point to Vercel

---

## URL Structure

| Route | Description |
|---|---|
| `/` | Landing page + waitlist |
| `/[handle]` | Investor public profile |
| `/[handle]/apply` | Founder application form |
| `/[handle]/for-llm` | Machine-readable investor criteria |
| `/f/[handle]` | Founder passport |
| `/f/[handle]/for-llm` | Machine-readable founder profile |
| `/dashboard` | Investor kanban (inbound triage) |
| `/join` | Sign up / onboarding |
| `/passport` | Founder profile editor |

---

## Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (database + auth)
- **Tailwind CSS** (styling)
- **Vercel** (hosting)
- **qrcode.react** (QR generation)

---

Built by [Raspberry Ventures](https://raspberry.ventures)
