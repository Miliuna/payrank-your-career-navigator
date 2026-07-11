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
      "1 PayRank.\n\nCuando ya sabés qué necesitás resolver — una negociación puntual, una decisión que no puede esperar — un PayRank te da el número exacto para esa conversación.",
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
                  <p className={`font-display-italic text-base mb-10 min-h-12 ${d ? "text-hueso" : "text-tinta"}`}>
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
            <div className="bg-hueso text-tinta border border-niebla p-8 md:p-12">
              <p className="font-ui text-[10px] text-piedra mb-8">SEGÚN TU SITUACIÓN</p>

              <p className="font-display-italic text-3xl md:text-5xl text-tinta mb-14 max-w-5xl">
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
                  <p className={`font-display-italic text-base mb-10 min-h-12 ${d ? "text-hueso" : "text-tinta"}`}>
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
            <div className="bg-hueso text-tinta border border-niebla p-8 md:p-12">
              <p className="font-ui text-[10px] text-piedra mb-8">BASED ON YOUR SITUATION</p>

              <p className="font-display-italic text-3xl md:text-5xl text-tinta mb-14 max-w-5xl">
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

      <SiteFooter />
    </div>
  );
}
