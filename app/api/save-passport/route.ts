import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const body = await req.json();
    const {
      founderName,
      founderEmail,
      companyName,
      oneLiner,
      stage,
      sector,
      traction,
      deckUrl,
    } = body;

    if (!founderName || !companyName || !founderEmail) {
      return NextResponse.json(
        { error: "Name, company, and email are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate handle from company name — lowercase, alphanumeric only
    let handle = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Check for handle collision and append suffix if needed
    const { data: existing } = await supabase
      .from("founders")
      .select("handle")
      .eq("handle", handle)
      .single();

    if (existing) {
      // Try with a random 3-char suffix
      const suffix = Math.random().toString(36).substring(2, 5);
      handle = `${handle}${suffix}`;
    }

    // Create the founder / passport record (no user_id — they can claim later)
    const { error: insertError } = await supabase.from("founders").insert({
      handle,
      name: founderName,
      email: founderEmail,
      company_name: companyName,
      one_liner: oneLiner || null,
      stage: stage || null,
      sector: sector || null,
      traction_summary: traction || null,
      deck_url: deckUrl || null,
      status: "active",
    });

    if (insertError) {
      console.error("save-passport insert error:", insertError);
      return NextResponse.json(
        { error: "Could not create passport" },
        { status: 500, headers: corsHeaders }
      );
    }

    const passportUrl = `https://scopecheck.ai/f/${handle}`;
    const unsubscribeUrl = `https://scopecheck.ai/unsubscribe?email=${encodeURIComponent(founderEmail)}`;

    // Send passport-saved email
    await resend.emails.send({
      from: "ScopeCheck <onboarding@resend.dev>",
      to: founderEmail,
      subject: `Your startup passport is live · ${companyName}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0d0d;margin:0;padding:20px 0;font-family:'Courier New',monospace;">
  <div style="max-width:560px;margin:0 auto;background:#0d0d0d;">
    <div style="padding:16px 24px;border-bottom:1px solid rgba(100,116,139,0.2);">
      <span style="font-size:13px;font-weight:700;color:#d4286a;letter-spacing:0.04em;">&gt; scopecheck.ai</span>
    </div>
    <div style="padding:32px 24px;">
      <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#34d399;margin-bottom:12px;">// passport saved ✓</div>
      <h1 style="font-size:22px;font-weight:700;color:#f0f0f0;margin:0 0 8px;letter-spacing:-0.01em;">
        Your passport is live.
      </h1>
      <p style="font-size:12px;color:#94a3b8;margin:0 0 28px;line-height:1.6;">
        ${companyName}'s startup passport has been created. Share this link with any investor — they'll see your details instantly, no forms to fill.
      </p>
      <div style="background:#111827;border:1px solid rgba(100,116,139,0.35);border-left:3px solid #f0a500;padding:16px 20px;margin-bottom:20px;">
        <div style="margin:0 0 4px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">Your passport link</div>
        <a href="${passportUrl}" style="display:block;margin:0 0 12px;font-size:13px;color:#f0a500;text-decoration:none;">${passportUrl}</a>
        <div style="font-size:11px;color:#94a3b8;line-height:1.7;">
          Add it to your LinkedIn, email signature, or drop it in any investor conversation. Never repeat yourself again.
        </div>
      </div>
      <p style="font-size:11px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">
        <strong style="color:#f0f0f0;">Want to edit your passport?</strong> Sign in to ScopeCheck with the same email and you'll be able to update your details, add a data room link, and track views.
      </p>
      <a href="${passportUrl}" style="display:inline-block;background:#f0a500;color:#000;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.06em;padding:10px 20px;text-decoration:none;">
        View your passport →
      </a>
    </div>
    <div style="padding:14px 24px;border-top:1px solid rgba(100,116,139,0.2);">
      <span style="font-size:10px;color:#475569;letter-spacing:0.06em;">
        scopecheck.ai · by raspberry.ventures · <a href="${unsubscribeUrl}" style="color:#475569;">unsubscribe</a>
      </span>
    </div>
  </div>
</body>
</html>`,
    });

    return NextResponse.json(
      { ok: true, handle, passportUrl },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("save-passport error:", err);
    return NextResponse.json(
      { error: "Failed to save passport" },
      { status: 500, headers: corsHeaders }
    );
  }
}
