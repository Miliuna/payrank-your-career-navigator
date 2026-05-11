import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodología — PayRank" },
      { name: "description", content: "Existe un número exacto para tu puesto, tu industria y tu momento. PayRank te lo dice." },
    ],
  }),
  component: Metodologia,
});

function Metodologia() {
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />
      <section className="pt-32 md:pt-44 pb-24 md:pb-32 px-5 md:px-10">
        <div className="mx-auto" style={{ maxWidth: "680px" }}>
          <p className="font-ui text-[10px] text-niebla mb-6">Metodología</p>
          <h1 className="font-display text-4xl md:text-6xl mb-12 leading-tight">
            Esto no es una calculadora.
          </h1>

          <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed mb-16 md:mb-20">
            Existe un número exacto para tu puesto, tu industria y tu momento.
            Un número que el mercado ya definió. Que existe independientemente
            de lo que te pagan hoy o de lo que vas a negociar mañana.
          </p>

          <p className="font-display-italic text-5xl md:text-7xl text-hueso text-center my-20 md:my-28 leading-tight">
            PayRank te lo dice.
          </p>

          <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed mb-10">
            No con promedios de internet. Con el mismo rigor con el que se
            construyen las encuestas de compensaciones globales — ajustado a tu
            alcance, tu nivel y tu país.
          </p>

          <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed">
            Para que la próxima conversación ocurra con información real de tu lado.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
