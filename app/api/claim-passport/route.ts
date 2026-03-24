import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Claims an unclaimed founder/passport record by matching on email.
 * Called client-side after login when no founder record is linked to
 * the authenticated user_id but one exists with a matching email and
 * user_id = null (i.e. created via the embed "save passport" flow).
 *
 * Requires the authenticated user's JWT in the Authorization header
 * so we can verify identity server-side before updating the record.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    // Verify the caller's JWT matches the claimed userId
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find unclaimed founder record matching this email
    const { data: unclaimed } = await supabase
      .from("founders")
      .select("id, handle")
      .eq("email", email)
      .is("user_id", null)
      .limit(1)
      .maybeSingle();

    if (!unclaimed) {
      return NextResponse.json({ claimed: false, message: "No unclaimed passport found" });
    }

    // Claim it — set user_id to the authenticated user
    const { error: updateError } = await supabase
      .from("founders")
      .update({ user_id: userId })
      .eq("id", unclaimed.id);

    if (updateError) {
      console.error("claim-passport update error:", updateError);
      return NextResponse.json({ error: "Failed to claim passport" }, { status: 500 });
    }

    return NextResponse.json({ claimed: true, handle: unclaimed.handle });
  } catch (err) {
    console.error("claim-passport error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
