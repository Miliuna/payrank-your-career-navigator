import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLang } from "@/lib/lang";
import { useRegion, PRICING } from "@/lib/pricing";

function useCaptureReferralFromUrl() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref");
      if (ref && ref.trim()) {
        window.localStorage.setItem("payrank.codigoReferido", ref.trim());
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);
      }
    } catch {
      // no-op
    }
  }, []);
}


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

// ─── ES content ────────────────────────────────────────────────────────────

const preguntasES = [
  "Tu experiencia y tu trayectoria pueden valer más de lo que te pagan. Necesitás saberlo.",
  "Tu empresa ya sabe exactamente cuánto deberías ganar. Vos, hasta hoy, no.",
  "Con el número correcto y los argumentos correctos, la conversación que tenés por delante cambia completamente.",
];

const planesES = [
  {
    nombre: "GO",
    precio: "USD 29",
    sufijo: undefined as string | undefined,
    italic: "Para cuando tenés una conversación puntual por delante.",
    descripcion:
      "1 PayRank completo.\n\nCuando ya sabés qué necesitás resolver — una negociación puntual, una decisión que no puede esperar — un PayRank te da el número exacto para esa conversación.",
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
      "3 PayRank, para usar en los próximos 12 meses.\n\nLa mayoría de los procesos de búsqueda o negociación requieren más de uno — uno para saber cuánto valés, otro para preparar la entrevista, otro cuando llegue la oferta.",
    cta: "EMPEZAR CON PLUS",
    plan: "pack3" as const,
    destacada: true,
    badge: "MÁS ELEGIDO",
  },
  {
    nombre: "PRO",
    precio: "USD 149",
    sufijo: "/año",
    italic: "Para cuando el mercado no para — y vos tampoco.",
    descripcion:
      "Hasta 12 por año.\n\nTu revisión anual, tu próxima entrevista, el salto de carrera que no esperabas — PRO te da el número correcto en cada una, durante todo el año.",
    cta: "EMPEZAR CON PRO",
    plan: "anual" as const,
    destacada: false,
  },
];

// ─── EN content ────────────────────────────────────────────────────────────

const affirmationsEN = [
  "Your company ran a salary benchmark on your role.\nThat number shaped your last raise.\nAnd the one before that.",
  "That offer on the table didn't come from thin air.\nThey benchmarked your profile before they wrote it.",
  "Walking into any salary conversation without\nmarket data isn't negotiating. It's guessing.",
];

const planesEN = [
  {
    nombre: "GO",
    precio: "USD 39",
    sufijo: undefined as string | undefined,
    italic: "For when you have one key conversation ahead.",
    descripcion:
      "1 PayRank.\n\nWhen you already know what you need to solve — a specific negotiation, a decision that can't wait — a PayRank gives you the exact number for that conversation.",
    cta: "START WITH GO",
    plan: "unico" as const,
    destacada: false,
  },
  {
    nombre: "PLUS",
    precio: "USD 99",
    sufijo: undefined as string | undefined,
    italic: "For when you're in motion.",
    descripcion:
      "3 PayRanks, to use anytime within the next 12 months. Save 20%.\n\nMost job searches and negotiations require more than one — one to know your number, one to prep for the interview, one when the offer lands.",
    cta: "START WITH PLUS",
    plan: "pack3" as const,
    destacada: true,
    badge: "MOST CHOSEN",
  },
  {
    nombre: "PRO",
    precio: "USD 199",
    sufijo: "/yr",
    italic: "For when your career doesn't take a year off.",
    descripcion:
      "Up to 12 a year.\n\nYour annual review, your next interview, the career leap you didn't see coming — PRO gives you the right number for each one, all year long.",
    cta: "START WITH PRO",
    plan: "anual" as const,
    destacada: false,
  },
];

// ─── Landing switcher ───────────────────────────────────────────────────────

function Landing() {
  useCaptureReferralFromUrl();
  const { lang } = useLang();
  if (lang === "EN") return <LandingEN />;
  return <LandingES />;
}


// ─── ES Landing ─────────────────────────────────────────────────────────────

