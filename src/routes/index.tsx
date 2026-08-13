import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Film, CalendarDays, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import featured from "@/assets/film-featured.jpg";
import film2 from "@/assets/film-2.jpg";
import film3 from "@/assets/film-3.jpg";
import film4 from "@/assets/film-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cineclube UniFAFIRE | Sessões, debates e avaliações" },
      {
        name: "description",
        content:
          "Cineclube UniFAFIRE: sessões semanais de cinema, debates com a comunidade acadêmica e avaliações dos filmes exibidos.",
      },
      { property: "og:title", content: "Cineclube UniFAFIRE" },
      {
        property: "og:description",
        content:
          "Sessões semanais, debates e avaliações do cineclube da UniFAFIRE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Review = { name: string; rating: number; comment: string };

const schedule = [
  {
    img: film2,
    title: "Doze Homens e uma Sentença",
    year: "1957",
    director: "Sidney Lumet",
    date: "Quinta, 20 de agosto · 19h",
    tag: "Clássicos",
  },
  {
    img: film3,
    title: "Cinema Paradiso",
    year: "1988",
    director: "Giuseppe Tornatore",
    date: "Quinta, 27 de agosto · 19h",
    tag: "Memória",
  },
  {
    img: film4,
    title: "Aquarius",
    year: "2016",
    director: "Kleber Mendonça Filho",
    date: "Quinta, 3 de setembro · 19h",
    tag: "Cinema pernambucano",
  },
];

function Index() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([
    {
      name: "Marina L.",
      rating: 5,
      comment:
        "A sessão rendeu um debate incrível sobre limites entre disciplina e abuso. Saí atordoada.",
    },
    {
      name: "Rafael S.",
      rating: 4,
      comment: "Montagem impecável. A discussão depois valeu tanto quanto o filme.",
    },
  ]);

  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || rating === 0) return;
    setReviews([{ name: name.trim(), rating, comment: comment.trim() }, ...reviews]);
    setName("");
    setComment("");
    setRating(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span className="font-display text-lg tracking-wide">Cineclube</span>
          </a>
          <div className="text-right text-xs uppercase tracking-[0.25em] text-muted-foreground">
            UniFAFIRE
            <div className="text-[10px] tracking-[0.2em]">Recife · PE</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <section className="pt-14 pb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">
            Sessão desta semana
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Um cineclube feito de <span className="text-primary text-glow">luz</span>,
            debate e café depois da sessão.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Toda quinta-feira exibimos um filme no auditório da UniFAFIRE e abrimos a
            conversa para quem quiser ficar. Entrada livre, sem lista, sem silêncio
            obrigatório depois dos créditos.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Quintas-feiras
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> 19h
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Auditório central
            </span>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="relative">
            <img
              src={featured}
              alt="Cena do filme em cartaz no cineclube"
              width={1280}
              height={720}
              className="h-[320px] w-full object-cover sm:h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <span className="rounded-full border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-primary">
                Em cartaz
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">Whiplash</h2>
              <p className="text-sm text-muted-foreground">
                2014 · Damien Chazelle · 106 min
              </p>
            </div>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              Um jovem baterista entra para a banda de jazz mais prestigiada do
              conservatório e descobre que o preço da genialidade pode custar tudo o que
              ele é. A sessão termina com debate mediado pelo grupo de estudos em
              audiovisual.
            </p>

            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Nota do público
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <StarRating value={Math.round(average)} readOnly size={20} />
                    <span className="font-display text-xl text-primary">
                      {average.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({reviews.length} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 border-t border-border pt-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Sua nota
                </p>
                <div className="mt-3">
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Seu nome
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como quer ser identificado"
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Comentário
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="O que ficou de você depois dos créditos?"
                    className="min-h-[42px] bg-secondary"
                  />
                </div>
              </div>

              <Button type="submit" disabled={!name.trim() || rating === 0}>
                Enviar avaliação
              </Button>
            </form>

            <div className="space-y-4 border-t border-border pt-8">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-xl bg-secondary/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{r.name}</span>
                    <StarRating value={r.rating} readOnly size={14} />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl">Próximas sessões</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {schedule.map((f) => (
              <article
                key={f.title}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                <img
                  src={f.img}
                  alt={`Cena de ${f.title}`}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="space-y-1 p-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-primary">
                    {f.tag}
                  </span>
                  <h3 className="font-display text-lg">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {f.year} · {f.director}
                  </p>
                  <p className="pt-2 text-xs text-muted-foreground">{f.date}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Cineclube UniFAFIRE · Entrada gratuita · Auditório central, Recife
      </footer>
    </div>
  );
}
