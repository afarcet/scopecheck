import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import InvestorNotification from "@/emails/InvestorNotification";
import FounderConfirmation from "@/emails/FounderConfirmation";
import { computeScopeSignal, signalLabel, signalExplanation } from "@/lib/scoring";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  // Instantiate clients inside handler Ã¢ÂÂ avoids build-time env var errors
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const body = await req.json();
    const {
      investorHandle,
      founderName,
      companyName,
      oneLiner,
      stage,
      sector,
      sectors,
      country,
      minTicket,
      founderBackground,
      linkedinUrl,
      hasLead,
      leadDetails,
      traction,
      deckUrl,
      passportHandle,
      founderEmail,
      customAnswers,
    cofounderCount,
    cofounderHistory,
    priorFounder,
    priorExit,
    domainExperience,
    } = body;

    // Fetch investor details
    const { data: investor } = await supabase
      .from("investors")
      .select("name, email, firm")
      .eq("handle", investorHandle)
      .single();

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404, headers: corsHeaders });
    }

    // Persist intro to Supabase Ã¢ÂÂ this is the durable record of every inbound
    await supabase.from("intros").insert({
      investor_handle: investorHandle,
      founder_handle:  passportHandle,
      founder_name:    founderName,
      founder_email:   founderEmail ?? null,
      company_name:    companyName,
      one_liner:       oneLiner,
      stage:           stage ?? null,
      sector:          sector ?? null,
      sectors:         sectors ?? null,
      country:         country ?? null,
      min_ticket:      minTicket ?? null,
      founder_background: founderBackground ?? null,
      linkedin_url:    linkedinUrl ?? null,
      has_lead:        hasLead ?? null,
      lead_details:    leadDetails ?? null,
      traction:        traction ?? null,
      deck_url:        deckUrl ?? null,
      custom_answers:  customAnswers ?? null,
      cofounder_count: cofounderCount ?? null,
      cofounder_history: cofounderHistory ?? null,
      prior_founder: priorFounder ?? null,
      prior_exit: priorExit ?? null,
      domain_experience: domainExperience ?? null,
      status:          "new",
    });

    const passportUrl    = `https://scopecheck.ai/f/${passportHandle}`;
    const dashboardUrl   = "https://scopecheck.ai/dashboard";
    const unsubscribeUrl = `https://scopecheck.ai/unsubscribe?email=${encodeURIComponent(investor.email)}`;

    // Email 1: Notify investor
    const investorHtml = await render(
      InvestorNotification({
        investorName: investor.name.split(" ")[0],
        founderName,
        companyName,
        oneLiner,
        stage,
        sector,
        traction,
        deckUrl,
        founderEmail,
        passportUrl,
        dashboardUrl,
        unsubscribeUrl,
      cofounderCount: cofounderCount ?? undefined,
      cofounderHistory: cofounderHistory ?? undefined,
      priorFounder: priorFounder ?? undefined,
      priorExit: priorExit ?? undefined,
      domainExperience: domainExperience ?? undefined,
      })
    );

    await resend.emails.send({
      from:    "ScopeCheck <onboarding@resend.dev>",
      to:      investor.email,
      ...(founderEmail ? { replyTo: founderEmail } : {}),
      subject: `New intro: ${companyName} Ã¢ÂÂ ${oneLiner.slice(0, 60)}${oneLiner.length > 60 ? "..." : ""}`,
      html:    investorHtml,
    });

    // Email 2: Confirm to founder
    if (founderEmail) {
      const founderHtml = await render(
        FounderConfirmation({
          founderName:  founderName.split(" ")[0],
          companyName,
          investorName: investor.name,
          investorFirm: investor.firm || undefined,
          passportUrl,
          unsubscribeUrl: `https://scopecheck.ai/unsubscribe?email=${encodeURIComponent(founderEmail)}`,
        })
      );

      await resend.emails.send({
        from:    "ScopeCheck <onboarding@resend.dev>",
        to:      founderEmail,
        subject: `Intro sent to ${investor.name} ÃÂ· Your passport is ready`,
        html:    founderHtml,
      });
    }

    // Compute scope signal for founder feedback
    const scopeResult = computeScopeSignal({
      stage,
      sector,
      geography: country,
      roundSize: minTicket ? parseFloat(minTicket) : undefined,
      cofounderCount,
      priorFounder: priorFounder === true || priorFounder === "true",
      priorExit: priorExit === true || priorExit === "true",
      domainExperience: domainExperience || undefined,
    });

    return NextResponse.json({
      ok: true,
      scopeSignal: scopeResult.signal,
      scopeLabel: signalLabel(scopeResult.signal),
      scopeExplanation: signalExplanation(scopeResult.signal),
    }, { headers: corsHeaders });
  } catch (err) {
    console.error("send-intro error:", err);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500, headers: corsHeaders });
  }
}
