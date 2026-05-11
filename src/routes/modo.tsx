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
    titulo: "Quiero saber si me pagan en forma competitiva",
    descripcion: "Analizamos tu perfil completo y te decimos exactamente dónde quedás en el mercado — con datos reales, no promedios de internet.",
  },
  {
    id: "B",
    titulo: "Quiero revisar mi situación con mi empleador",
    descripcion: "Tu PayRank puede mostrar una brecha entre tu alcance real y lo que te pagan. Te damos los argumentos y el script para esa conversación.",
  },
  {
    id: "C",
    titulo: "Tengo una oferta o entrevista",
    descripcion: "Sabé exactamente cuánto pedir, cómo fundamentarlo y qué decir cuando te pregunten cuánto querés ganar.",
  },
  {
    id: "D",
    titulo: "Quiero dar mi próximo salto de carrera",
    descripcion: "Tu PayRank te muestra dónde estás hoy, qué skills aumentan tu valor y qué necesitás demostrar para llegar al siguiente nivel.",
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
