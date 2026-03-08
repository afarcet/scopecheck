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

    const role: UserRole =
      inv && founder ? "both" : inv ? "investor" : founder ? "founder" : null;

    setUser({
      id: uid,
      email,
      name,
      role,
      investorHandle: inv?.handle || null,
      founderHandle: founder?.handle || null,
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
