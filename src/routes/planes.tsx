import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLang } from "@/lib/lang";
import { useRegion, PRICING, persistPlanSelection, type Region } from "@/lib/pricing";
import type { Plan } from "@/lib/diagnostico/types";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes — PayRank" },
      { name: "description", content: "Elegí el PayRank que va con tu momento. Diagnóstico completo con precios para tu región." },
    ],
  }),
  component: Planes,
});

function Planes() {
  const { lang } = useLang();
  const { region, ready } = useRegion();
  if (lang === "EN") return <PlanesEN region={region} ready={ready} />;
  return <PlanesES region={region} ready={ready} />;
}

// ─── Plan copy (region-independent) ────────────────────────────────────────

type PlanCopy = {
  nombre: string;
  italic: string;
  descripcion: string;
  cta: string;
  plan: Plan;
  destacada: boolean;
  badge?: string;
};

const COPY_ES: PlanCopy[] = [
  {
    nombre: "GO",
    italic: "Para cuando tenés una conversación puntual por delante.",
    descripcion:
      "1 PayRank completo.\n\nCuando ya sabés qué necesitás resolver — una negociación puntual, una decisión que no puede esperar — un PayRank te da el número exacto para esa conversación.",
    cta: "EMPEZAR CON GO",
    plan: "unico",
    destacada: false,
  },
  {
    nombre: "PLUS",
    italic: "Para cuando estás en movimiento.",
    descripcion:
      "3 PayRank, para usar en los próximos 12 meses.\n\nLa mayoría de los procesos de búsqueda o negociación requieren más de uno — uno para saber cuánto valés, otro para preparar la entrevista, otro cuando llegue la oferta.",
    cta: "EMPEZAR CON PLUS",
    plan: "pack3",
    destacada: true,
    badge: "MÁS ELEGIDO",
  },
  {
    nombre: "PRO",
    italic: "Para cuando el mercado no para — y vos tampoco.",
    descripcion:
      "Hasta 12 por año.\n\nTu revisión anual, tu próxima entrevista, el salto de carrera que no esperabas — PRO te da el número correcto en cada una, durante todo el año.",
    cta: "EMPEZAR CON PRO",
    plan: "anual",
    destacada: false,
  },
];

const COPY_EN: PlanCopy[] = [
  {
    nombre: "GO",
    italic: "For when you have one key conversation ahead.",
    descripcion:
      "1 PayRank.\n\nWhen you already know what you need to solve — a specific negotiation, a decision that can't wait — a PayRank gives you the exact number for that conversation.",
    cta: "START WITH GO",
    plan: "unico",
    destacada: false,
  },
  {
    nombre: "PLUS",
    italic: "For when you're in motion.",
    descripcion:
      "3 PayRanks, to use anytime within the next 12 months. Save 20%.\n\nMost job searches and negotiations require more than one — one to know your number, one to prep for the interview, one when the offer lands.",
    cta: "START WITH PLUS",
    plan: "pack3",
    destacada: true,
    badge: "MOST CHOSEN",
  },
  {
    nombre: "PRO",
    italic: "For when your career doesn't take a year off.",
    descripcion:
      "Up to 12 a year.\n\nYour annual review, your next interview, the career leap you didn't see coming — PRO gives you the right number for each one, all year long.",
    cta: "START WITH PRO",
    plan: "anual",
    destacada: false,
  },
];

const REGION_LABEL_ES: Record<Region, string> = {
  LATAM: "Precios para Latinoamérica",
  ESPANA: "Precios para España",
  INTERNACIONAL: "Precios internacionales (USD)",
};

const REGION_LABEL_EN: Record<Region, string> = {
  LATAM: "Pricing for Latin America",
  ESPANA: "Pricing for Spain",
  INTERNACIONAL: "International pricing (USD)",
};

// ─── ES ─────────────────────────────────────────────────────────────────────

