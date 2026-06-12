import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useDiagnostico, clearDiagnosticoStorage } from "@/lib/diagnostico/store";
import { useLang } from "@/lib/lang";
import type { Modo, Plan } from "@/lib/diagnostico/types";

type Search = { plan?: Plan };

export const Route = createFileRoute("/modo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    plan: (s.plan === "unico" || s.plan === "pack3" || s.plan === "anual") ? s.plan : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Elegí tu situación — PayRank" },
      { name: "description", content: "Cuatro situaciones de diagnóstico salarial. Elegí la tuya." },
    ],
  }),
  component: ModoSelector,
});

const situacionesES: { id: Modo; titulo: string; descripcion: string }[] = [
  {
    id: "A",
    titulo: "Quiero saber si me pagan en forma competitiva",
    descripcion: "Analizamos tu perfil completo y te decimos exactamente dónde quedás en el mercado — con datos reales, no promedios de internet.",
  },
  {
    id: "B",
    titulo: "Quiero pedir un aumento o una revisión salarial",
    descripcion: "Tu PayRank puede mostrar una brecha entre tu alcance real y lo que te pagan. Te damos los argumentos y el script para esa conversación.",
  },
  {
    id: "C",
    titulo: "Estoy en búsqueda, tengo una entrevista o recibí una oferta",
    descripcion: "Sabé exactamente cuánto pedir, cómo fundamentarlo y qué decir cuando te pregunten cuánto querés ganar.",
  },
  {
    id: "D",
    titulo: "Quiero dar mi próximo salto de carrera",
    descripcion: "Tu PayRank te muestra dónde estás hoy, qué habilidades aumentan tu valor y qué necesitás demostrar para llegar al siguiente nivel.",
  },
];

const situacionesEN: { id: Modo; titulo: string; descripcion: string }[] = [
  {
    id: "A",
    titulo: "I want to know if I'm being paid competitively",
    descripcion: "We analyze your full profile and tell you exactly where you stand in the market — with real data, not internet averages.",
  },
  {
    id: "B",
    titulo: "I want to ask for a raise or salary review",
    descripcion: "Your PayRank can show a gap between your real scope and what you're paid. We give you the arguments and the script for that conversation.",
  },
  {
    id: "C",
    titulo: "I'm job searching, have an interview, or received an offer",
    descripcion: "Know exactly what to ask for, how to justify it, and what to say when asked how much you want to earn.",
  },
  {
    id: "D",
    titulo: "I want to take my next career leap",
    descripcion: "Your PayRank shows you where you are today, what skills increase your value, and what you need to demonstrate to reach the next level.",
  },
];

function ModoSelector() {
  const { plan } = Route.useSearch();
  const { setState, reset } = useDiagnostico();
  const { lang } = useLang();
  const isEN = lang === "EN";
  const situaciones = isEN ? situacionesEN : situacionesES;

  React.useEffect(() => {
    clearDiagnosticoStorage();
    reset();
  }, []);
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />

      <section className="pt-32 md:pt-44 pb-20 md:pb-28 px-5 md:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="font-ui text-[10px] text-piedra mb-6">{isEN ? "Step 1 of 4" : "Paso 1 de 4"}</p>
          <h1 className="font-display text-4xl md:text-6xl mb-5 leading-tight">
            {isEN
              ? <>What do you want to do <span className="font-display-italic">today</span>?</>
              : <>¿Qué querés hacer <span className="font-display-italic">hoy</span>?</>}
          </h1>
          <p className="font-body text-base md:text-lg text-piedra max-w-2xl mb-14">
            {isEN
              ? "Choose your situation. Your PayRank adapts exactly to what you need."
              : "Elegí tu situación. Tu PayRank se adapta exactamente a lo que necesitás."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {situaciones.map((s) => (
              <Link
                key={s.id}
                to="/diagnostico/upload"
                search={{ modo: s.id }}
                onClick={() => {
                  setState((st) => ({
                    ...st,
                    modo: s.id,
                    plan: plan ?? st.plan,
                  }));
                }}
                className="group relative bg-card border border-niebla p-7 md:p-9 hover:border-tinta transition-all hover:shadow-[0_0_0_1px_var(--tinta)] flex flex-col"
              >
                <h2 className="font-display text-2xl md:text-3xl mb-4 leading-tight">{s.titulo}</h2>
                <p className="font-body text-piedra leading-relaxed mb-10">{s.descripcion}</p>
                <span className="mt-auto font-ui text-[11px] inline-flex items-center gap-2 text-tinta border-t border-niebla pt-4 group-hover:border-tinta transition-colors">
                  {isEN ? "Continue" : "Continuar"} <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
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
