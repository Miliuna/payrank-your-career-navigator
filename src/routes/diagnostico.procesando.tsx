import * as React from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import { generateDiagnostico } from "@/lib/diagnostico/diagnostico.functions";

const searchSchema = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/diagnostico/procesando")({
  head: () => ({ meta: [{ title: "Generando tu PayRank — PayRank" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ProcesandoPage,
});

const MENSAJES = [
  "Analizando tu perfil compensológico…",
  "Cruzando con benchmarks de mercado…",
  "Aplicando ajustes por industria, alcance e idiomas…",
  "Calibrando el nivel de confianza…",
  "Redactando tu PayRank…",
];

function ProcesandoPage() {
  const navigate = useNavigate();
  const { id } = useSearch({ from: Route.id });
  const generate = useServerFn(generateDiagnostico);
  const [idx, setIdx] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MENSAJES.length), 2200);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const res = await generate({ data: { id } });
        navigate({ to: "/diagnostico/$id", params: { id: res.id } });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      }
    })();
  }, [generate, id, navigate]);

  return (
    <DiagnosticoShell step={7} progress={95}>
      <StepFade k="procesando">
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          {!error ? (
            <>
              <div className="w-2 h-2 rounded-full bg-hueso animate-pulse mb-8" />
              <p className="font-ui text-[10px] text-hueso/45 mb-3">PROCESANDO</p>
              <h1 className="font-display text-2xl md:text-3xl text-hueso mb-4">
                {MENSAJES[idx]}
              </h1>
              <p className="font-body text-sm text-hueso/55 max-w-md">
                Estamos generando tu PayRank. Esto puede tardar entre 30 y 60 segundos.
              </p>
            </>
          ) : (
            <>
              <p className="font-ui text-[10px] text-red-300/80 mb-3">ERROR</p>
              <h1 className="font-display text-2xl text-hueso mb-4">No pudimos generar tu PayRank</h1>
              <p className="font-body text-sm text-hueso/60 max-w-lg whitespace-pre-wrap">{error}</p>
              <button
                onClick={() => { startedRef.current = false; setError(null); setIdx(0); }}
                className="mt-6 inline-flex items-center justify-center bg-hueso text-tinta px-6 py-3 font-ui text-[11px]"
              >
                Reintentar
              </button>
            </>
          )}
        </div>
      </StepFade>
    </DiagnosticoShell>
  );
}