function PlanesES({ region, ready }: { region: Region; ready: boolean }) {
  const prices = PRICING[region];
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-24 md:pb-36">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANES</p>
          <h1 className="font-display text-3xl md:text-5xl mb-6">
            Elegí tu <span className="font-display-italic">PayRank</span>
          </h1>
          <p className="font-ui text-[10px] text-hueso/50 mb-14" aria-live="polite">
            {ready ? REGION_LABEL_ES[region] : "Detectando tu región…"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COPY_ES.map((plan) => {
              const d = plan.destacada;
              const pr = prices[plan.plan];
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
                      {pr.display}
                    </span>
                    {pr.suffix && (
                      <span className={`font-body text-sm ${d ? "text-hueso/70" : "text-piedra"}`}>
                        {pr.suffix}
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
                    onClick={() => persistPlanSelection(plan.plan, region)}
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
            <p className="font-ui text-[10px] text-hueso/60 mb-8">SEGÚN TU SITUACIÓN</p>

            <p className="font-display-italic text-xl md:text-2xl text-hueso mb-10 max-w-3xl">
              Hasta ahora, tomabas estas decisiones a ciegas. PayRank te da el dato que te faltaba, antes de negociar, aceptar o dar el salto.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-hueso/20">
                    <th className="text-left py-4 pr-4 font-ui text-[10px] text-hueso/60 w-2/5">TU SITUACIÓN HOY</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso/60">TU PAYRANK INCLUYE</th>
                  </tr>
                </thead>
                <tbody className="text-hueso">
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Evaluás si tu sueldo es competitivo</td>
                    <td className="py-4 px-4">Tu número exacto + argumentos de negociación + impacto de IA en tu rol</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Vas a pedir un aumento o una revisión salarial</td>
                    <td className="py-4 px-4">Script según el tipo de negociación (inflación, funciones nuevas, cambio de nivel)</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Estás en búsqueda activa o con una oferta sobre la mesa</td>
                    <td className="py-4 px-4">Tu rango de expectativa salarial para la entrevista — y si ya tenés oferta, el veredicto: aceptar, negociar o rechazar</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Pensás en tu próximo salto de carrera</td>
                    <td className="py-4 px-4">Tu CV antes/después + hoja de ruta según hacia dónde vas</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Evaluás tu competitividad como contractor</td>
                    <td className="py-4 px-4">Tu equivalente real de mercado, considerando lo que debería poder cubrir tu contrato</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-hueso/70">Querés definir tu tarifa por hora o proyecto (próximamente)</td>
                    <td className="py-4 px-4">Tu tarifa recomendada con argumento de mercado — sumate a la lista de espera</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── EN ─────────────────────────────────────────────────────────────────────

function PlanesEN({ region, ready }: { region: Region; ready: boolean }) {
  const prices = PRICING[region];
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-24 md:pb-36">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANS</p>
          <h1 className="font-display text-3xl md:text-5xl mb-6">
            One PayRank changes <span className="font-display-italic">the conversation.</span>
          </h1>
          <p className="font-ui text-[10px] text-hueso/50 mb-14" aria-live="polite">
            {ready ? REGION_LABEL_EN[region] : "Detecting your region…"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COPY_EN.map((plan) => {
              const d = plan.destacada;
              const pr = prices[plan.plan];
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
                      {pr.display}
                    </span>
                    {pr.suffix && (
                      <span className={`font-body text-sm ${d ? "text-hueso/70" : "text-piedra"}`}>
                        {pr.suffix}
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
                    onClick={() => persistPlanSelection(plan.plan, region)}
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

          <div className="mt-24 border-t border-hueso/20 pt-16">
            <p className="font-ui text-[10px] text-hueso/60 mb-8">BASED ON YOUR SITUATION</p>

            <p className="font-display-italic text-xl md:text-2xl text-hueso mb-10 max-w-3xl">
              Until now, you made these decisions blind. PayRank gives you the data you were missing — before you negotiate, accept, or take the leap.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-hueso/20">
                    <th className="text-left py-4 pr-4 font-ui text-[10px] text-hueso/60 w-2/5">YOUR SITUATION TODAY</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso/60">YOUR PAYRANK INCLUDES</th>
                  </tr>
                </thead>
                <tbody className="text-hueso">
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">You're checking if your pay is competitive</td>
                    <td className="py-4 px-4">Your exact number + negotiation arguments + AI's impact on your role</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">You're asking for a raise or a salary review</td>
                    <td className="py-4 px-4">A script based on your negotiation type (inflation, expanded responsibilities, level change)</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">You're job searching or have an offer on the table</td>
                    <td className="py-4 px-4">Your target salary range for the interview — and if you already have an offer, the verdict: accept, negotiate, or walk away</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">You're planning your next career move</td>
                    <td className="py-4 px-4">Your resume before/after + a roadmap based on where you're headed</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">You're checking your competitiveness as a contractor</td>
                    <td className="py-4 px-4">Your real market equivalent, based on what your contract should actually cover</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-hueso/70">You want to set your hourly or project rate (coming soon)</td>
                    <td className="py-4 px-4">Your recommended rate with market backing — join the waitlist</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
