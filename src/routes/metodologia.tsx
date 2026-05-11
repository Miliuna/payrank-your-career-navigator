import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodología — PayRank" },
      { name: "description", content: "Criterio compensológico real para tu industria, nivel y país. No crowdsourcing." },
    ],
  }),
  component: Metodologia,
});

function Metodologia() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />
      <section className="pt-32 md:pt-44 pb-24 md:pb-32 px-5 md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="font-ui text-[10px] text-piedra mb-6">Metodología</p>
          <h1 className="font-display text-4xl md:text-6xl mb-12 leading-tight">
            Esto <span className="font-display-italic">no</span> es una calculadora.
          </h1>
          <div className="space-y-7 font-body text-base md:text-lg text-piedra leading-relaxed">
            <p>
              Las empresas tienen acceso a encuestas salariales que cuestan miles de dólares.
              Sus empleados negocian sin esa información. PayRank democratiza ese conocimiento — con
              criterio compensológico real para tu industria, nivel y país.
            </p>
            <p>
              No usamos datos de job boards. No usamos promedios de internet. Aplicamos los mismos
              ajustes que usan los compensólogos profesionales: alcance regional, liderazgo de equipo,
              interacción con C-Level, idiomas requeridos y adopción de IA en el rol.
            </p>
            <p>
              Creemos que las empresas deben pagar por lo que exigen. Y que los profesionales tienen
              el derecho de cobrar por lo que entregan — sin importar su género, origen o trayectoria.
              PayRank existe para que esa conversación ocurra con datos reales de los dos lados de la mesa.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
