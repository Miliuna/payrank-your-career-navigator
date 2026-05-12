import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Check } from "lucide-react";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodología — PayRank" },
      { name: "description", content: "Existe un número exacto para tu puesto, tu industria y tu momento. PayRank te lo dice." },
    ],
  }),
  component: Metodologia,
});

const PASOS = [
  {
    n: "01",
    titulo: "Aportás tu información",
    texto:
      "Subís tu CV, tu recibo de sueldo o el aviso al que te postulás. O completás el formulario guiado. La IA extrae los datos que necesita y pregunta solo lo que falta.",
  },
  {
    n: "02",
    titulo: "Analizamos tu perfil completo",
    texto:
      "No solo tu título. Tu alcance real, tus funciones, tu equipo, tu interacción con la dirección, tus idiomas, tus certificaciones y tu adopción de herramientas de IA.",
  },
  {
    n: "03",
    titulo: "Aplicamos criterio compensológico",
    texto:
      "Los mismos ajustes que usan los compensólogos profesionales: alcance regional, liderazgo de equipo, interacción ejecutiva, idiomas requeridos e impacto de la IA en el valor del rol.",
  },
  {
    n: "04",
    titulo: "Recibís tu PayRank",
    texto:
      "Un reporte completo con tu posición en el mercado, tu brecha de género si existe, cuánto pedir, cómo decirlo y tu hoja de ruta al siguiente nivel.",
  },
];

const INCLUYE = [
  "Tu posición exacta en el mercado — con el rango completo y dónde quedás dentro de él",
  "Compensación total valorizada — salario más beneficios, comparado con el mercado",
  "Alerta de discrepancia — si tu título subestima el alcance real de tu rol",
  "Análisis de brecha de género — cuantificada en dinero por mes, no en porcentaje abstracto",
  "Cuánto pedir y cómo fundamentarlo — con floor y ceiling de negociación",
  "Script exacto para tu conversación — adaptado a tu situación y tu país",
  "Habilidades que aumentan tu valor — con impacto estimado en el rango",
  "Hoja de ruta al siguiente nivel — qué necesitás demostrar para el próximo salto de carrera",
];

function SectionLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`font-ui text-[10px] mb-10 ${dark ? "text-niebla" : "text-piedra"}`}
    >
      {children}
    </p>
  );
}

function Metodologia() {
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <SiteHeader />

      {/* SECCIÓN 1 — Hero (Tinta) */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-32 px-5 md:px-10 bg-tinta text-hueso">
        <div className="mx-auto" style={{ maxWidth: "680px" }}>
          <SectionLabel dark>Metodología</SectionLabel>
          <h1 className="font-display text-4xl md:text-6xl mb-12 leading-tight">
            Esto no es una calculadora.
          </h1>

          <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed mb-16 md:mb-20">
            Existe un número exacto para tu puesto, tu industria y tu momento.
            Un número que el mercado ya definió. Que existe independientemente
            de lo que te pagan hoy o de lo que vas a negociar mañana.
          </p>

          <p className="font-display-italic text-5xl md:text-7xl text-hueso text-center my-20 md:my-28 leading-tight">
            PayRank te lo dice.
          </p>

          <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed mb-10">
            No con promedios de internet. Con el mismo rigor con el que se
            construyen las encuestas de compensaciones globales — ajustado a tu
            alcance, tu nivel y tu país.
          </p>

          <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed">
            Para que la próxima conversación ocurra con información real de tu lado.
          </p>
        </div>
      </section>

      {/* SECCIÓN 2 — Cómo funciona (Hueso) */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-hueso text-tinta">
        <div className="mx-auto" style={{ maxWidth: "1080px" }}>
          <SectionLabel>Cómo funciona</SectionLabel>
          <h2 className="font-display text-3xl md:text-5xl mb-16 leading-tight">
            Cuatro pasos.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {PASOS.map((p) => (
              <div
                key={p.n}
                className="bg-hueso border border-niebla p-8 md:p-10 flex flex-col"
              >
                <p className="font-display-italic text-4xl md:text-5xl text-real mb-8">
                  {p.n}
                </p>
                <h3 className="font-display text-2xl md:text-3xl mb-5 leading-tight">
                  {p.titulo}
                </h3>
                <p className="font-body text-base text-tinta/80 leading-relaxed">
                  {p.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 — Qué incluye (Tinta) */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-tinta text-hueso">
        <div className="mx-auto" style={{ maxWidth: "780px" }}>
          <SectionLabel dark>Qué incluye tu PayRank</SectionLabel>
          <h2 className="font-display text-3xl md:text-5xl mb-16 leading-tight">
            Todo lo que necesitás para tu próxima conversación.
          </h2>

          <ul className="space-y-6">
            {INCLUYE.map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <Check
                  className="mt-1 shrink-0"
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: "#2E4A6E" }}
                />
                <p className="font-body text-base md:text-lg text-hueso/90 leading-relaxed">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECCIÓN 4 — Transparencia (Hueso) */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-hueso text-tinta">
        <div className="mx-auto" style={{ maxWidth: "680px" }}>
          <SectionLabel>Transparencia total</SectionLabel>
          <h2 className="font-display text-3xl md:text-5xl mb-12 leading-tight">
            Nivel de confianza, declarado.
          </h2>

          <p className="font-body text-base md:text-lg text-tinta/85 leading-relaxed mb-8">
            Cada PayRank incluye un nivel de confianza declarado explícitamente:
            Alto, Medio o Bajo — con la justificación de por qué.
          </p>

          <p className="font-body text-base md:text-lg text-tinta/85 leading-relaxed mb-8">
            Si los datos disponibles para tu perfil específico son escasos,
            te lo decimos. No inventamos precisión que no podemos sostener.
          </p>

          <p className="font-display-italic text-2xl md:text-3xl text-tinta leading-snug mt-16">
            Eso es lo que nos diferencia de cualquier calculadora.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
