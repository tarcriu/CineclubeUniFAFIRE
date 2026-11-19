import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DbReview = {
  id: string;
  movie_id: string;
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
      const { data, error } = await (supabase as any)
        .from("reviews_public")
        .select("id,movie_id,rating,name,comment,created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbReview[];
    },
  });
}

export function useHasReviewed(movieId: string, deviceId: string) {
  return useQuery({
    queryKey: ["has-reviewed", movieId, deviceId],
    enabled: Boolean(deviceId),
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await (supabase as any).rpc("has_reviewed", {
        _movie_id: movieId,
        _device_id: deviceId,
      });
      if (error) throw error;
      return Boolean(data);
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

export function useReviewLikes() {
  const deviceId = getDeviceId();
  return useQuery({
    queryKey: ["review-likes", deviceId],
    queryFn: async () => {
      const sb = supabase as any;
      const [counts, mine] = await Promise.all([
        sb.rpc("review_like_counts"),
        deviceId ? sb.rpc("my_liked_reviews", { _device_id: deviceId }) : { data: [] },
      ]);
      if (counts.error) throw counts.error;
      const map: Record<string, number> = {};
      for (const r of counts.data ?? []) map[r.review_id] = Number(r.likes);
      const liked = new Set<string>(((mine.data ?? []) as any[]).map((x) => (typeof x === "string" ? x : x.my_liked_reviews)));
      return { counts: map, liked };
    },
  });
}

export async function toggleReviewLike(reviewId: string) {
  const { error } = await (supabase as any).rpc("toggle_review_like", {
    _review_id: reviewId,
    _device_id: getDeviceId(),
  });
  return !error;
}
