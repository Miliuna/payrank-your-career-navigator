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
  "Tu experiencia y tu trayectoria pueden valer más de lo que te pagan. Necesitás saberlo.",
  "Todos los puestos tienen un valor de mercado. ¿Sabés cuánto vale el tuyo?",
  "Puede existir una brecha de género en tu industria que te está costando dinero cada mes sin que lo sepas.",
  "Con el número correcto y los argumentos correctos, la conversación que tenés por delante cambia completamente.",
];

const planes = [
  {
    nombre: "GO",
    precio: "USD 29",
    sufijo: undefined as string | undefined,
    italic: "Para cuando tenés una conversación puntual por delante.",
    descripcion: "Un PayRank completo. Sin vencimiento.",
    cta: "EMPEZAR CON GO",
    plan: "unico" as const,
    destacada: false,
  },
  {
    nombre: "PLUS",
    precio: "USD 69",
    sufijo: undefined as string | undefined,
    italic: "Para cuando estás en movimiento.",
    descripcion:
      "Tres PayRank completos. Sin vencimiento.\n\nLa mayoría de los procesos de búsqueda o negociación requieren más de uno — uno para saber cuánto valés, otro para preparar la entrevista, otro cuando llegue la oferta.",
    cta: "EMPEZAR CON PLUS",
    plan: "pack3" as const,
    destacada: true,
    badge: "MÁS ELEGIDO",
  },
  {
    nombre: "PRO",
    precio: "USD 99",
    sufijo: "/año",
    italic: "Para quien quiere que PayRank lo acompañe.",
    descripcion:
      "PayRank ilimitados durante 12 meses. Más alertas cuando tu mercado se mueva — para que nunca negocies con información vieja.",
    cta: "EMPEZAR CON PRO",
    plan: "anual" as const,
    destacada: false,
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
            PROFESSIONAL INTELLIGENCE · TU VALOR EN EL MERCADO
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] md:text-7xl md:leading-[1.02] tracking-tight text-hueso mb-8">
            ¿Cuánto <span className="font-display-italic">valés</span><br />
            realmente en<br />
            el mercado?
          </h1>
          <p className="font-body text-lg md:text-xl text-hueso/70 max-w-2xl mb-14 leading-relaxed">
            No solo tu puesto. Tu experiencia, tus habilidades, tu trayectoria y tu potencial.
            Todo tiene un valor en el mercado. PayRank te lo dice — y te muestra qué hacer con esa información.
          </p>

          <ul className="space-y-4 mb-14 max-w-2xl">
            {preguntas.map((p) => (
              <li key={p} className="flex items-start gap-4 font-body text-base md:text-lg text-hueso/85">
                <span className="mt-2 size-1.5 rounded-full bg-hueso shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/modo"
            className="inline-flex items-center gap-3 bg-hueso text-tinta px-8 py-4 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
          >
            HACER MI PAYRANK
            <span aria-hidden>→</span>
          </Link>

          <p className="mt-10 font-body text-sm text-hueso/50 max-w-xl">
            La información que cambia la conversación.
          </p>
        </div>
      </section>

      {/* Comparativa de fuentes */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-piedra mb-4">POR QUÉ IMPORTA LA FUENTE</p>
          <h2 className="font-display text-3xl md:text-5xl mb-6">
            Por qué importa la <span className="font-display-italic">fuente</span>
          </h2>
          <p className="font-body text-lg md:text-xl text-piedra mb-6 max-w-2xl leading-relaxed">
            Lo que encontrás gratis.<br />Lo que necesitás saber.
          </p>
          <p className="font-body text-base text-tinta/80 mb-14 max-w-2xl leading-relaxed">
            Toda la información salarial disponible hoy tiene el mismo problema: te muestra lo que otros quieren que veas, no lo que tu perfil vale en el mercado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Columna izquierda — Gratis */}
            <div className="bg-hueso border border-niebla p-7 md:p-9 flex flex-col">
              <p className="font-ui text-[10px] text-piedra mb-3">GRATIS</p>
              <p className="font-body text-sm text-tinta mb-6">
                LinkedIn Salary · Glassdoor · ChatGPT · Bumeran · InfoJobs
              </p>

              <div className="bg-fondo2 p-5 mb-6 font-mono text-xs text-tinta/80 leading-relaxed">
                <p className="mb-3 text-tinta">
                  ¿Cuánto debería ganar un Gerente de Marketing en Argentina con 8 años de experiencia?
                </p>
                <p className="text-piedra">
                  → "Los salarios para ese rol varían entre $1.200.000 y $2.800.000 ARS por mes según el tamaño de la empresa y la industria. En multinacionales puede ser más alto."
                </p>
              </div>

              <ul className="space-y-4 font-body text-sm text-tinta/85">
                {[
                  ["En pesos — inutilizable en semanas", "todas las fuentes"],
                  ["Datos autodeclarados sin verificación", "LinkedIn Salary · Glassdoor"],
                  ["Muestran lo que las empresas ofrecen publicar, no lo que realmente pagan", "Bumeran · InfoJobs"],
                  ["Sin ajuste por tu perfil real — el mismo rango para un junior que para vos", "ChatGPT · buscadores"],
                  ["Sin posición en el mercado: no sabés si ese número es bueno o malo para tu nivel", "todas las fuentes"],
                  ["Sin argumento — tenés el dato pero no qué decir en la negociación", "todas las fuentes"],
                ].map(([texto, fuente]) => (
                  <li key={texto} className="flex items-start gap-3">
                    <span className="font-display text-base shrink-0" style={{ color: "#4A1F1F" }}>✕</span>
                    <span>
                      {texto}
                      <span className="block text-xs text-piedra mt-0.5">({fuente})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna derecha — PayRank */}
            <div className="bg-tinta text-hueso p-7 md:p-9 flex flex-col">
              <p className="font-ui text-[10px] mb-3" style={{ color: "#2E4A6E" }}>TU PAYRANK</p>
              <div className="font-body text-sm text-hueso mb-8 leading-relaxed">
                <p>PayRank · Diagnóstico #PR-0047</p>
                <p>Gerente de Marketing · FMCG · AMBA</p>
                <p>Multinacional · Alcance regional · 8 años</p>
              </div>

              <div className="mb-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-2">TU VALOR DE MERCADO</p>
                <p className="font-display text-3xl md:text-4xl text-hueso mb-2">
                  USD 3.200 <span className="font-body text-base text-hueso/70">bruto mensual · P50</span>
                </p>
                <p className="font-body text-sm text-hueso/80 leading-relaxed">
                  Tu compensación actual equivale a USD 2.750. Estás dejando USD 450 sobre la mesa cada mes.
                </p>
              </div>

              <div className="mb-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-3">TU POSICIÓN EN EL MERCADO</p>
                <div className="relative h-2 bg-hueso/15 mb-2">
                  <div className="absolute left-0 top-0 h-full bg-hueso/40" style={{ width: "75%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-hueso" style={{ left: "50%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full" style={{ left: "75%", backgroundColor: "#2E4A6E" }} />
                </div>
                <div className="flex justify-between font-ui text-[9px] text-hueso/60 mb-3">
                  <span>25% INF</span>
                  <span>MEDIANA 3.200</span>
                  <span>TOP 25% · 4.100</span>
                  <span>TOP 10% · 5.200</span>
                </div>
                <p className="font-body text-sm leading-relaxed" style={{ color: "#DDE4EE" }}>
                  Con tu perfil regional y adopción de IA, pertenecés al top 25% del mercado. Tu salario actual está en la franja media.
                </p>
              </div>

              <div className="mb-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-2">BRECHA DE GÉNERO DETECTADA</p>
                <p className="font-body text-sm text-hueso/85 leading-relaxed">
                  En FMCG para este nivel, la brecha promedio es 22%. Potencial impacto: hasta USD 8.400 anuales.
                </p>
              </div>

              <div>
                <p className="font-ui text-[10px] text-hueso/60 mb-2">ARGUMENTO DE NEGOCIACIÓN</p>
                <p className="font-display-italic text-base text-hueso leading-relaxed">
                  "Mi perfil con gestión regional y adopción de IA está en el top 25% del mercado. El valor de referencia para ese nivel es USD 4.100. Estoy pidiendo USD 3.900."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              to="/modo"
              className="inline-flex items-center gap-3 bg-tinta text-hueso px-8 py-4 font-ui text-[11px] hover:bg-tinta/90 transition-colors"
            >
              HACER MI PAYRANK
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Proceso en 3 pasos */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28 border-t border-niebla">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-piedra mb-4">EL PROCESO</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            Tres minutos. El <span className="font-display-italic">número exacto.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                titulo: "Tu perfil en segundos",
                texto: "Respondés 4 preguntas. La IA deduce el resto — industria, alcance, nivel de seniority — sin que tengas que explicar nada que ya se puede inferir.",
                tag: "ASISTIDO POR IA",
              },
              {
                n: "02",
                titulo: "PayRank procesa",
                texto: "Aplicamos los ajustes compensológicos que usan las consultoras globales — alcance, liderazgo, idiomas, adopción de IA — sobre la base de datos de mercado.",
                tag: "METODOLOGÍA DE CONSULTORA GLOBAL",
              },
              {
                n: "03",
                titulo: "Tu diagnóstico completo",
                texto: "Posición en el mercado, brecha de género si aplica, compensación total y el argumento exacto para tu próxima conversación — en menos de tres minutos.",
                tag: "ACCIONABLE DE INMEDIATO",
              },
            ].map((c) => (
              <div key={c.n} className="bg-hueso border border-niebla p-7 md:p-9 flex flex-col">
                <p className="font-display text-5xl md:text-6xl text-tinta mb-6">{c.n}</p>
                <h3 className="font-display text-2xl text-tinta mb-4">{c.titulo}</h3>
                <p className="font-body text-sm text-piedra leading-relaxed mb-8 flex-1">{c.texto}</p>
                <p className="font-ui text-[10px] text-tinta border-t border-niebla pt-4">{c.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Precios */}
      <section id="precios" className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-piedra mb-4">PLANES</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            Elegí tu <span className="font-display-italic">PayRank</span>
          </h2>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planes.map((plan) => {
              const d = plan.destacada;
              return (
                <div
                  key={plan.plan}
                  className={`relative flex flex-col p-7 md:p-9 ${
                    d ? "bg-tinta text-hueso" : "bg-hueso text-tinta border border-niebla"
                  }`}
                >
                  {plan.badge && (
                    <span
                      className="absolute -top-3 left-7 font-ui text-[9px] text-hueso px-3 py-1"
                      style={{ backgroundColor: "#2E4A6E" }}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <p className={`font-ui text-[11px] mb-8 ${d ? "text-hueso/70" : "text-piedra"}`}>
                    {plan.nombre}
                  </p>
                  <div className="mb-5 flex items-baseline gap-2">
                    <span className={`font-display text-5xl md:text-6xl ${d ? "text-hueso" : "text-tinta"}`}>
                      {plan.precio}
                    </span>
                    {plan.sufijo && (
                      <span className={`font-body text-sm ${d ? "text-hueso/70" : "text-piedra"}`}>
                        {plan.sufijo}
                      </span>
                    )}
                  </div>
                  <p className={`font-display-italic text-base mb-6 ${d ? "text-hueso" : "text-tinta"}`}>
                    {plan.italic}
                  </p>
                  <p className={`font-body text-sm leading-relaxed mb-10 whitespace-pre-line ${d ? "text-hueso/80" : "text-piedra"}`}>
                    {plan.descripcion}
                  </p>
                  <Link
                    to="/modo"
                    search={{ plan: plan.plan }}
                    className={`mt-auto inline-flex items-center justify-between font-ui text-[11px] px-5 py-3 transition-colors ${
                      d
                        ? "bg-hueso text-tinta hover:bg-hueso/90"
                        : "bg-tinta text-hueso hover:bg-tinta/90"
                    }`}
                  >
                    {plan.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Tabla comparativa */}
          <div className="mt-24 border-t border-niebla pt-16">
            <p className="font-ui text-[10px] text-piedra mb-8">EN DETALLE</p>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-niebla">
                    <th className="text-left py-4 pr-4 font-ui text-[10px] text-piedra w-1/3"></th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-tinta">GO</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-tinta">PLUS</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-tinta">PRO</th>
                  </tr>
                </thead>
                <tbody className="text-tinta">
                  <tr className="border-b border-niebla/60">
                    <td className="py-4 pr-4 text-piedra">Precio</td>
                    <td className="py-4 px-4">USD 29</td>
                    <td className="py-4 px-4">USD 69</td>
                    <td className="py-4 px-4">USD 99/año</td>
                  </tr>
                  <tr className="border-b border-niebla/60">
                    <td className="py-4 pr-4 text-piedra">PayRank incluidos</td>
                    <td className="py-4 px-4">1</td>
                    <td className="py-4 px-4">3</td>
                    <td className="py-4 px-4">Ilimitados por 12 meses</td>
                  </tr>
                  <tr className="border-b border-niebla/60">
                    <td className="py-4 pr-4 text-piedra">Análisis completo</td>
                    <td className="py-4 px-4">✓</td>
                    <td className="py-4 px-4">✓</td>
                    <td className="py-4 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-piedra">Alertas cuando tu mercado se mueve</td>
                    <td className="py-4 px-4 text-piedra">—</td>
                    <td className="py-4 px-4 text-piedra">—</td>
                    <td className="py-4 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="font-display-italic text-base text-piedra mt-8 max-w-2xl">
              La mayoría de quienes están en búsqueda activa o atravesando una negociación terminan necesitando más de un PayRank. El plan PLUS está diseñado para eso.
            </p>
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="bg-hueso text-tinta px-5 md:px-10 pb-24">
        <div className="mx-auto max-w-4xl border-t border-niebla pt-20">
          <p className="font-ui text-[10px] text-piedra mb-4">Metodología</p>
          <h2 className="font-display text-3xl md:text-5xl mb-10">
            Esto no es una calculadora.
          </h2>
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
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
