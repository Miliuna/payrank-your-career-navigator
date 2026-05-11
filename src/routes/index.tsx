import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayRank — Diagnóstico salarial profesional" },
      { name: "description", content: "La información salarial que las empresas siempre tuvieron y los profesionales nunca. Diagnóstico con criterio compensológico real." },
      { property: "og:title", content: "PayRank — Diagnóstico salarial profesional" },
      { property: "og:description", content: "Descubrí cuánto vale tu puesto hoy en el mercado." },
    ],
  }),
  component: Landing,
});

const preguntas = [
  "¿Cuál es tu remuneración pretendida?",
  "¿Cuánto paga el mercado por una posición como la tuya?",
  "¿Existe brecha salarial de género en tu rol?",
  "¿Cómo negociar un aumento con argumentos reales?",
];

const planes = [
  {
    nombre: "Diagnóstico único",
    precio: "USD 29",
    descripcion: "1 diagnóstico de cualquier modo. Sin vencimiento.",
    plan: "unico" as const,
  },
  {
    nombre: "Pack de 3",
    precio: "USD 69",
    descripcion: "3 diagnósticos de cualquier modo. Sin vencimiento. Ahorro del 20%.",
    plan: "pack3" as const,
    badge: "Más elegido",
  },
  {
    nombre: "Anual",
    precio: "USD 99",
    sufijo: "/año",
    descripcion: "Diagnósticos ilimitados durante 12 meses + alertas de movimiento de mercado en tu industria.",
    plan: "anual" as const,
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      {/* Hero */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-36 px-5 md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="font-ui text-[10px] md:text-[11px] text-hueso/60 mb-8">
            Salary Intelligence · Global
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] md:text-7xl md:leading-[1.02] tracking-tight text-hueso mb-8">
            ¿Cuánto vale<br />
            <span className="font-display-italic">tu puesto</span> hoy<br />
            en el mercado?
          </h1>
          <p className="font-body text-lg md:text-xl text-hueso/70 max-w-2xl mb-14 leading-relaxed">
            La información que las empresas siempre tuvieron y los profesionales nunca.
            Diagnóstico salarial con criterio real de mercado.
          </p>

          <ul className="space-y-4 mb-14 max-w-2xl">
            {preguntas.map((p) => (
              <li key={p} className="flex items-start gap-4 font-body text-base md:text-lg text-hueso/85">
                <span className="mt-2 size-1.5 rounded-full bg-real shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/modo"
            className="inline-flex items-center gap-3 bg-hueso text-tinta px-8 py-4 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
          >
            Comenzar mi diagnóstico
            <span aria-hidden>→</span>
          </Link>

          <p className="mt-10 font-body text-sm text-hueso/50 max-w-xl">
            Metodología con criterio compensológico real. No crowdsourcing. No datos de job boards.
          </p>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-piedra mb-4">Precios</p>
          <h2 className="font-display text-3xl md:text-5xl mb-3">
            Elegí cómo querés <span className="font-display-italic">empezar</span>
          </h2>
          <p className="font-body text-piedra mb-14 max-w-xl">
            El precio se determina por tu país de facturación, no por el país del diagnóstico.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planes.map((plan) => {
              const destacada = plan.plan === "pack3";
              return (
                <div
                  key={plan.plan}
                  className={`relative flex flex-col p-7 md:p-8 ${
                    destacada
                      ? "bg-tinta text-hueso"
                      : "bg-card text-tinta border border-niebla"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-5 right-5 font-ui text-[9px] text-hueso/70 border border-hueso/30 px-2 py-1">
                      {plan.badge}
                    </span>
                  )}
                  <p className="font-ui text-[10px] mb-6 opacity-70">{plan.nombre}</p>
                  <div className="mb-6">
                    <span className="font-display text-5xl">{plan.precio}</span>
                    {plan.sufijo && (
                      <span className="font-body text-base opacity-70">{plan.sufijo}</span>
                    )}
                  </div>
                  <p className={`font-body text-sm mb-10 leading-relaxed ${destacada ? "text-hueso/70" : "text-piedra"}`}>
                    {plan.descripcion}
                  </p>
                  <Link
                    to="/modo"
                    search={{ plan: plan.plan }}
                    className={`mt-auto inline-flex items-center justify-between font-ui text-[11px] py-3 border-t ${
                      destacada ? "border-hueso/20 hover:border-hueso/60" : "border-niebla hover:border-tinta"
                    } transition-colors`}
                  >
                    Comenzar <span aria-hidden>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="bg-hueso text-tinta px-5 md:px-10 pb-24">
        <div className="mx-auto max-w-4xl border-t border-niebla pt-20">
          <p className="font-ui text-[10px] text-piedra mb-4">Metodología</p>
          <h2 className="font-display text-3xl md:text-5xl mb-8">
            Esto <span className="font-display-italic">no</span> es una calculadora.
          </h2>
          <div className="grid md:grid-cols-2 gap-10 font-body text-piedra leading-relaxed">
            <p>
              Las empresas tienen acceso a encuestas salariales que cuestan miles de dólares.
              Sus empleados negocian sin esa información. PayRank democratiza ese conocimiento
              con criterio compensológico real para tu industria, nivel y país.
            </p>
            <p>
              No usamos datos de job boards. No usamos promedios de internet. Aplicamos
              ajustes por alcance regional, liderazgo, interacción con C-Level, idiomas y
              adopción de IA — los mismos que aplican los compensólogos profesionales.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
