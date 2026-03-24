"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type UserRole = "investor" | "founder" | "both" | null;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  investorHandle: string | null;
  founderHandle: string | null;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveUser = async (uid: string, email: string, name: string) => {
    const [{ data: inv }, { data: founder }] = await Promise.all([
      supabase.from("investors").select("handle").eq("user_id", uid).maybeSingle(),
      supabase.from("founders").select("handle").eq("user_id", uid).maybeSingle(),
    ]);

    // If no founder record is linked yet, try to claim an unclaimed passport by email
    let claimedFounder = founder;
    if (!founder) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const res = await fetch("/api/claim-passport", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ userId: uid, email }),
          });
          const result = await res.json();
          if (result.claimed) {
            claimedFounder = { handle: result.handle };
          }
        }
      } catch {
        // Silent fail — claiming is best-effort
      }
    }

    const role: UserRole =
      inv && claimedFounder ? "both" : inv ? "investor" : claimedFounder ? "founder" : null;

    setUser({
      id: uid,
      email,
      name,
      role,
      investorHandle: inv?.handle || null,
      founderHandle: claimedFounder?.handle || null,
    });
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        resolveUser(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name || ""
        );
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        resolveUser(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name || ""
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
