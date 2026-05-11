import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/modo")({
  head: () => ({
    meta: [
      { title: "Elegí tu situación — PayRank" },
      { name: "description", content: "Cuatro modos de diagnóstico salarial. Elegí el tuyo." },
    ],
  }),
  component: ModoSelector,
});

const modos = [
  {
    id: "A",
    titulo: "Sé cuánto valgo",
    descripcion: "Trabajás y querés conocer tu valor real en el mercado.",
  },
  {
    id: "B",
    titulo: "Quiero un aumento",
    descripcion: "Tenés una conversación por delante con tu jefe. Necesitás argumentos reales.",
  },
  {
    id: "C",
    titulo: "Tengo una entrevista",
    descripcion: "Estás en un proceso de selección y necesitás saber cuánto pedir.",
  },
  {
    id: "D",
    titulo: "Construyo mi carrera",
    descripcion: "Querés reposicionarte en el mercado y maximizar tu valor.",
  },
];

function ModoSelector() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />

      <section className="pt-32 md:pt-44 pb-20 md:pb-28 px-5 md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="font-ui text-[10px] text-piedra mb-6">Paso 1 de 4</p>
          <h1 className="font-display text-4xl md:text-6xl mb-5 leading-tight">
            ¿Qué querés hacer <span className="font-display-italic">hoy</span>?
          </h1>
          <p className="font-body text-base md:text-lg text-piedra max-w-2xl mb-14">
            Elegí tu situación. El diagnóstico se adapta exactamente a lo que necesitás.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modos.map((m) => (
              <Link
                key={m.id}
                to="/modo"
                className="group relative bg-card border border-niebla p-7 md:p-9 hover:border-tinta transition-all hover:shadow-[0_0_0_1px_var(--tinta)]"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-ui text-[10px] text-piedra">Modo {m.id}</span>
                  <span className="font-display-italic text-3xl text-niebla group-hover:text-real transition-colors">
                    {m.id}
                  </span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl mb-3">{m.titulo}</h2>
                <p className="font-body text-piedra leading-relaxed mb-8">{m.descripcion}</p>
                <span className="font-ui text-[11px] inline-flex items-center gap-2 text-tinta">
                  Continuar <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
