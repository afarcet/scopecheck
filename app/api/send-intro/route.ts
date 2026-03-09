import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import InvestorNotification from "@/emails/InvestorNotification";
import FounderConfirmation from "@/emails/FounderConfirmation";

export async function POST(req: NextRequest) {
  // Instantiate clients inside handler — avoids build-time env var errors
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
      traction,
      deckUrl,
      passportHandle,
      founderEmail,
    } = body;

    // Fetch investor details
    const { data: investor } = await supabase
      .from("investors")
      .select("name, email, firm")
      .eq("handle", investorHandle)
      .single();

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    // Persist intro to Supabase — this is the durable record of every inbound
    await supabase.from("intros").insert({
      investor_handle: investorHandle,
      founder_handle:  passportHandle,
      founder_name:    founderName,
      founder_email:   founderEmail ?? null,
      company_name:    companyName,
      one_liner:       oneLiner,
      stage:           stage ?? null,
      sector:          sector ?? null,
      traction:        traction ?? null,
      deck_url:        deckUrl ?? null,
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
        passportUrl,
        dashboardUrl,
        unsubscribeUrl,
      })
    );

    await resend.emails.send({
      from:    "ScopeCheck <notifications@scopecheck.ai>",
      to:      investor.email,
      subject: `New intro: ${companyName} — ${oneLiner.slice(0, 60)}${oneLiner.length > 60 ? "..." : ""}`,
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
        from:    "ScopeCheck <notifications@scopecheck.ai>",
        to:      founderEmail,
        subject: `Intro sent to ${investor.name} · Your passport is ready`,
        html:    founderHtml,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-intro error:", err);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
