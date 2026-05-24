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

const planes = [
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
    precio: "USD 149",
    sufijo: "/yr",
    italic: "For when you want PayRank in your corner all year.",
    descripcion:
      "Unlimited PayRanks + automatic market updates when your sector moves — so you never negotiate with stale data.",
    cta: "START WITH PRO",
    plan: "anual" as const,
    destacada: false,
  },
];

const freeFlaws = [
  ["Range too wide to be useful — a $90K gap doesn't tell you where you stand", "all sources"],
  ["Self-reported data with no verification — what people claim to earn, not what they do", "LinkedIn Salary · Glassdoor"],
  ["Shows what companies choose to disclose, not what the market actually pays", "Levels.fyi · Indeed"],
  ["No adjustment for your real profile — same range for a 2-year hire and a 10-year veteran", "ChatGPT · search tools"],
  ["No market position: you don't know if that number is good or bad for your level", "all sources"],
  ["No argument — you have a number but nothing to say when they push back", "all sources"],
] as [string, string][];

const steps = [
  {
    n: "01",
    titulo: "Your profile in seconds",
    texto:
      "Answer 4 questions. The AI infers the rest — your industry, scope, seniority level — without asking for what it can already figure out.",
    tag: "AI-ASSISTED",
  },
  {
    n: "02",
    titulo: "PayRank runs the analysis",
    texto:
      "We apply the same compensation adjustments used by global consultancies — scope, leadership, languages, AI adoption — against real market data.",
    tag: "GLOBAL CONSULTING METHODOLOGY",
  },
  {
    n: "03",
    titulo: "Your complete report",
    texto:
      "Market position, gender gap if it applies, total compensation range, and the exact argument for your next conversation — in under three minutes.",
    tag: "READY TO USE IMMEDIATELY",
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
                  What should a Marketing Director in consumer goods in New York with 8 years of experience earn?
                </p>
                <p className="text-piedra">
                  → "Salaries for that role typically range from $90,000 to $175,000 per year depending on company size and scope. At Fortune 500 companies it may be higher."
                </p>
              </div>

              <ul className="space-y-4 font-body text-sm text-tinta/85">
                {freeFlaws.map(([text, source]) => (
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
              <p className="font-ui text-[10px] mb-3" style={{ color: "#2E4A6E" }}>YOUR PAYRANK</p>
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

      {/* 3-step process */}
      <section className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28 border-t border-hueso/15">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">THE PROCESS</p>
          <h2 className="font-display text-3xl md:text-5xl mb-14">
            Three minutes. Your <span className="font-display-italic">exact number.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((c) => (
              <div key={c.n} className="bg-tinta border border-hueso/15 p-7 md:p-9 flex flex-col">
                <p className="font-display text-5xl md:text-6xl text-[#C4BFB8] mb-6">{c.n}</p>
                <h3 className="font-display text-2xl text-hueso mb-4">{c.titulo}</h3>
                <p className="font-body text-sm text-hueso/70 leading-relaxed mb-8 flex-1">{c.texto}</p>
                <p className="font-ui text-[10px] text-[#2E4A6E] border-t border-hueso/15 pt-4">{c.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-hueso text-tinta px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-display text-5xl md:text-7xl mb-4" style={{ color: "#1A2B45" }}>+1,200</p>
          <p className="font-ui text-[11px] uppercase tracking-widest mb-6 max-w-lg mx-auto" style={{ color: "#5A5550" }}>
            PROFESSIONALS WHO NOW KNOW EXACTLY WHAT THEIR PROFILE IS WORTH — AND WHAT TO DO ABOUT IT
          </p>
          <p className="font-body text-base max-w-[480px] mx-auto mb-10 leading-relaxed" style={{ color: "#5A5550" }}>
            Most found out in under three minutes.
          </p>
          <Link
            to="/modo"
            className="inline-flex items-center gap-3 bg-tinta text-hueso px-8 py-4 font-ui text-[11px] hover:bg-tinta/90 transition-colors"
          >
            RUN MY PAYRANK →
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section id="precios" className="bg-tinta text-hueso px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-ui text-[10px] text-hueso/60 mb-4">PLANS</p>
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

          {/* Comparison table */}
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
                    <td className="py-4 px-4">USD 149/yr</td>
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
