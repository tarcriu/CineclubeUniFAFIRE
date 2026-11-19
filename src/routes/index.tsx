import { createFileRoute } from "@tanstack/react-router";
import { CineclubePage } from "@/components/CineclubePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cineclube UniFAFIRE" },
      { name: "description", content: "Cineclube da UniFAFIRE no Recife: veja os filmes do mês, horários, local e avalie as sessões." },
      { property: "og:title", content: "Cineclube UniFAFIRE" },
      { property: "og:description", content: "Cineclube da UniFAFIRE no Recife: veja os filmes do mês, horários, local e avalie as sessões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CineclubePage />,
});
