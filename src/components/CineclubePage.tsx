import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Star, Trash2, X } from "lucide-react";
import { StarsDisplay, StarsInput } from "@/components/Stars";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  formatReviewDate,
  getDeviceId,
  submitReview,
  useHasReviewed,
  useReviews,
  type DbReview,
} from "@/lib/reviews";
import {
  addMovie,
  credits,
  deleteMovie,
  fileToCompressedDataUrl,
  formatMonthLabel,
  formatSessionDate,
  monthKey,
  updateMovie,
  useMovies,
  yearOf,
  type Movie,
} from "@/lib/movies";

import { deleteReview, signInAsMember, signOutMember, useMember } from "@/lib/member";

import cineclubeLogo from "@/assets/cineclube-logo.png.asset.json";
import unifafireLogo from "@/assets/unifafire.png.asset.json";
import cineclubeLogoGreen from "@/assets/cineclube-logo-green.png.asset.json";
import unifafireLogoGreen from "@/assets/unifafire-green.png.asset.json";
import instagramGray from "@/assets/instagram-gray.png.asset.json";
import instagramGreen from "@/assets/instagram-green.png.asset.json";

type Review = { id?: string; name?: string; rating: number; comment?: string; date: string };

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-lg border border-border bg-card p-6"
      >
        <h4 className="font-display text-2xl italic">{title}</h4>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-[13px] text-muted-foreground underline-offset-4 hover:underline"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Excluindo..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteMovieButton({ movie }: { movie: Movie }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await deleteMovie(movie.id);
    await queryClient.invalidateQueries({ queryKey: ["movies"] });
    setBusy(false);
    setConfirming(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
      >
        Excluir filme
      </button>
      {confirming && (
        <ConfirmDialog
          title="Excluir filme"
          message={`Tem certeza que deseja excluir “${movie.title}”? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir filme"
          busy={busy}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

function SessionCard({ session, memberMode }: { session: Movie; memberMode: boolean }) {

  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => setDeviceId(getDeviceId()), []);

  const { data: hasReviewed } = useHasReviewed(session.id, deviceId);
  const done = Boolean(hasReviewed);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating <= 0) {
      setError("Escolha uma nota.");
      return;
    }
    setSending(true);
    const result = await submitReview({ movieId: session.id, rating, name, comment });
    setSending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setRating(0);
    setName("");
    setComment("");
    await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    await queryClient.invalidateQueries({ queryKey: ["has-reviewed", session.id, deviceId] });
  }

  return (
    <div>
      <article className="overflow-hidden rounded-lg border border-border bg-card">
        {session.image_url && (
          <div className="relative">
            <img
              src={session.image_url}
              alt={session.title}
              className="h-[380px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/45 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-[11px] tracking-[0.18em] text-foreground/80">
                {formatSessionDate(session.session_date).toUpperCase()}
              </p>
              <h3 className="mt-1 font-display text-4xl italic">{session.title}</h3>
              <p className="mt-1 text-sm text-foreground/75">{credits(session)}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          {!session.image_url && (
            <div className="mb-4">
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground">
                {formatSessionDate(session.session_date).toUpperCase()}
              </p>
              <h3 className="mt-1 font-display text-4xl italic">{session.title}</h3>
              <p className="mt-1 text-sm text-foreground/75">{credits(session)}</p>
            </div>
          )}

          {session.synopsis && (
            <p className="w-full text-justify text-[15px] leading-relaxed text-foreground/85">
              {session.synopsis}
            </p>
          )}

          {done ? (
            <p className="mt-6 rounded-md bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
              Você já avaliou este filme neste aparelho.
            </p>
          ) : (
            <form className="mt-6" onSubmit={handleSubmit}>
              <p className="text-[11px] tracking-[0.12em] text-muted-foreground">
                SUA NOTA <span className="text-primary">*</span>
              </p>
              <div className="mt-2">
                <StarsInput value={rating} onChange={setRating} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`nome-${session.id}`}
                    className="text-[11px] tracking-[0.12em] text-muted-foreground"
                  >
                    NOME <span className="text-muted-foreground/70">(OPCIONAL)</span>
                  </label>
                  <input
                    id={`nome-${session.id}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-2 h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`comentario-${session.id}`}
                    className="text-[11px] tracking-[0.12em] text-muted-foreground"
                  >
                    COMENTÁRIO <span className="text-muted-foreground/70">(OPCIONAL)</span>
                  </label>
                  <textarea
                    id={`comentario-${session.id}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="O que você achou?"
                    className="mt-2 h-[72px] w-full resize-none rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="mt-6 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "Enviando..." : "Enviar avaliação"}
              </button>
            </form>
          )}
        </div>
      </article>

      {memberMode && (
        <div className="mt-3">
          <DeleteMovieButton movie={session} />
        </div>
      )}
    </div>
  );
}

function RateDialog({
  movieId,
  title,
  onClose,
}: {
  movieId: string;
  title: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating <= 0) {
      setError("Escolha uma nota.");
      return;
    }
    setSending(true);
    const result = await submitReview({ movieId, rating, name, comment });
    setSending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    await queryClient.invalidateQueries({ queryKey: ["has-reviewed", movieId] });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-display text-2xl italic">{title}</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground transition-opacity hover:opacity-70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-5" onSubmit={handleSubmit}>
          <p className="text-[11px] tracking-[0.12em] text-muted-foreground">
            SUA NOTA <span className="text-primary">*</span>
          </p>
          <div className="mt-2">
            <StarsInput value={rating} onChange={setRating} />
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <label
                htmlFor={`acervo-nome-${movieId}`}
                className="text-[11px] tracking-[0.12em] text-muted-foreground"
              >
                NOME <span className="text-muted-foreground/70">(OPCIONAL)</span>
              </label>
              <input
                id={`acervo-nome-${movieId}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="mt-2 h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
              />
            </div>
            <div>
              <label
                htmlFor={`acervo-comentario-${movieId}`}
                className="text-[11px] tracking-[0.12em] text-muted-foreground"
              >
                COMENTÁRIO <span className="text-muted-foreground/70">(OPCIONAL)</span>
              </label>
              <textarea
                id={`acervo-comentario-${movieId}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="O que você achou?"
                className="mt-2 h-[72px] w-full resize-none rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={sending}
            className="mt-6 w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddMovieDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setImageUrl(await fileToCompressedDataUrl(file));
    } catch {
      setError("Não foi possível ler a imagem.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !director.trim() || !sessionDate) {
      setError("Preencha nome, diretor e data da sessão.");
      return;
    }
    setSaving(true);
    const result = await addMovie({
      title,
      director,
      year: year.trim() ? Number(year) : null,
      synopsis,
      imageUrl,
      sessionDate,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["movies"] });
    onClose();
  }

  const field =
    "mt-2 h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60";
  const label = "text-[11px] tracking-[0.12em] text-muted-foreground";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-display text-2xl italic">Adicionar filme</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground transition-opacity hover:opacity-70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="filme-nome" className={label}>
              NOME DO FILME <span className="text-primary">*</span>
            </label>
            <input
              id="filme-nome"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={field}
              placeholder="Nome do filme"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="filme-diretor" className={label}>
                DIRETOR <span className="text-primary">*</span>
              </label>
              <input
                id="filme-diretor"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className={field}
                placeholder="Nome do diretor"
              />
            </div>
            <div>
              <label htmlFor="filme-ano" className={label}>
                ANO DE LANÇAMENTO
              </label>
              <input
                id="filme-ano"
                value={year}
                inputMode="numeric"
                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={field}
                placeholder="2026"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filme-data" className={label}>
              DATA DA SESSÃO <span className="text-primary">*</span>
            </label>
            <input
              id="filme-data"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="filme-sinopse" className={label}>
              SINOPSE
            </label>
            <textarea
              id="filme-sinopse"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Sinopse do filme"
              className="mt-2 h-[110px] w-full resize-none rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
            />
          </div>

          <div>
            <label htmlFor="filme-imagem" className={label}>
              IMAGEM
            </label>
            <input
              id="filme-imagem"
              type="file"
              accept="image/*"
              onChange={(e) => void handleFile(e.target.files?.[0])}
              className="mt-2 w-full rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-accent-foreground"
            />
            <input
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="ou cole o link de uma imagem"
              className={field}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Prévia"
                className="mt-3 h-40 w-full rounded-md object-cover"
              />
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Adicionar filme"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MemberLoginDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);
    const result = await signInAsMember();
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
    void navigate({ to: "/logado" });
  }


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-display text-2xl italic">Membro do cineclube</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground transition-opacity hover:opacity-70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Entre com a conta cineclube@unifafire.edu.br.
        </p>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleLogin()}
          className="mt-6 w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar com o Google"}
        </button>
      </div>
    </div>
  );
}

function AccessDeniedDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-lg border border-border bg-card p-6 text-center"
      >
        <h4 className="font-display text-2xl italic">Acesso negado</h4>
        <p className="mt-4 text-sm text-muted-foreground">
          Seu acesso foi negado, você não está usando o e-mail do cineclube.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

function AcervoRow({
  item,
  dbReviews,
  memberMode,
}: {
  item: Movie;
  dbReviews: DbReview[];
  memberMode: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  useEffect(() => setDeviceId(getDeviceId()), []);
  const { data: hasReviewed } = useHasReviewed(item.id, deviceId);
  const queryClient = useQueryClient();

  const reviews: Review[] = dbReviews
    .filter((r) => r.movie_id === item.id)
    .map((r) => ({
      id: r.id,
      ...(r.name ? { name: r.name } : {}),
      rating: Number(r.rating),
      ...(r.comment ? { comment: r.comment } : {}),
      date: formatReviewDate(r.created_at),
    }));

  const rating =
    reviews.length === 0
      ? null
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <div>
          <h4 className="font-display text-xl italic">
            {item.title}
            <span className="ml-2 hidden font-sans text-[13px] not-italic text-muted-foreground sm:inline">
              {credits(item)}
            </span>
          </h4>
          <p className="mt-0.5 text-[13px] text-muted-foreground sm:hidden">{credits(item)}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {formatSessionDate(item.session_date)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {rating !== null && (
            <>
              <StarsDisplay value={rating} />
              <span className="text-sm text-foreground/90">{rating.toFixed(1)}</span>
            </>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="pb-6">
          <div className="mb-4 flex justify-start">
            {hasReviewed ? (
              <span className="text-[13px] text-muted-foreground">
                Você já avaliou este filme neste aparelho.
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setRateOpen(true)}
                className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Avaliar
              </button>
            )}
          </div>
          {rateOpen && (
            <RateDialog movieId={item.id} title={item.title} onClose={() => setRateOpen(false)} />
          )}

          {reviews.length === 0 ? (
            <p className="pb-2 text-[13px] text-muted-foreground">Nenhuma avaliação ainda.</p>
          ) : (
            <>
              <div className="rounded-md bg-secondary/50 px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                  <span className="text-[13px] text-muted-foreground">
                    {reviews.length} {reviews.length === 1 ? "voto" : "votos"}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = reviews.filter((r) => Math.round(r.rating) === n).length;
                      const pct = (count / reviews.length) * 100;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <span className="text-[13px] text-muted-foreground">{n}</span>
                          <div className="flex gap-[2px]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                style={{ width: 11, height: 11 }}
                                className={
                                  s <= n
                                    ? "fill-primary text-transparent"
                                    : "fill-muted-foreground/25 text-transparent"
                                }
                              />
                            ))}
                          </div>
                          <span className="h-[6px] w-[110px] overflow-hidden rounded-full bg-muted-foreground/20">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                          <span className="text-[13px] text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-4">
                {reviews
                  .filter((r) => r.name?.trim() || r.comment?.trim())
                  .map((r, i) => {
                    const name = r.name?.trim() || "Anônimo";
                    return (
                      <li key={r.id ?? i} className="flex gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] text-muted-foreground">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-sm text-foreground/90">{name}</span>
                            <StarsDisplay value={r.rating} size={12} />
                            <span className="ml-auto text-[12px] text-muted-foreground">
                              {r.date}
                            </span>
                            {memberMode && r.id && (
                              <button
                                type="button"
                                aria-label="Apagar comentário"
                                disabled={deletingId === r.id}
                                onClick={async () => {
                                  setDeletingId(r.id!);
                                  await deleteReview(r.id!);
                                  await queryClient.invalidateQueries({ queryKey: ["reviews"] });
                                  setDeletingId(null);
                                }}
                                className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {r.comment && (
                            <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                              {r.comment}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </>
          )}

          {memberMode && (
            <div className="pt-2">
              <DeleteMovieButton movie={item} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CineclubePage({ memberPage = false }: { memberPage?: boolean }) {
  const navigate = useNavigate();
  const { data: dbReviews = [] } = useReviews();
  const { data: movies = [] } = useMovies();
  const { isMember, denied, clearDenied } = useMember();
  const [openYears, setOpenYears] = useState<Set<string>>(new Set());
  const [frutigerAero, setFrutigerAero] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const memberMode = memberPage && isMember;

  useEffect(() => {
    const stored = window.localStorage.getItem("frutiger-aero");
    setFrutigerAero(stored === "true");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("frutiger-aero", frutigerAero);
  }, [frutigerAero]);

  const toggleFrutigerAero = () => {
    const next = !frutigerAero;
    setFrutigerAero(next);
    window.localStorage.setItem("frutiger-aero", String(next));
  };

  const currentMonth = movies[0] ? monthKey(movies[0].session_date) : null;
  const sessions = currentMonth
    ? movies.filter((m) => monthKey(m.session_date) === currentMonth)
    : [];
  const monthLabel = movies[0] ? formatMonthLabel(movies[0].session_date) : "";

  const acervoByYear = useMemo(() => {
    const groups: Record<string, Movie[]> = {};
    for (const item of movies) {
      const year = yearOf(item.session_date);
      if (!groups[year]) groups[year] = [];
      groups[year]!.push(item);
    }
    return groups;
  }, [movies]);

  function toggleYear(year: string) {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  const unifafireLogoStyle = frutigerAero ? { filter: "brightness(0) invert(1)" } : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[832px] items-center justify-between gap-4 px-4 py-6 sm:gap-6">
          <div className="flex items-center gap-5">
            <img
              src={cineclubeLogo.url}
              alt="Cine Clube"
              className="logo-dark h-24 w-auto opacity-70"
            />
            <img src={cineclubeLogoGreen.url} alt="Cine Clube" className="logo-light h-24 w-auto" />
            <span className="h-10 w-px bg-border" />
            <button
              type="button"
              onClick={toggleFrutigerAero}
              aria-label="Alternar modo Frutiger Aero"
              className="cursor-pointer bg-transparent p-0"
            >
              <img
                src={unifafireLogo.url}
                alt="UniFAFIRE"
                className="logo-dark h-8 w-auto opacity-75 sm:h-12"
                style={unifafireLogoStyle}
              />
              <img
                src={unifafireLogoGreen.url}
                alt="UniFAFIRE"
                className="logo-light h-8 w-auto sm:h-12"
                style={unifafireLogoStyle}
              />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <p className="hidden max-w-[140px] text-right text-sm leading-snug text-muted-foreground sm:block">
              Avalie e discuta as sessões do mês
            </p>
            <span className="hidden sm:block">
              <ThemeToggle />
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[832px] px-4 pb-24">
        <section className="pt-12">
          <div className="flex items-center gap-4">
            <span className="sm:hidden">
              <ThemeToggle />
            </span>
            <h2 className="font-display text-2xl italic">Este mês</h2>
            <span className="text-[11px] tracking-[0.15em] text-muted-foreground">
              {monthLabel}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6 space-y-12">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} memberMode={memberMode} />
            ))}
          </div>
        </section>

        <section className="pt-20">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-2xl italic">Acervo</h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Clique num título para ver notas e comentários.
          </p>

          {Object.entries(acervoByYear).map(([year, items]) => {
            const open = openYears.has(year);
            return (
              <div key={year}>
                <button
                  type="button"
                  onClick={() => toggleYear(year)}
                  className="mt-8 flex w-full items-center gap-4"
                >
                  <h3 className="font-display text-lg italic text-primary">{year}</h3>
                  <span className="h-px flex-1 bg-border" />
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="mt-2">
                    {items.map((item) => (
                      <AcervoRow
                        key={item.id}
                        item={item}
                        dbReviews={dbReviews}
                        memberMode={memberMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[832px] flex-col items-center justify-center gap-4 px-4 py-8">
          <a
            href="https://www.instagram.com/cineclube.unifafire/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-muted-foreground transition-opacity hover:opacity-80"
          >
            <img src={instagramGray.url} alt="Instagram" className="logo-dark h-7 w-7" />
            <img src={instagramGreen.url} alt="Instagram" className="logo-light h-7 w-7" />
            <span>@cineclube.unifafire</span>
          </a>
          {isMember ? (
            <button
              type="button"
              onClick={async () => {
                await signOutMember();
                void navigate({ to: "/", replace: true });
              }}
              className="text-[13px] text-muted-foreground underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
            >
              Logado como cineclube@unifafire.edu.br
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="text-[13px] text-muted-foreground underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
            >
              Logar como membro do cineclube
            </button>
          )}

          {memberMode && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Adicionar filme
            </button>
          )}
        </div>
      </footer>

      {addOpen && <AddMovieDialog onClose={() => setAddOpen(false)} />}
      {loginOpen && !denied && <MemberLoginDialog onClose={() => setLoginOpen(false)} />}
      {denied && <AccessDeniedDialog onClose={clearDenied} />}
    </div>
  );
}
