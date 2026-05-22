import { createFileRoute, Link } from "@tanstack/react-router";
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
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />

      <section className="bg-hueso text-tinta px-5 md:px-10 pt-32 md:pt-44 pb-24">
        <div className="mx-auto max-w-4xl">
          <p className="font-ui text-[10px] text-piedra mb-4">METODOLOGÍA</p>
          <h1 className="font-display text-3xl md:text-5xl mb-10">
            Esto no es una calculadora.
          </h1>
          <div className="font-body text-piedra leading-relaxed space-y-8 max-w-2xl">
            <p>
              Existe un número exacto para tu puesto, tu industria y tu momento.
              Un número que el mercado ya definió. Que existe independientemente
              de lo que te pagan hoy o de lo que vas a negociar mañana.
            </p>
            <p className="font-display-italic text-3xl md:text-5xl text-tinta my-12 md:my-16 leading-tight">
              PayRank te lo dice.
            </p>
            <p>
              No con promedios de internet. Con el mismo rigor con el que se
              construyen las encuestas de compensaciones globales — ajustado a tu
              alcance, tu nivel y tu país.
            </p>
            <p>
              Para que la próxima conversación ocurra con información real de tu lado.
            </p>
          </div>

          <div className="mt-16">
            <Link
              to="/modo"
              className="inline-flex items-center gap-3 bg-tinta text-hueso px-8 py-4 font-ui text-[11px] hover:bg-tinta/90 transition-colors"
            >
              OBTENER MI PAYRANK
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
