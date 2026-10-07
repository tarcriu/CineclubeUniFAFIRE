import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SiteQr = { link: string | null; image_url: string | null; visible: boolean };

export function useSiteQr() {
  return useQuery({
    queryKey: ["site-qr"],
    queryFn: async (): Promise<SiteQr | null> => {
      const { data, error } = await (supabase as any)
        .from("site_qr")
        .select("link,image_url,visible")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data as SiteQr | null;
    },
  });
}

async function saveQr(values: Partial<SiteQr>) {
  const { error } = await (supabase as any)
    .from("site_qr")
    .upsert({ id: 1, ...values, updated_at: new Date().toISOString() });
  if (error) throw error;
}

function useGeneratedImage(qr: SiteQr | null | undefined) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!qr) return setSrc(null);
    if (qr.image_url) return setSrc(qr.image_url);
    if (qr.link) {
      QRCode.toDataURL(qr.link, { width: 400, margin: 1 }).then(setSrc).catch(() => setSrc(null));
    } else setSrc(null);
  }, [qr?.image_url, qr?.link]);
  return src;
}

function safeHref(link: string | null) {
  if (!link) return undefined;
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

export function PublicQr() {
  const { data: qr } = useSiteQr();
  const src = useGeneratedImage(qr);
  if (!qr?.visible || !src) return null;
  const href = safeHref(qr.link);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
    >
      <img src={src} alt="Código QR" className="h-40 w-40 rounded-md bg-white p-2" />
      <span className="text-sm text-muted-foreground">escaneie ou clique</span>
    </a>
  );
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function QrDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: qr } = useSiteQr();
  const src = useGeneratedImage(qr);
  const [mode, setMode] = useState<"menu" | "choose" | "confirmDelete">("menu");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLink(qr?.link ?? "");
  }, [qr?.link]);

  async function run(values: Partial<SiteQr>) {
    setBusy(true);
    setError(null);
    try {
      await saveQr(values);
      await queryClient.invalidateQueries({ queryKey: ["site-qr"] });
      setMode("menu");
    } catch {
      setError("Não foi possível salvar.");
    }
    setBusy(false);
  }

  const btn =
    "w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60";
  const outline =
    "w-full rounded-md border border-border px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[420px] overflow-y-auto rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-display text-2xl italic">Código QR</h4>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted-foreground hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>

        {src && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <img src={src} alt="Código QR" className="h-32 w-32 rounded-md bg-white p-2" />
            <span className="text-[12px] text-muted-foreground">
              {qr?.visible ? "Exibido no site" : "Não exibido"}
            </span>
          </div>
        )}

        {mode === "menu" && (
          <div className="mt-6 space-y-3">
            <button type="button" className={btn} onClick={() => setMode("choose")}>
              Escolher Código QR
            </button>
            <button
              type="button"
              className={outline}
              disabled={busy || !src}
              onClick={() => void run({ visible: true })}
            >
              Exibir QR Code
            </button>
            <button
              type="button"
              disabled={busy || !qr?.visible}
              onClick={() => setMode("confirmDelete")}
              className="w-full rounded-md bg-destructive px-5 py-3 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Excluir QR Code
            </button>
          </div>
        )}

        {mode === "choose" && (
          <div className="mt-6 space-y-3">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link do código"
              className="h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm outline-none focus:border-primary/60"
            />
            <label className="block text-[12px] text-muted-foreground">
              Imagem do código (opcional — sem imagem, o código é gerado pelo link)
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  setImage(f ? await readFile(f) : null);
                }}
              />
            </label>
            <button
              type="button"
              className={btn}
              disabled={busy || !link.trim()}
              onClick={() => void run({ link: link.trim(), image_url: image })}
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className={outline} onClick={() => setMode("menu")}>
              Voltar
            </button>
          </div>
        )}

        {mode === "confirmDelete" && (
          <div className="mt-6 space-y-3">
            <p className="text-sm">Tirar o código QR do site para todos?</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run({ visible: false })}
              className="w-full rounded-md bg-destructive px-5 py-3 text-sm font-medium text-destructive-foreground hover:opacity-90"
            >
              Excluir
            </button>
            <button type="button" className={outline} onClick={() => setMode("menu")}>
              Cancelar
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
