import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { StarsDisplay, StarsInput } from "@/components/Stars";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  formatReviewDate,
  getDeviceId,
  submitReview,
  useReviews,
  type DbReview,
} from "@/lib/reviews";

import whiplashAsset from "@/assets/whiplash.jpg.asset.json";
import poetasAsset from "@/assets/poetas.jpg.asset.json";

import cineclubeLogo from "@/assets/cineclube-logo.png.asset.json";
import unifafireLogo from "@/assets/unifafire.png.asset.json";
import cineclubeLogoGreen from "@/assets/cineclube-logo-green.png.asset.json";
import unifafireLogoGreen from "@/assets/unifafire-green.png.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cineclube UniFAFIRE" },
      { name: "description", content: "Avalie e discuta as sessões do mês." },
      { property: "og:title", content: "Cineclube UniFAFIRE" },
      { property: "og:description", content: "Avalie e discuta as sessões do mês." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const sessions = [
  {
    id: "whiplash",
    img: whiplashAsset.url,
    date: "26 DE AGOSTO DE 2026",
    title: "Whiplash",
    credits: "Damien Chazelle · 2014",
    synopsis:
      "Andrew Neiman é um jovem baterista obcecado em se tornar um dos maiores músicos de sua geração. Ao ingressar no prestigioso Conservatório Shaffer, em Nova York, ele passa a ser orientado pelo temido maestro Terence Fletcher — um homem capaz de qualquer crueldade em nome da excelência.",
  },
  {
    id: "poetas",
    img: poetasAsset.url,
    date: "26 DE AGOSTO DE 2026",
    title: "Sociedade dos Poetas Mortos",
    credits: "Peter Weir · 1989",
    synopsis:
      "Em 1959 na Welton Academy, uma tradicional escola preparatória, um ex-aluno se torna o novo professor de literatura. Seus métodos incomuns — incentivando os alunos a pensarem por si mesmos e a abraçarem a poesia como forma de vida — entram em choque com a rígida direção do colégio e com as expectativas das famílias.",
  },
];

type Review = { name?: string; rating: number; comment?: string; date: string };

const acervo = [
  {
    id: "whiplash",
    title: "Whiplash",
    credits: "Damien Chazelle · 2014",
    date: "26 de agosto de 2026",
    rating: null as number | null,
    reviews: [] as Review[],
  },
  {
    id: "poetas",
    title: "Sociedade dos Poetas Mortos",
    credits: "Peter Weir · 1989",
    date: "26 de agosto de 2026",
    rating: null as number | null,
    reviews: [] as Review[],
  },
  {
    title: "Homem com H",
    credits: "Esmir Filho · 2025",
    date: "27 de maio de 2026",
    rating: 4.2,
    reviews: [
      {
        name: "Valentina Cruz",
        rating: 5,
        comment:
          "As sequências em câmera lenta e o Nat King Cole na trilha — fui completamente tomada. Um filme que vou carregar por anos.",
        date: "11 jul 2026",
      },
      {
        name: "Diego Ríos",
        rating: 4,
        comment:
          "Lindo e deliberadamente contido. Quando você se rende ao ritmo, a saudade se torna insuportável no melhor sentido.",
        date: "11 jul 2026",
      },
      {
        name: "Priya Menon",
        rating: 4,
        comment:
          "Cada quadro poderia estar numa galeria. Os qipaos da Maggie Cheung sozinhos mereceriam uma exposição separada.",
        date: "13 jul 2026",
      },
      { rating: 4, date: "14 jul 2026" },
      { name: "Marcos Vilela", rating: 4, date: "15 jul 2026" },
    ] as Review[],
  },
  {
    title: "A Ira de um Anjo",
    credits: "Larry Peerce · 1992",
    date: "13 de maio de 2026",
    rating: 4.3,
    reviews: [
      {
        name: "Ana Beatriz",
        rating: 4.5,
        comment: "Difícil de assistir, impossível de esquecer.",
        date: "20 mai 2026",
      },
      { rating: 4, date: "21 mai 2026" },
    ] as Review[],
  },
  {
    title: "Lorax: Em Busca da Trúfula Perdida",
    credits: "Chris Renaud · 2012",
    date: "22 de abril de 2026",
    rating: 3.7,
    reviews: [
      {
        name: "Rafael Lima",
        rating: 3.5,
        comment: "Simpático e colorido, mas a mensagem fica no raso.",
        date: "28 abr 2026",
      },
      { name: "Júlia Prado", rating: 4, date: "29 abr 2026" },
    ] as Review[],
  },
  {
    title: "Não Se Preocupe, Querida",
    credits: "Olivia Wilde · 2022",
    date: "23 de março de 2026",
    rating: 4.7,
    reviews: [
      {
        rating: 5,
        comment: "A direção de arte carrega o filme inteiro nas costas.",
        date: "30 mar 2026",
      },
      { name: "Camila Souza", rating: 4.5, date: "31 mar 2026" },
    ] as Review[],
  },
];


function SessionCard({ session }: { session: (typeof sessions)[number] }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative">
        <img
          src={session.img}
          alt={session.title}
          width={1280}
          height={720}
          className="h-[380px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/45 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <p className="text-[11px] tracking-[0.18em] text-foreground/80">{session.date}</p>
          <h3 className="mt-1 font-display text-4xl italic">{session.title}</h3>
          <p className="mt-1 text-sm text-foreground/75">{session.credits}</p>
        </div>
      </div>

      <div className="p-6">
        <p className="max-w-[600px] text-[15px] leading-relaxed text-foreground/85">
          {session.synopsis}
        </p>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            setRating(0);
            setName("");
            setComment("");
          }}
        >
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

          <button
            type="submit"
            className="mt-6 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Enviar avaliação
          </button>
        </form>
      </div>
    </article>
  );
}

