import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const MEMBER_EMAILS = [
  "cineclube@unifafire.edu.br",
  "dionisio202527808@grad.unifafire.edu.br",
];

export function isMemberEmail(email: string | null | undefined) {
  return MEMBER_EMAILS.includes((email ?? "").trim().toLowerCase());
}

export function useMember() {
  const [email, setEmail] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

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

  const isMember = isMemberEmail(email);

  useEffect(() => {
    if (email && !isMember) {
      setDenied(true);
      void supabase.auth.signOut();
    }
  }, [email, isMember]);

  const clearDenied = () => setDenied(false);

  return { email, isMember, denied, clearDenied };

}

export async function signInAsMember() {
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: `${window.location.origin}/logado`,
  });


  if (result.error) {
    return { ok: false as const, message: "Não foi possível entrar com o Google." };
  }
  if (result.redirected) {
    return { ok: true as const, pending: true as const };
  }

  const { data } = await supabase.auth.getUser();
  const email = (data.user?.email ?? "").toLowerCase();
  if (!isMemberEmail(email)) {
    await supabase.auth.signOut();
    return {
      ok: false as const,
      message: "Acesso negado. Faça seu login com o e-mail institucional.",
    };
  }
  return { ok: true as const };
}


export async function signOutMember() {
  await supabase.auth.signOut();
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false as const, message: "Não foi possível apagar." };
  return { ok: true as const };
}
