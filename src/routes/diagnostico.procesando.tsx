import * as React from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateDiagnostico } from "@/lib/diagnostico/diagnostico.functions";
import { useLang } from "@/lib/lang";

const searchSchema = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/diagnostico/procesando")({
  head: () => ({ meta: [{ title: "Generando tu PayRank — PayRank" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ProcesandoPage,
});

function ProcesandoPage() {
  const navigate = useNavigate();
  const { id } = useSearch({ from: Route.id });
  const generate = useServerFn(generateDiagnostico);
  const { lang } = useLang();
  const isEN = lang === "EN";
  const [idx, setIdx] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const startedRef = React.useRef(false);

  const MENSAJES = React.useMemo(
    () => isEN
      ? [
          "Analyzing your market profile…",
          "Calculating ranges for your industry and level…",
          "Evaluating the real scope of your role…",
          "Valuing your benefits package…",
          "Analyzing the gender gap for your profile…",
          "Building your negotiation arguments…",
          "Preparing your career roadmap…",
          "Finalizing your PayRank…",
        ]
      : [
          "Analizando tu perfil en el mercado…",
          "Calculando rangos para tu industria y nivel…",
          "Evaluando el alcance real de tu rol…",
          "Valorizando tu paquete de beneficios…",
          "Analizando la brecha de género para tu perfil…",
          "Construyendo tus argumentos de negociación…",
          "Preparando tu hoja de ruta de carrera…",
          "Finalizando tu PayRank…",
        ],
    [isEN],
  );

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MENSAJES.length), 3000);
    return () => clearInterval(t);
  }, [MENSAJES.length]);

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
  }, [generate, id, navigate, retryCount]);

  return (
    <div className="min-h-screen bg-tinta text-hueso flex flex-col">
      <header className="pt-10 pb-6 flex items-center justify-center">
        <span className="font-display text-2xl text-hueso">PayRank</span>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-5">
        {!error ? (
          <>
            <p className="font-ui text-[10px] text-hueso/45 mb-4">{isEN ? "PROCESSING" : "PROCESANDO"}</p>
            <h1 className="font-display text-3xl md:text-5xl text-hueso mb-10 leading-tight">
              {isEN
                ? <>Analyzing your <span className="font-display-italic">position</span>…</>
                : <>Analizando tu <span className="font-display-italic">posición</span>…</>}
            </h1>

            {/* Barra de progreso animada */}
            <div className="w-[60%] max-w-md h-[2px] bg-hueso/10 overflow-hidden mb-10">
              <div
                className="h-full animate-pulse"
                style={{ width: "100%", backgroundColor: "#2E4A6E" }}
              />
            </div>

            <p key={idx} className="font-body text-base md:text-lg text-hueso/85 max-w-md animate-in fade-in duration-500">
              {MENSAJES[idx]}
            </p>
            <p className="mt-8 font-body text-sm text-hueso/45 max-w-md">
              {isEN ? "This may take 1 to 3 minutes." : "Esto puede tardar entre 1 y 3 minutos."}
            </p>
          </>
        ) : (
          <>
            <p className="font-ui text-[10px] text-red-300/80 mb-3">ERROR</p>
            <h1 className="font-display text-2xl md:text-3xl text-hueso mb-4">
              {isEN ? "There was a problem generating your PayRank" : "Hubo un problema generando tu PayRank"}
            </h1>
            <p className="font-body text-base text-hueso/70 max-w-lg">
              {isEN ? "Please write to us at" : "Por favor escribinos a"}{" "}
              <a href="mailto:hello@payrank.co" className="underline underline-offset-4">hello@payrank.co</a>
              .
            </p>
            <p className="mt-3 font-body text-xs text-hueso/40 max-w-lg">
              {isEN
                ? "An unexpected error occurred. Please try again in a few minutes."
                : "Ocurrió un error inesperado. Por favor intentá nuevamente en unos minutos."}
            </p>
            {error && (
              <pre className="mt-4 max-w-2xl whitespace-pre-wrap break-words text-left font-mono text-[11px] text-red-300/70 border border-red-300/20 bg-red-300/5 p-3">
                {error}
              </pre>
            )}
            <button
              onClick={() => { startedRef.current = false; setError(null); setIdx(0); setRetryCount((c) => c + 1); }}
              className="mt-6 inline-flex items-center justify-center bg-hueso text-tinta px-6 py-3 font-ui text-[11px]"
            >
              {isEN ? "Retry" : "Reintentar"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
