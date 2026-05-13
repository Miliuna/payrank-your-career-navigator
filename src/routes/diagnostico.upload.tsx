import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DiagnosticoShell } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import type { Modo, DatosExtraidos } from "@/lib/diagnostico/types";
import { TITULOS_MODO } from "@/lib/diagnostico/data";
import { extractFromDocument } from "@/lib/diagnostico/diagnostico.functions";
import { cn } from "@/lib/utils";

type Search = { modo?: Modo };

export const Route = createFileRoute("/diagnostico/upload")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    modo: (s.modo === "A" || s.modo === "B" || s.modo === "C" || s.modo === "D") ? s.modo : undefined,
  }),
  head: () => ({ meta: [{ title: "Subí tu documento — PayRank" }] }),
  component: UploadPage,
});

function UploadPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const extract = useServerFn(extractFromDocument);

  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [uploadedName, setUploadedName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = React.useState(false);

  React.useEffect(() => {
    if (search.modo && search.modo !== state.modo) {
      setState((s) => ({ ...s, modo: search.modo as Modo }));
    }
  }, [search.modo, state.modo, setState]);

  const modo: Modo = search.modo ?? state.modo;

  const goManual = () => {
    setState((s) => ({ ...s, datosExtraidos: null, pasosOverride: [] }));
    navigate({ to: "/diagnostico/preguntas" });
  };

  const handleFile = async (file: File) => {
    setUploadedName(file.name);
    setErr(null);
    setBusy(true);
    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      let extracted: DatosExtraidos;
      if (isPdf) {
        const base64 = await fileToBase64(file);
        extracted = (await extract({ data: { kind: "pdf", base64 } })) as DatosExtraidos;
      } else {
        const text = await file.text();
        if (!text.trim()) throw new Error("El archivo no contiene texto legible.");
        extracted = (await extract({ data: { kind: "text", text } })) as DatosExtraidos;
      }
      setState((s) => ({
        ...s,
        datosExtraidos: extracted,
        pasosOverride: [],
        documentos: { ...s.documentos, cvNombre: file.name },
      }));
      navigate({ to: "/diagnostico/preguntas" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No pudimos leer tu documento.");
      setBusy(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <DiagnosticoShell step={1}>
      <p className="font-ui text-[10px] text-hueso/50 mb-4">{TITULOS_MODO[modo]}</p>
      <h1 className="font-display text-3xl md:text-5xl mb-4 text-hueso leading-tight">
        Subí tu documento y te <span className="font-display-italic">ahorramos el formulario</span>
      </h1>
      <p className="font-body text-base md:text-lg text-hueso/70 mb-12 leading-relaxed max-w-2xl">
        La IA lee tu CV, recibo o aviso y pre-completa tu perfil automáticamente.
        Solo te preguntamos lo que no encontremos.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={onDrop}
        onClick={() => !busy && fileInputRef.current?.click()}
        className={cn(
          "border border-dashed cursor-pointer text-center py-14 px-6 transition-colors",
          busy ? "border-hueso/40 cursor-wait" : draggingOver ? "border-hueso bg-hueso/5" : "border-hueso/30 hover:border-hueso/70",
        )}
      >
        {busy ? (
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="font-display text-xl text-hueso">Leyendo tu documento…</p>
            {uploadedName && (
              <p className="font-ui text-[10px] text-hueso/50">{uploadedName}</p>
            )}
            <p className="font-body text-sm text-hueso/55 max-w-md">
              Estamos extrayendo tus datos profesionales. Esto tarda unos segundos.
            </p>
          </div>
        ) : (
          <>
            <p className="font-body text-base text-hueso/85 mb-2">
              Arrastrá tu archivo acá o hacé click para seleccionarlo.
            </p>
            <p className="font-ui text-[10px] text-hueso/45">CV · RECIBO · AVISO DE EMPLEO</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <p className="font-body text-xs text-hueso/45 mt-5 leading-relaxed max-w-2xl">
        Formatos aceptados: PDF y Word. Tu documento se procesa para extraer datos
        y no se almacena como archivo.
      </p>

      {err && (
        <p className="mt-5 font-body text-sm text-red-300/90 max-w-2xl">{err}</p>
      )}

      <div className="mt-12">
        <button
          type="button"
          onClick={goManual}
          disabled={busy}
          className="font-ui text-[11px] text-hueso/55 hover:text-hueso underline underline-offset-4 disabled:opacity-50"
        >
          Prefiero completar todo manualmente →
        </button>
      </div>
    </DiagnosticoShell>
  );
}

function Spinner() {
  return (
    <div className="w-6 h-6 border-2 border-hueso/30 border-t-hueso rounded-full animate-spin" aria-hidden />
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip data URL prefix
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}
