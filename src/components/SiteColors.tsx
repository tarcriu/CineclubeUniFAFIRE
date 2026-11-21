import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { applySiteColor } from "@/lib/siteColors";

const PRESETS = [
  { label: "Amarelo", color: "#f5c800" },
  { label: "Laranja", color: "#f07a1a" },
  { label: "Roxo", color: "#8a3ffc" },
  { label: "Rosa", color: "#e8458b" },
  { label: "Azul", color: "#2f7de1" },
  { label: "Vermelho", color: "#d93030" },
];

export function useSiteColor() {
  return useQuery({
    queryKey: ["site-theme"],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await (supabase as any)
        .from("site_theme").select("color").eq("id", 1).maybeSingle();
      if (error) throw error;
      return (data?.color as string | null) ?? null;
    },
  });
}

export function useSemesterFinished() {
  return useQuery({
    queryKey: ["semester-finished"],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await (supabase as any)
        .from("site_theme").select("semester_finished").eq("id", 1).maybeSingle();
      if (error) throw error;
      return !!data?.semester_finished;
    },
  });
}

export async function setSemesterFinished(finished: boolean) {
  const { error } = await (supabase as any)
    .from("site_theme")
    .upsert({ id: 1, semester_finished: finished, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Applies the saved color to the whole site. */
export function SiteColorApplier() {
  const { data } = useSiteColor();
  useEffect(() => {
    applySiteColor(data);
  }, [data]);
  return null;
}

export function ColorsDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data } = useSiteColor();
  const [color, setColor] = useState(data ?? "#3fae6a");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applySiteColor(color);
  }, [color]);

  const close = () => {
    applySiteColor(data);
    onClose();
  };

  const save = async (value: string | null) => {
    setBusy(true);
    setError(null);
    const { error } = await (supabase as any)
      .from("site_theme")
      .upsert({ id: 1, color: value, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) return setError("Não foi possível salvar as cores.");
    await qc.invalidateQueries({ queryKey: ["site-theme"] });
    applySiteColor(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={close}>
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={close} aria-label="Fechar" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h3 className="font-display text-2xl italic">Editar cores</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha a cor que vai substituir o verde em todo o site. Você vê a prévia na hora.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.color} type="button" onClick={() => setColor(p.color)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${color === p.color ? "border-primary" : "border-border"}`}>
              <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
              {p.label}
            </button>
          ))}
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm">
          Outra cor:
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border bg-transparent" />
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" disabled={busy} onClick={() => save(color)}
            className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            Salvar cores
          </button>
          <button type="button" disabled={busy} onClick={() => save(null)}
            className="rounded-md border border-border px-5 py-3 text-sm font-medium hover:opacity-80 disabled:opacity-50">
            Restaurar cores originais
          </button>
        </div>
      </div>
    </div>
  );
}
