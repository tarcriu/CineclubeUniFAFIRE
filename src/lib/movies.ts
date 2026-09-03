import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Movie = {
  id: string;
  title: string;
  director: string;
  year: number | null;
  synopsis: string | null;
  image_url: string | null;
  session_date: string;
};

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function parts(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map((n) => Number(n));
  return { y: y ?? 0, m: m ?? 1, d: d ?? 1 };
}

export function formatSessionDate(isoDate: string) {
  const { y, m, d } = parts(isoDate);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

export function monthKey(isoDate: string) {
  const { y, m } = parts(isoDate);
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function formatMonthLabel(isoDate: string) {
  const { y, m } = parts(isoDate);
  return `${(MONTHS[m - 1] ?? "").toUpperCase()} ${y}`;
}

export function yearOf(isoDate: string) {
  return String(parts(isoDate).y);
}

export function credits(movie: Movie) {
  return movie.year ? `${movie.director} · ${movie.year}` : movie.director;
}

export function useMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async (): Promise<Movie[]> => {
      const { data, error } = await (supabase as any)
        .from("movies")
        .select("id,title,director,year,synopsis,image_url,session_date")
        .order("session_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Movie[];
    },
  });
}

export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "filme"
  );
}

export async function addMovie(input: {
  title: string;
  director: string;
  year: number | null;
  synopsis: string;
  imageUrl: string;
  sessionDate: string;
}) {
  const id = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const { error } = await (supabase as any).from("movies").insert({
    id,
    title: input.title.trim(),
    director: input.director.trim(),
    year: input.year,
    synopsis: input.synopsis.trim() || null,
    image_url: input.imageUrl.trim() || null,
    session_date: input.sessionDate,
  });
  if (error) {
    return { ok: false as const, message: "Não foi possível adicionar o filme." };
  }
  return { ok: true as const };
}

export async function deleteMovie(id: string) {
  const { error } = await (supabase as any).from("movies").delete().eq("id", id);
  if (error) return { ok: false as const, message: "Não foi possível excluir o filme." };
  return { ok: true as const };
}

/** Reads an image file and returns a compressed data URL (max 1280px wide). */
export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-error"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image-error"));
      img.onload = () => {
        const maxW = 1280;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas-error"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
