import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const MEMBER_EMAIL = "cineclube@unifafire.edu.br";

export function useMember() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isMember = (email ?? "").toLowerCase() === MEMBER_EMAIL;
  return { email, isMember };
}

export async function signInAsMember() {
  await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
}

export async function signOutMember() {
  await supabase.auth.signOut();
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false as const, message: "Não foi possível apagar." };
  return { ok: true as const };
}
