import { createFileRoute } from "@tanstack/react-router";
import { CineclubePage } from "@/components/CineclubePage";

export const Route = createFileRoute("/logado")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área do membro — Cineclube UniFAFIRE" },
      {
        name: "description",
        content: "Área dos membros do Cineclube UniFAFIRE para gerenciar filmes e comentários.",
      },
      { property: "og:title", content: "Área do membro — Cineclube UniFAFIRE" },
      {
        property: "og:description",
        content: "Área dos membros do Cineclube UniFAFIRE para gerenciar filmes e comentários.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <CineclubePage memberPage />,
});
