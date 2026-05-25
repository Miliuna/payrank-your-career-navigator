import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes — PayRank" },
      { name: "description", content: "Elegí el PayRank que va con tu momento. Un diagnóstico completo desde USD 29." },
    ],
  }),
  component: Planes,
});

function Planes() {
  const { lang } = useLang();
  if (lang === "EN") return <PlanesEN />;
  return <PlanesES />;
}

// ─── ES ─────────────────────────────────────────────────────────────────────

const planesES = [
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
    precio: "USD 149",
    sufijo: "/año",
    italic: "Para quien quiere que PayRank lo acompañe.",
    descripcion:
      "Hasta 12 PayRanks por año (1 por mes). Más actualización automática cuando tu mercado se mueva — para que nunca negocies con información vieja.\n\nUSD 199/año en USA, UK, Australia y Canadá.",
    cta: "EMPEZAR CON PRO",
    plan: "anual" as const,
    destacada: false,
  },
];

function PlanesES() {
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-24 md:pb-36">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANES</p>
          <h1 className="font-display text-3xl md:text-5xl mb-14">
            Elegí tu <span className="font-display-italic">PayRank</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planesES.map((plan) => {
              const d = plan.destacada;
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
                    <td className="py-4 px-4">USD 29</td>
                    <td className="py-4 px-4">USD 69</td>
                    <td className="py-4 px-4">
                      USD 149/año
                      <span className="text-hueso/50 text-xs block">USD 199/año en USA, UK, Australia y Canadá</span>
                    </td>
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

const planesEN = [
  {
    nombre: "GO",
    precio: "USD 39",
    sufijo: undefined as string | undefined,
    italic: "For when you have one key conversation ahead.",
    descripcion: "1 PayRank. Any situation. No expiration.",
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
      "3 PayRanks. Any situation. No expiration. Save 20%.\n\nMost job searches and negotiations require more than one — one to know your number, one to prep for the interview, one when the offer lands.",
    cta: "START WITH PLUS",
    plan: "pack3" as const,
    destacada: true,
    badge: "MOST CHOSEN",
  },
  {
    nombre: "PRO",
    precio: "USD 199",
    sufijo: "/yr",
    italic: "For when you want PayRank in your corner all year.",
    descripcion:
      "Unlimited PayRanks + automatic market updates when your sector moves — so you never negotiate with stale data.",
    cta: "START WITH PRO",
    plan: "anual" as const,
    destacada: false,
  },
];

function PlanesEN() {
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-24 md:pb-36">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANS</p>
          <h1 className="font-display text-3xl md:text-5xl mb-14">
            One PayRank changes <span className="font-display-italic">the conversation.</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planesEN.map((plan) => {
              const d = plan.destacada;
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
                    <td className="py-4 px-4">USD 39</td>
                    <td className="py-4 px-4">USD 99</td>
                    <td className="py-4 px-4">USD 199/yr</td>
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