function LandingES() {
  const { region } = useRegion();
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      {/* Hero */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-36 px-5 md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="font-ui text-[10px] md:text-[11px] text-hueso/60 mb-8">
            PROFESSIONAL SALARY INTELLIGENCE
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] md:text-7xl md:leading-[1.02] tracking-tight text-hueso mb-8">
            ¿Cuánto valés <span className="font-display-italic">realmente</span><br />
            en el mercado?
          </h1>
          <p className="font-body text-lg md:text-xl text-hueso/70 max-w-2xl mb-14 leading-relaxed">
            No solo tu puesto. Tu experiencia, tus habilidades, tu trayectoria y tu potencial.
            Todo tiene un valor en el mercado. PayRank te lo dice — y te muestra qué hacer con esa información.
          </p>

          <ul className="space-y-4 mb-14 max-w-2xl">
            {preguntasES.map((p) => (
              <li key={p} className="flex items-start gap-4 font-body text-base md:text-lg text-hueso/85">
                <span className="font-display text-lg leading-none mt-1 shrink-0" style={{ color: "#2E4A6E" }}>—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/modo"
            className="inline-flex items-center gap-3 bg-hueso text-tinta px-8 py-4 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
          >
            OBTENER MI PAYRANK
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
                  ¿Cuánto debería ganar un Gerente de Marketing en consumo masivo con 8 años de experiencia?
                </p>
                <p className="text-piedra">
                  → "Los salarios para ese rol varían entre $1.200.000 y $2.800.000 ARS por mes según el tamaño de la empresa y la industria. En multinacionales puede ser más alto."
                </p>
              </div>

              <ul className="space-y-4 font-body text-sm text-tinta/85">
                {([
                  ["Valores con los que se toman decisiones importantes, sin fecha de referencia — no sabés si ese número ya quedó desactualizado", "todas las fuentes"],
                  ["Datos autodeclarados sin verificación", "LinkedIn Salary · Glassdoor"],
                  ["Muestran lo que las empresas ofrecen publicar, no lo que realmente pagan", "Bumeran · InfoJobs"],
                  ["Sin ajuste por tu perfil real — el mismo rango para un junior que para vos", "ChatGPT · buscadores"],
                  ["Sin posición en el mercado: no sabés si ese número es bueno o malo para tu nivel", "todas las fuentes"],
                  ["Sin argumento — tenés el dato pero no qué decir en la negociación", "todas las fuentes"],
                ] as [string, string][]).map(([texto, fuente]) => (
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
              <p className="font-ui text-[10px] mb-3 text-hueso">TU PAYRANK</p>
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
              OBTENER MI PAYRANK
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Proceso en 4 pasos */}
      <section className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28 border-t border-hueso/15">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">EL PROCESO</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            Cuatro pasos. Un <span className="font-display-italic">número exacto.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                n: "01",
                titulo: "Elegís qué necesitás resolver.",
                texto: "Una conversación por delante, una oferta en evaluación, o tu posición en el mercado. Elegís el objetivo y el idioma de tu diagnóstico.",
                tag: "A TU MEDIDA",
              },
              {
                n: "02",
                titulo: "Completás tu perfil.",
                texto: "Respondés las preguntas clave sobre tu rol, experiencia, alcance y habilidades. La IA asiste el proceso para que sea rápido y preciso.",
                tag: "ASISTIDO POR IA",
              },
              {
                n: "03",
                titulo: "PayRank® Professional Salary Intelligence",
                texto: "Nuestra metodología aplica ajustes compensológicos reales sobre datos de mercado para calcular tu valor objetivo y tu posición relativa.",
                tag: "METODOLOGÍA PAYRANK",
              },
              {
                n: "04",
                titulo: "Obtené tu diagnóstico completo.",
                texto: "Tu posición real en el mercado, y el argumento concreto para tu próxima conversación — negociar, aceptar o decidir tu próximo paso.",
                tag: "ACCIONABLE DE INMEDIATO",
              },
            ].map((c) => (
              <div key={c.n} className="bg-tinta border border-hueso/15 p-7 md:p-9 flex flex-col">
                <p className="font-display text-5xl md:text-6xl text-[#C4BFB8] mb-6">{c.n}</p>
                <h3 className="font-display text-2xl text-hueso mb-4">{c.titulo}</h3>
                <p className="font-body text-sm text-hueso/70 leading-relaxed mb-8 flex-1">{c.texto}</p>
                <p className="font-ui text-[10px] text-hueso border-t border-hueso/15 pt-4">{c.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early access banner */}
      <section className="bg-hueso border-t border-b border-niebla/60 py-6 px-5 md:px-10">
        <p
          className="text-center font-ui text-[12px] uppercase tracking-[3px]"
          style={{ color: "#2E4A6E" }}
        >
          ACCESO ANTICIPADO · DISPONIBLE AHORA
        </p>
      </section>

      {/* Precios */}
      <section id="precios" className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANES</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            Elegí tu <span className="font-display-italic">PayRank</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planesES.map((plan) => {
              const d = plan.destacada;
              const pricing = PRICING[region][plan.plan];
              const sufijo = pricing.suffix;
              return (
                <div
                  key={plan.plan}
                  className={`relative flex flex-col p-7 md:p-9 ${
                    d ? "bg-tinta text-hueso border border-hueso/20" : "bg-hueso text-tinta border border-niebla"
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
                      {pricing.display}
                    </span>
                    {sufijo && (
                      <span className={`font-body text-sm ${d ? "text-hueso/70" : "text-piedra"}`}>
                        {sufijo}
                      </span>
                    )}
                  </div>
                  <p className={`font-display-italic text-base mb-10 ${d ? "text-hueso" : "text-tinta"}`}>
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

          <p className="font-body text-sm text-hueso/50 mt-8">
            ¿Tenés un código de referido? Ingresalo en el checkout para obtener 15% de descuento en tu primer PayRank.
          </p>

          <div className="mt-24 border-t border-hueso/20 pt-16">
            <div className="bg-hueso text-tinta border border-niebla p-8 md:p-12">
              <p className="font-ui text-[10px] text-piedra mb-8">SEGÚN TU SITUACIÓN</p>

              <p className="font-display-italic text-3xl md:text-5xl text-tinta mb-14 max-w-3xl">
                Hasta ahora, tomabas estas decisiones a ciegas.<br />
                PayRank te da el dato que te faltaba.
              </p>

              <div className="flex flex-col divide-y divide-niebla">
                {[
                  { n: "01", situacion: "Evaluás si tu sueldo es competitivo", incluye: "Tu número exacto + argumentos de negociación + impacto de IA en tu rol" },
                  { n: "02", situacion: "Vas a pedir un aumento o una revisión salarial", incluye: "Script según el tipo de negociación (inflación, funciones nuevas, cambio de nivel)" },
                  { n: "03", situacion: "Estás en búsqueda activa o con una oferta sobre la mesa", incluye: "Tu rango de expectativa salarial para la entrevista — y si ya tenés oferta, el veredicto: aceptar, negociar o rechazar" },
                  { n: "04", situacion: "Pensás en tu próximo salto de carrera", incluye: "Tu CV antes/después + hoja de ruta según hacia dónde vas" },
                  { n: "05", situacion: "Evaluás tu competitividad como contractor", incluye: "Tu equivalente real de mercado, considerando lo que debería poder cubrir tu contrato" },
                  { n: "06", situacion: "Querés definir tu tarifa por hora o proyecto (próximamente)", incluye: "Tu tarifa recomendada con argumento de mercado — sumate a la lista de espera" },
                ].map((row) => (
                  <div key={row.n} className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-4 md:gap-8 py-8 items-start">
                    <p className="font-display text-3xl md:text-4xl" style={{ color: "#2E4A6E" }}>{row.n}</p>
                    <p className="font-body text-lg md:text-xl text-tinta leading-snug">{row.situacion}</p>
                    <p className="font-body text-base text-piedra leading-relaxed">{row.incluye}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referidos */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-16 md:py-20">
        <div className="mx-auto max-w-4xl border-t border-niebla pt-16">
          <p className="font-ui text-[10px] text-piedra mb-4">PROGRAMA DE REFERIDOS</p>
          <h2 className="font-display text-3xl md:text-5xl mb-6">
            Compartí. Y el próximo <span className="font-display-italic">es tuyo.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-10 mt-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="font-display text-4xl text-piedra leading-none">1</span>
                <div>
                  <p className="font-body font-semibold text-tinta mb-1">Compartís tu link único</p>
                  <p className="font-body text-sm text-piedra leading-relaxed">
                    Cada PayRank completado incluye un link personal de referido que podés compartir con colegas o en redes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-display text-4xl text-piedra leading-none">2</span>
                <div>
                  <p className="font-body font-semibold text-tinta mb-1">Ellos obtienen 15% de descuento</p>
                  <p className="font-body text-sm text-piedra leading-relaxed">
                    Cada persona que haga su PayRank usando tu link recibe 15% de descuento automático en su primer análisis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-display text-4xl text-piedra leading-none">3</span>
                <div>
                  <p className="font-body font-semibold text-tinta mb-1">Con 3 referidos, el próximo es gratis</p>
                  <p className="font-body text-sm text-piedra leading-relaxed">
                    Cuando tres personas completan su PayRank usando tu link, tu próximo análisis no te cuesta nada.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-tinta text-hueso p-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-4">EN RESUMEN</p>
                <p className="font-display-italic text-2xl text-hueso leading-snug mb-6">
                  "Si tres personas hacen su PayRank con tu link, el próximo es tuyo — gratis."
                </p>
                <p className="font-body text-sm text-hueso/70">
                  Tu link único aparece al final de tu reporte, una vez que completás tu PayRank.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="bg-hueso text-tinta px-5 md:px-10 pb-24">
        <div className="mx-auto max-w-4xl border-t border-niebla pt-20">
          <p className="font-ui text-[10px] text-piedra mb-4">METODOLOGÍA</p>
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

// ─── EN Landing ─────────────────────────────────────────────────────────────

function LandingEN() {
  const { region } = useRegion();
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      {/* Hero */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-36 px-5 md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="font-ui text-[10px] md:text-[11px] text-hueso/60 mb-8">
            PROFESSIONAL SALARY INTELLIGENCE
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] md:text-7xl md:leading-[1.02] tracking-tight text-hueso mb-8">
            The other side of the table<br />
            already knows<br />
            <span className="font-display-italic">what you're worth.</span><br />
            Now you do too.
          </h1>
          <p className="font-body text-lg md:text-xl text-hueso/70 max-w-2xl mb-14 leading-relaxed">
            Your market value is a precise number — built from your specific experience,
            role, industry, and the real impact of AI on what your profile is worth today.
            PayRank gives you that number, and what to do with it.
          </p>

          <ul className="space-y-4 mb-14 max-w-2xl">
            {affirmationsEN.map((a) => (
              <li key={a} className="flex items-start gap-4 font-body text-base md:text-lg text-hueso/85">
                <span className="font-display text-lg leading-none mt-1 shrink-0" style={{ color: "#2E4A6E" }}>—</span>
                <span className="whitespace-pre-line">{a}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/modo"
            className="inline-flex items-center gap-3 bg-hueso text-tinta px-8 py-4 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
          >
            RUN MY PAYRANK →
          </Link>

          <p className="mt-10 font-body text-sm text-hueso/50 max-w-xl">
            The information that changes the conversation.
          </p>
        </div>
      </section>

      {/* Source comparison */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-piedra mb-4">WHY THE SOURCE MATTERS</p>
          <h2 className="font-display text-3xl md:text-5xl mb-6">
            Why the <span className="font-display-italic">source</span> matters
          </h2>
          <p className="font-body text-lg md:text-xl text-piedra mb-6 max-w-2xl leading-relaxed">
            What you find for free.<br />What you actually need.
          </p>
          <p className="font-body text-base text-tinta/80 mb-14 max-w-2xl leading-relaxed">
            Every salary data source available today has the same problem: it shows you what
            others want you to see — not what your profile is actually worth in the market.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column — Free */}
            <div className="bg-hueso border border-niebla p-7 md:p-9 flex flex-col">
              <p className="font-ui text-[10px] text-piedra mb-3">FREE</p>
              <p className="font-body text-sm text-tinta mb-6">
                LinkedIn Salary · Glassdoor · ChatGPT · Levels.fyi · Indeed
              </p>

              <div className="bg-fondo2 p-5 mb-6 font-mono text-xs text-tinta/80 leading-relaxed">
                <p className="mb-3 text-tinta">
                  What should a Marketing Director in consumer goods with 8 years of experience earn?
                </p>
                <p className="text-piedra">
                  → "Salaries for that role typically range from $90,000 to $175,000 per year depending on company size and scope. At Fortune 500 companies it may be higher."
                </p>
              </div>

              <ul className="space-y-4 font-body text-sm text-tinta/85">
                {([
                  ["Range too wide to be useful — a $90K gap doesn't tell you where you stand", "all sources"],
                  ["Self-reported data with no verification — what people claim to earn, not what they do", "LinkedIn Salary · Glassdoor"],
                  ["Shows what companies choose to disclose, not what the market actually pays", "Levels.fyi · Indeed"],
                  ["No adjustment for your real profile — same range for a 2-year hire and a 10-year veteran", "ChatGPT · search tools"],
                  ["No market position: you don't know if that number is good or bad for your level", "all sources"],
                  ["No argument — you have a number but nothing to say when they push back", "all sources"],
                ] as [string, string][]).map(([text, source]) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="font-display text-base shrink-0" style={{ color: "#4A1F1F" }}>✕</span>
                    <span>
                      {text}
                      <span className="block text-xs text-piedra mt-0.5">({source})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column — Your PayRank */}
            <div className="bg-tinta text-hueso p-7 md:p-9 flex flex-col">
              <p className="font-ui text-[10px] mb-3 text-hueso">YOUR PAYRANK</p>
              <div className="font-body text-sm text-hueso mb-8 leading-relaxed">
                <p>PayRank · Report #PR-0047</p>
                <p>Marketing Director · Consumer Goods · NYC Metro</p>
                <p>F500 · National scope · 8 years</p>
              </div>

              <div className="mb-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-2">YOUR MARKET VALUE</p>
                <p className="font-display text-3xl md:text-4xl text-hueso mb-2">
                  USD 11,200 <span className="font-body text-base text-hueso/70">gross monthly · P50</span>
                </p>
                <p className="font-body text-sm text-hueso/80 leading-relaxed">
                  Your current comp is USD 9,400. You're leaving USD 1,800 on the table every month.
                </p>
              </div>

              <div className="mb-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-3">YOUR MARKET POSITION</p>
                <div className="relative h-2 bg-hueso/15 mb-2">
                  <div className="absolute left-0 top-0 h-full bg-hueso/40" style={{ width: "75%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-hueso" style={{ left: "50%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full" style={{ left: "75%", backgroundColor: "#2E4A6E" }} />
                </div>
                <div className="flex justify-between font-ui text-[9px] text-hueso/60 mb-3">
                  <span>BOTTOM 25%</span>
                  <span>MEDIAN 11,200</span>
                  <span>TOP 25% · 14,800</span>
                  <span>TOP 10% · 19,200</span>
                </div>
                <p className="font-body text-sm leading-relaxed" style={{ color: "#DDE4EE" }}>
                  With national scope and AI adoption, you rank in the top 25% of the market. Your current salary sits at the median.
                </p>
              </div>

              <div className="mb-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-2">GENDER GAP DETECTED</p>
                <p className="font-body text-sm text-hueso/85 leading-relaxed">
                  In consumer goods at this level, the average gap is 19%. Potential impact: up to USD 27,400 per year.
                </p>
              </div>

              <div>
                <p className="font-ui text-[10px] text-hueso/60 mb-2">YOUR NEGOTIATION ARGUMENT</p>
                <p className="font-display-italic text-base text-hueso leading-relaxed">
                  "My profile with national scope and AI adoption ranks in the top 25% of the market. The benchmark for this level is USD 14,800. I'm asking for USD 14,200."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              to="/modo"
              className="inline-flex items-center gap-3 bg-tinta text-hueso px-8 py-4 font-ui text-[11px] hover:bg-tinta/90 transition-colors"
            >
              RUN MY PAYRANK →
            </Link>
          </div>
        </div>
      </section>

      {/* 4-step process */}
      <section className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28 border-t border-hueso/15">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">THE PROCESS</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            Four steps. One <span className="font-display-italic">exact number.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                n: "01",
                titulo: "Choose what you need to solve.",
                texto: "A raise, a new offer, a promotion, or setting your rate. Pick the scenario that matches your next move.",
                tag: "TAILORED TO YOU",
              },
              {
                n: "02",
                titulo: "Complete your profile.",
                texto: "Answer a few focused questions. The AI infers the rest — your industry, scope, seniority, and the factors that actually move compensation.",
                tag: "AI-ASSISTED",
              },
              {
                n: "03",
                titulo: "PayRank® Professional Salary Intelligence",
                texto: "We apply the same compensation adjustments used by global consultancies — scope, leadership, languages, AI adoption — against real market data.",
                tag: "PAYRANK METHODOLOGY",
              },
              {
                n: "04",
                titulo: "Get your complete diagnostic.",
                texto: "Your real market position, and the concrete argument for your next conversation — whether you negotiate, accept, or decide your next step.",
                tag: "READY TO USE IMMEDIATELY",
              },
            ].map((c) => (
              <div key={c.n} className="bg-tinta border border-hueso/15 p-7 md:p-9 flex flex-col">
                <p className="font-display text-5xl md:text-6xl text-[#C4BFB8] mb-6">{c.n}</p>
                <h3 className="font-display text-2xl text-hueso mb-4">{c.titulo}</h3>
                <p className="font-body text-sm text-hueso/70 leading-relaxed mb-8 flex-1">{c.texto}</p>
                <p className="font-ui text-[10px] text-hueso border-t border-hueso/15 pt-4">{c.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early access banner */}
      <section className="bg-hueso border-t border-b border-niebla/60 py-6 px-5 md:px-10">
        <p
          className="text-center font-ui text-[12px] uppercase tracking-[3px]"
          style={{ color: "#2E4A6E" }}
        >
          EARLY ACCESS · AVAILABLE NOW
        </p>
      </section>

      {/* Plans */}
      <section id="precios" className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANS</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            One PayRank changes <span className="font-display-italic">the conversation.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planesEN.map((plan) => {
              const d = plan.destacada;
              const pricing = PRICING[region][plan.plan];
              const suffix = pricing.suffix === "/año" ? "/yr" : pricing.suffix;
              return (
                <div
                  key={plan.plan}
                  className={`relative flex flex-col p-7 md:p-9 ${
                    d ? "bg-tinta text-hueso border border-hueso/20" : "bg-hueso text-tinta border border-niebla"
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
                      {pricing.display}
                    </span>
                    {suffix && (
                      <span className={`font-body text-sm ${d ? "text-hueso/70" : "text-piedra"}`}>
                        {suffix}
                      </span>
                    )}
                  </div>
                  <p className={`font-display-italic text-base mb-10 ${d ? "text-hueso" : "text-tinta"}`}>
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

          <p className="font-body text-sm text-hueso/50 mt-16">
            Have a referral code? Enter it at checkout for 15% off your first PayRank.
          </p>

          <div className="mt-24 border-t border-hueso/20 pt-16">
            <div className="bg-hueso text-tinta border border-niebla p-8 md:p-12">
              <p className="font-ui text-[10px] text-piedra mb-8">BASED ON YOUR SITUATION</p>

              <p className="font-display-italic text-3xl md:text-5xl text-tinta mb-14 max-w-3xl">
                Until now, you made these decisions blind.<br />
                PayRank gives you the data you were missing.
              </p>

              <div className="flex flex-col divide-y divide-niebla">
                {[
                  { n: "01", situacion: "You're checking if your pay is competitive", incluye: "Your exact number + negotiation arguments + AI's impact on your role" },
                  { n: "02", situacion: "You're asking for a raise or a salary review", incluye: "A script based on your negotiation type (inflation, expanded responsibilities, level change)" },
                  { n: "03", situacion: "You're job searching or have an offer on the table", incluye: "Your target salary range for the interview — and if you already have an offer, the verdict: accept, negotiate, or walk away" },
                  { n: "04", situacion: "You're planning your next career move", incluye: "Your resume before/after + a roadmap based on where you're headed" },
                  { n: "05", situacion: "You're checking your competitiveness as a contractor", incluye: "Your real market equivalent, based on what your contract should actually cover" },
                  { n: "06", situacion: "You want to set your hourly or project rate (coming soon)", incluye: "Your recommended rate with market backing — join the waitlist" },
                ].map((row) => (
                  <div key={row.n} className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-4 md:gap-8 py-8 items-start">
                    <p className="font-display text-3xl md:text-4xl" style={{ color: "#2E4A6E" }}>{row.n}</p>
                    <p className="font-body text-lg md:text-xl text-tinta leading-snug">{row.situacion}</p>
                    <p className="font-body text-base text-piedra leading-relaxed">{row.incluye}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral program */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-16 md:py-20">
        <div className="mx-auto max-w-4xl border-t border-niebla pt-16">
          <p className="font-ui text-[10px] text-piedra mb-4">REFER A COLLEAGUE</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Share it. Your next one <span className="font-display-italic">is on us.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-10 mt-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="font-display text-4xl text-piedra leading-none">1</span>
                <div>
                  <p className="font-body font-semibold text-tinta mb-1">Share your unique link</p>
                  <p className="font-body text-sm text-piedra leading-relaxed">
                    Every completed PayRank includes a personal referral link you can share with colleagues or on LinkedIn.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-display text-4xl text-piedra leading-none">2</span>
                <div>
                  <p className="font-body font-semibold text-tinta mb-1">They get 15% off</p>
                  <p className="font-body text-sm text-piedra leading-relaxed">
                    Anyone who runs their PayRank with your link gets an automatic 15% discount on their first report.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-display text-4xl text-piedra leading-none">3</span>
                <div>
                  <p className="font-body font-semibold text-tinta mb-1">Three referrals, yours is free</p>
                  <p className="font-body text-sm text-piedra leading-relaxed">
                    Once three people complete their PayRank through your link, your next one costs nothing.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-tinta text-hueso p-8">
                <p className="font-ui text-[10px] text-hueso/60 mb-4">THE SHORT VERSION</p>
                <p className="font-display-italic text-2xl text-hueso leading-snug mb-6">
                  "Three people run their PayRank through your link — your next one is free."
                </p>
                <p className="font-body text-sm text-hueso/70">
                  Your unique link appears at the end of your report, once you complete your PayRank.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="metodologia" className="bg-hueso text-tinta px-5 md:px-10 pb-24">
        <div className="mx-auto max-w-4xl border-t border-niebla pt-20">
          <p className="font-ui text-[10px] text-piedra mb-4">METHODOLOGY</p>
          <h2 className="font-display text-3xl md:text-5xl mb-10">
            The same intelligence firms charge<br />
            <span className="font-display-italic">thousands for.</span> Built for you.
          </h2>
          <div className="font-body text-piedra leading-relaxed space-y-8 max-w-2xl">
            <p>
              PayRank uses the same methodology as global compensation consultancies —
              Mercer, WTW, Korn Ferry — applied to your specific profile. Not an average.
              Not a database lookup. A diagnosis built from your experience, your industry,
              your company tier, and your role's real complexity — including what AI is doing
              to its market value right now.
            </p>
            <p className="font-display-italic text-3xl md:text-5xl text-tinta my-12 md:my-16 leading-tight">
              PayRank gives you that number.
            </p>
            <p>
              Not with internet averages. With the same rigor used to build global
              compensation surveys — calibrated to your scope, your level, and your market.
            </p>
            <p>
              So the next conversation happens with real data on your side.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
