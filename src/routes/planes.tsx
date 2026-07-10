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

          <div className="mt-24 border-t border-hueso/20 pt-16">
            <p className="font-ui text-[10px] text-hueso/60 mb-8">EN DETALLE</p>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-hueso/20">
                    <th className="text-left py-4 pr-4 font-ui text-[10px] text-hueso/60 w-1/3"></th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso">GO</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso">PLUS</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso">PRO</th>
                  </tr>
                </thead>
                <tbody className="text-hueso">
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Precio</td>
                    <td className="py-4 px-4">{prices.unico.display}</td>
                    <td className="py-4 px-4">{prices.pack3.display}</td>
                    <td className="py-4 px-4">{prices.anual.display}{prices.anual.suffix ?? ""}</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">PayRank incluidos</td>
                    <td className="py-4 px-4">1</td>
                    <td className="py-4 px-4">3</td>
                    <td className="py-4 px-4">Hasta 12 por año (1 por mes)</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Análisis completo</td>
                    <td className="py-4 px-4">✓</td>
                    <td className="py-4 px-4">✓</td>
                    <td className="py-4 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-hueso/70">Alertas cuando tu mercado se mueve</td>
                    <td className="py-4 px-4">Email</td>
                    <td className="py-4 px-4">Email + 1 update gratis</td>
                    <td className="py-4 px-4">Update automática</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="font-display-italic text-base text-hueso/70 mt-8 max-w-2xl">
              La mayoría de quienes están en búsqueda activa o atravesando una negociación terminan necesitando más de un PayRank. El plan PLUS está diseñado para eso.
            </p>
            <p className="font-body text-sm text-hueso/50 mt-4">
              ¿Tenés un código de referido? Ingresalo en el checkout para obtener 15% de descuento en tu primer PayRank.
            </p>
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
            <p className="font-ui text-[10px] text-hueso/60 mb-8">IN DETAIL</p>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-hueso/20">
                    <th className="text-left py-4 pr-4 font-ui text-[10px] text-hueso/60 w-1/3"></th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso">GO</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso">PLUS</th>
                    <th className="text-left py-4 px-4 font-ui text-[10px] text-hueso">PRO</th>
                  </tr>
                </thead>
                <tbody className="text-hueso">
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Price</td>
                    <td className="py-4 px-4">{prices.unico.display}</td>
                    <td className="py-4 px-4">{prices.pack3.display}</td>
                    <td className="py-4 px-4">{prices.anual.display}{prices.anual.suffix ?? ""}</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">PayRanks included</td>
                    <td className="py-4 px-4">1</td>
                    <td className="py-4 px-4">3</td>
                    <td className="py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-hueso/20">
                    <td className="py-4 pr-4 text-hueso/70">Full analysis</td>
                    <td className="py-4 px-4">✓</td>
                    <td className="py-4 px-4">✓</td>
                    <td className="py-4 px-4">✓</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-hueso/70">Alerts when your market moves</td>
                    <td className="py-4 px-4">Email</td>
                    <td className="py-4 px-4">Email + 1 free update</td>
                    <td className="py-4 px-4">Automatic update</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="font-display-italic text-base text-hueso/70 mt-8 max-w-2xl">
              Most professionals working a job search or negotiation end up needing more than one PayRank. PLUS is built for that.
            </p>
            <p className="font-body text-sm text-hueso/50 mt-4">
              Have a referral code? Enter it at checkout for 15% off your first PayRank.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
