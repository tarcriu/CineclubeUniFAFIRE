import { createFileRoute } from "@tanstack/react-router";
import { CineclubePage } from "@/components/CineclubePage";

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
  component: () => <CineclubePage />,
});
