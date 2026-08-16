import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DbReview = {
  id: string;
  movie_id: string;
  device_id: string;
  rating: number;
  name: string | null;
  comment: string | null;
  created_at: string;
};

const DEVICE_KEY = "cineclube_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async (): Promise<DbReview[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbReview[];
    },
  });
}

export async function submitReview(input: {
  movieId: string;
  rating: number;
  name: string;
  comment: string;
}) {
  const { error } = await supabase.from("reviews").insert({
    movie_id: input.movieId,
    device_id: getDeviceId(),
    rating: input.rating,
    name: input.name.trim() || null,
    comment: input.comment.trim() || null,
  });
  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, message: "Este aparelho já avaliou este filme." };
    }
    return { ok: false as const, message: "Não foi possível enviar. Tente de novo." };
  }
  return { ok: true as const };
}

export function formatReviewDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
    .replace(".", "");
}