function AcervoRow({ item }: { item: (typeof acervo)[number] }) {
  const [open, setOpen] = useState(false);

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
              {item.credits}
            </span>
          </h4>
          <p className="mt-0.5 text-[13px] text-muted-foreground sm:hidden">
            {item.credits}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">{item.date}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {item.rating !== null && (
            <>
              <StarsDisplay value={item.rating} />
              <span className="text-sm text-foreground/90">{item.rating.toFixed(1)}</span>
            </>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="pb-6">
          {item.reviews.length === 0 ? (
            <p className="pb-2 text-[13px] text-muted-foreground">
              Nenhuma avaliação ainda.
            </p>
          ) : (
            <>
              <div className="rounded-md bg-secondary/50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="text-[13px] text-muted-foreground">
                    {item.reviews.length} {item.reviews.length === 1 ? "voto" : "votos"}
                  </span>
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = item.reviews.filter(
                      (r) => Math.round(r.rating) === n,
                    ).length;
                    const pct = (count / item.reviews.length) * 100;
                    return (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-[13px] text-muted-foreground">{n}</span>
                        <StarsDisplay value={1} size={11} />
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

              <ul className="mt-4 space-y-4">
                {item.reviews
                  .filter((r) => r.name?.trim() || r.comment?.trim())
                  .map((r, i) => {
                    const name = r.name?.trim() || "Anônimo";
                    return (
                      <li key={i} className="flex gap-3">
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
        </div>
      )}
    </div>

  );
}

function Index() {
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
            <img
              src={cineclubeLogoGreen.url}
              alt="Cine Clube"
              className="logo-light h-24 w-auto"
            />
            <span className="h-10 w-px bg-border" />
            <img
              src={unifafireLogo.url}
              alt="UniFAFIRE"
              className="logo-dark h-8 w-auto opacity-75 sm:h-12"
            />
            <img
              src={unifafireLogoGreen.url}
              alt="UniFAFIRE"
              className="logo-light h-8 w-auto sm:h-12"
            />
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
              AGOSTO 2026
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6 space-y-12">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
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

          <div className="mt-8 flex items-center gap-4">
            <h3 className="font-display text-lg italic text-primary">2026</h3>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-2">
            {acervo.map((item) => (
              <AcervoRow key={item.title + item.date} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
