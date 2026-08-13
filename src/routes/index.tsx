import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StarsDisplay, StarsInput } from "@/components/Stars";
import whiplashAsset from "@/assets/whiplash.jpg.asset.json";
import poetasAsset from "@/assets/poetas.jpg.asset.json";

import cineclubeLogo from "@/assets/cineclube-logo.png.asset.json";
import unifafireLogo from "@/assets/unifafire.png.asset.json";


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

const acervo = [
  {
    title: "Whiplash",
    credits: "Damien Chazelle · 2014",
    date: "26 de agosto de 2026",
    rating: null as number | null,
  },
  {
    title: "Sociedade dos Poetas Mortos",
    credits: "Peter Weir · 1989",
    date: "26 de agosto de 2026",
    rating: null as number | null,
  },
  {
    title: "Homem com H",
    credits: "Esmir Filho · 2025",
    date: "27 de maio de 2026",
    rating: 4.2,
  },
  {
    title: "A Ira de um Anjo",
    credits: "Larry Peerce · 1992",
    date: "13 de maio de 2026",
    rating: 4.3,
  },
  {
    title: "Lorax: Em Busca da Trúfula Perdida",
    credits: "Chris Renaud · 2012",
    date: "22 de abril de 2026",
    rating: 3.7,
  },
  {
    title: "Não Se Preocupe, Querida",
    credits: "Olivia Wilde · 2022",
    date: "23 de março de 2026",
    rating: 4.7,
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
            {item.title}{" "}
            <span className="font-sans text-[13px] not-italic text-muted-foreground">
              {item.credits}
            </span>
          </h4>
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
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[832px] items-center justify-between px-4 py-6">
          <div className="flex items-center gap-5">
            <img
              src={cineclubeLogo.url}
              alt="Cine Clube"
              className="h-24 w-auto opacity-70"
            />
            <span className="h-10 w-px bg-border" />
            <img
              src={unifafireLogo.url}
              alt="UniFAFIRE"
              className="h-8 w-auto opacity-75 sm:h-12"
            />
          </div>

          <p className="hidden max-w-[140px] text-right text-sm leading-snug text-muted-foreground sm:block">
            Avalie e discuta as sessões do mês
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[832px] px-4 pb-24">
        <section className="pt-12">
          <div className="flex items-center gap-4">
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
