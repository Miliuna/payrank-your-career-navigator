import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayRank — Professional Salary Intelligence" },
      { name: "description", content: "Your market value is a precise number — built from your specific experience, role, industry, and the real impact of AI on what your profile is worth today. PayRank gives you that number, and what to do with it." },
      { property: "og:title", content: "PayRank — Professional Salary Intelligence" },
      { property: "og:description", content: "The other side of the table already knows what you're worth. Now you do too." },
    ],
  }),
  component: Landing,
});

const affirmations = [
  "Your company ran a salary benchmark on your role.\nThat number shaped your last raise.\nAnd the one before that.",
  "That offer on the table didn't come from thin air.\nThey benchmarked your profile before they wrote it.",
  "The gender pay gap in your industry isn't a statistic.\nIt's a monthly number with your name on it.",
  "Walking into any salary conversation without\nmarket data isn't negotiating. It's guessing.",
];

const situations = [
  {
    id: "A",
    label: "Am I being paid competitively?",
    description:
      "You're employed. You want to know where you actually stand in the market. No guessing.",
  },
  {
    id: "B",
    label: "I want to ask for a raise or review",
    description:
      "You're ready to have the conversation. PayRank gives you the number, the strategy, and the exact script.",
  },
  {
    id: "C",
    label: "I have an offer or interview",
    description:
      "You have an offer or you're heading into an interview. Know your floor, your ceiling, and what to say when they ask.",
  },
  {
    id: "D",
    label: "I'm planning my next career move",
    description:
      "You're building your next move. Know how the market reads your profile today and what changes your range tomorrow.",
  },
];

const planes = [
  {
    nombre: "GO",
    precio: "USD 39",
    sufijo: undefined as string | undefined,
    descripcion: "1 PayRank. Any situation. No expiration.",
    cta: "START WITH GO",
    plan: "unico" as const,
    destacada: false,
  },
  {
    nombre: "PLUS",
    precio: "USD 99",
    sufijo: undefined as string | undefined,
    descripcion: "3 PayRanks. Any situation. No expiration. Save 20%.",
    cta: "START WITH PLUS",
    plan: "pack3" as const,
    destacada: true,
    badge: "MOST CHOSEN",
  },
  {
    nombre: "PRO",
    precio: "USD 149",
    sufijo: "/yr",
    descripcion: "Unlimited PayRanks + market movement alerts for your industry.",
    cta: "START WITH PRO",
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
            {affirmations.map((a) => (
              <li key={a} className="flex items-start gap-4 font-body text-base md:text-lg text-hueso/85">
                <span className="mt-2 size-1.5 rounded-full bg-hueso shrink-0" />
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
        </div>
      </section>

      {/* Situations Selector */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            What brings you <span className="font-display-italic">here today?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {situations.map((s) => (
              <Link
                key={s.id}
                to="/modo"
                className="group border border-niebla p-7 md:p-9 flex flex-col hover:border-tinta transition-colors"
              >
                <p className="font-ui text-[10px] text-piedra mb-3">{s.id}</p>
                <p className="font-display text-xl md:text-2xl text-tinta mb-4">
                  {s.label}
                </p>
                <p className="font-body text-sm text-piedra leading-relaxed">
                  {s.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="metodologia" className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">METHODOLOGY</p>
          <h2 className="font-display text-3xl md:text-5xl mb-10">
            The same intelligence firms charge<br />
            <span className="font-display-italic">thousands for.</span> Built for you.
          </h2>
          <p className="font-body text-lg md:text-xl text-hueso/70 max-w-2xl leading-relaxed">
            PayRank uses the same methodology as global compensation consultancies — Mercer,
            WTW, Korn Ferry — applied to your specific profile. Not an average. Not a database
            lookup. A diagnosis built from your experience, your industry, your company tier,
            and your role's real complexity — including what AI is doing to its market value
            right now.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section id="precios" className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-piedra mb-4">PLANS</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            One PayRank changes <span className="font-display-italic">the conversation.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planes.map((plan) => {
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
                  <p className={`font-body text-sm leading-relaxed mb-10 flex-1 ${d ? "text-hueso/80" : "text-piedra"}`}>
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
        </div>
      </section>

      {/* Gender Gap */}
      <section className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl md:text-5xl mb-10">
            The pay gap in your field is real.<br />
            <span className="font-display-italic">PayRank shows you exactly where you stand.</span>
          </h2>
          <p className="font-body text-lg md:text-xl text-hueso/70 max-w-2xl leading-relaxed">
            If you choose to include gender in your PayRank, we show you the documented gap in
            your industry and seniority level — and give you the specific arguments to close it.
          </p>
        </div>
      </section>

      {/* Trust Block */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-display text-xl md:text-2xl text-tinta mb-4">
            Methodologically rigorous. Completely confidential.
          </p>
          <p className="font-body text-base text-piedra max-w-lg mx-auto leading-relaxed">
            Your data is never sold, shared, or used to identify you. Ever.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
