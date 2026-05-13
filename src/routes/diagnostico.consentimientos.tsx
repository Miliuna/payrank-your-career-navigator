import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";

const searchSchema = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/diagnostico/consentimientos")({
  head: () => ({ meta: [{ title: "Consentimientos — PayRank" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ConsentimientosPage,
});

function ConsentimientosPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const [c1, setC1] = React.useState(false);
  const [c2, setC2] = React.useState(false);
  const [c3, setC3] = React.useState(false);

  const ready = c1 && c2 && c3;

  const onSubmit = () => {
    if (!ready) return;
    navigate({ to: "/diagnostico/paywall", search: { id } });
  };

  const Item = ({
    checked,
    onChange,
    children,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    children: React.ReactNode;
  }) => (
    <label className="flex items-start gap-4 cursor-pointer group">
      <span
        className={`mt-1 flex items-center justify-center w-5 h-5 border transition-colors shrink-0 ${
          checked ? "bg-tinta border-tinta text-hueso" : "bg-transparent border-tinta/40 group-hover:border-tinta"
        }`}
        aria-hidden
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="font-body text-sm md:text-base text-tinta/85 leading-relaxed">{children}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <DiagnosticoShellLight step={5} progress={88}>
        <StepFade k="consent">
          <p className="font-ui text-[10px] text-piedra mb-4">PASO 5 · LEGALES</p>
          <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight text-tinta">
            Antes de <span className="font-display-italic">continuar</span>
          </h1>
          <p className="font-body text-base md:text-lg text-piedra mb-12 max-w-xl">
            Necesitamos tu consentimiento para procesar tu diagnóstico.
          </p>

          <div className="space-y-6 max-w-2xl">
            <Item checked={c1} onChange={setC1}>
              Acepto el procesamiento de mis datos personales y salariales para la generación de mi PayRank.{" "}
              <Link to="/politica-privacidad" className="underline underline-offset-4 hover:text-tinta">
                Ver Política de Privacidad
              </Link>
              .
            </Item>
            <Item checked={c2} onChange={setC2}>
              Acepto que mis datos, en forma completamente anonimizada y agregada, puedan utilizarse para mejorar la
              precisión de los diagnósticos de PayRank y para la publicación de reportes de mercado.
            </Item>
            <Item checked={c3} onChange={setC3}>
              He leído y acepto los{" "}
              <Link to="/terminos-condiciones" className="underline underline-offset-4 hover:text-tinta">
                Términos y Condiciones
              </Link>
              .
            </Item>
          </div>

          <div className="mt-12">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!ready}
              className="inline-flex items-center gap-3 bg-tinta text-hueso px-7 py-4 font-ui text-[11px] hover:bg-tinta/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              CONFIRMAR Y CONTINUAR
              <span aria-hidden>→</span>
            </button>
            {!ready && (
              <p className="mt-4 font-body text-xs text-piedra">
                Marcá los tres consentimientos para continuar.
              </p>
            )}
          </div>
        </StepFade>
      </DiagnosticoShellLight>
    </div>
  );
}

// Variante visual del Shell con fondo Hueso (sin reescribir el componente original)
function DiagnosticoShellLight({
  step,
  progress,
  children,
}: {
  step: number;
  progress?: number;
  children: React.ReactNode;
}) {
  const totalSteps = 8;
  const pct = progress ?? Math.round((step / totalSteps) * 100);
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="fixed top-0 inset-x-0 z-50 bg-hueso">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-tinta text-xl">PayRank</Link>
          <span className="font-ui text-[10px] text-piedra">Paso {step} de {totalSteps}</span>
        </div>
        <div className="h-[2px] bg-tinta/10 w-full">
          <div className="h-full bg-tinta transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </header>
      <main className="pt-24 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
