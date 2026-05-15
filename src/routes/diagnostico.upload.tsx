import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DiagnosticoShell } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import type { Modo, DatosExtraidos } from "@/lib/diagnostico/types";
import { TITULOS_MODO } from "@/lib/diagnostico/data";
import { extractFromDocument } from "@/lib/diagnostico/diagnostico.functions";
import { extractPdfText } from "@/lib/diagnostico/pdf-text";
import { cn } from "@/lib/utils";

type Search = { modo?: Modo };

export const Route = createFileRoute("/diagnostico/upload")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    modo: (s.modo === "A" || s.modo === "B" || s.modo === "C" || s.modo === "D") ? s.modo : undefined,
  }),
  head: () => ({ meta: [{ title: "Subí tu documento — PayRank" }] }),
  component: UploadPage,
});

const MAX_FILES = 4;

type DocsConfig = { items: string[]; legend: string };

function docsForModo(modo: Modo): DocsConfig {
  switch (modo) {
    case "A":
      return {
        items: [
          "CV o perfil de LinkedIn (URL o PDF)",
          "Descriptivo de puesto — si lo tenés",
          "Recibo de sueldo o liquidación — si lo tenés",
        ],
        legend: "CV · DESCRIPTIVO · RECIBO",
      };
    case "B":
      return {
        items: [
          "CV o perfil de LinkedIn (URL o PDF)",
          "Descriptivo de puesto — si lo tenés",
          "Recibo de sueldo o liquidación — recomendado para este modo",
        ],
        legend: "CV · DESCRIPTIVO · RECIBO",
      };
    case "C":
      return {
        items: [
          "CV o perfil de LinkedIn (URL o PDF)",
          "Aviso de empleo al que te postulás — recomendado para este modo",
        ],
        legend: "CV · AVISO DE EMPLEO",
      };
    case "D":
      return {
        items: [
          "CV o perfil de LinkedIn (URL o PDF)",
          "Descriptivo de puesto — si lo tenés",
          "Recibo de sueldo o liquidación — si lo tenés",
        ],
        legend: "CV · DESCRIPTIVO · RECIBO",
      };
  }
}

function UploadPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const extract = useServerFn(extractFromDocument);

  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [extractError, setExtractError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = React.useState(false);

  React.useEffect(() => {
    if (search.modo && search.modo !== state.modo) {
      setState((s) => ({ ...s, modo: search.modo as Modo }));
    }
  }, [search.modo, state.modo, setState]);

  const modo: Modo = search.modo ?? state.modo;
  const docsCfg = docsForModo(modo);

  const goManual = () => {
    setState((s) => ({ ...s, datosExtraidos: null, pasosOverride: [] }));
    navigate({ to: "/diagnostico/preguntas" });
  };

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) return prev;
      return [...prev, ...arr.slice(0, remaining)];
    });
    setExtractError(false);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    if (busy) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const fileToBase64Local = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const idx = result.indexOf(",");
        resolve(idx >= 0 ? result.slice(idx + 1) : result);
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });

  const procesar = async () => {
    if (files.length === 0 || busy) return;
    setBusy(true);
    setExtractError(false);
    try {
      // Concatenar texto de todos los documentos. Si todos son texto, una sola llamada.
      // Si hay PDFs, los combinamos enviando texto extraído vía base64 individualmente
      // y juntando en un único string. Para simplicidad: convertimos cada PDF en un
      // bloque marcado y mandamos como texto si es legible; de lo contrario base64.
      const textoBlocks: string[] = [];
      const pdfBlocks: { name: string; base64: string }[] = [];

      for (const f of files) {
        const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
        if (isPdf) {
          const b64 = await fileToBase64Local(f);
          pdfBlocks.push({ name: f.name, base64: b64 });
        } else {
          const txt = await f.text();
          textoBlocks.push(`=== Documento: ${f.name} ===\n${txt}`);
        }
      }

      let extracted: DatosExtraidos;

      if (pdfBlocks.length === 0) {
        // Solo texto — una sola llamada concatenada
        const concatenated = textoBlocks.join("\n\n");
        extracted = (await extract({ data: { kind: "text", text: concatenated } })) as DatosExtraidos;
      } else if (pdfBlocks.length === 1 && textoBlocks.length === 0) {
        extracted = (await extract({ data: { kind: "pdf", base64: pdfBlocks[0].base64 } })) as DatosExtraidos;
      } else {
        // Mix: hacer múltiples extracciones y mergear (Anthropic acepta solo un PDF por llamada en este wrapper).
        const results: DatosExtraidos[] = [];
        if (textoBlocks.length > 0) {
          const concatenated = textoBlocks.join("\n\n");
          results.push((await extract({ data: { kind: "text", text: concatenated } })) as DatosExtraidos);
        }
        for (const p of pdfBlocks) {
          results.push((await extract({ data: { kind: "pdf", base64: p.base64 } })) as DatosExtraidos);
        }
        extracted = mergeExtractions(results);
      }

      setState((s) => ({
        ...s,
        datosExtraidos: extracted,
        pasosOverride: [],
        documentos: { ...s.documentos, cvNombre: files.map((f) => f.name).join(", ") },
      }));
      navigate({ to: "/diagnostico/preguntas" });
    } catch (e) {
      console.error("[upload] extracción falló:", e);
      setExtractError(true);
      setBusy(false);
    }
  };

  return (
    <DiagnosticoShell step={1}>
      <p className="font-ui text-[10px] text-hueso/50 mb-4">{TITULOS_MODO[modo]}</p>
      <h1 className="font-display text-3xl md:text-5xl mb-4 text-hueso leading-tight">
        Subí tu documento y te <span className="font-display-italic">ahorramos el formulario</span>
      </h1>
      <p className="font-body text-base md:text-lg text-hueso/70 mb-8 leading-relaxed max-w-2xl">
        La IA lee tus documentos y pre-completa tu perfil automáticamente.
        Solo te preguntamos lo que no encontremos.
      </p>

      <div className="mb-8">
        <p className="font-ui text-[10px] text-hueso/50 mb-3">DOCUMENTOS SUGERIDOS</p>
        <ul className="space-y-1.5">
          {docsCfg.items.map((it) => (
            <li key={it} className="font-body text-sm text-hueso/75">· {it}</li>
          ))}
        </ul>
      </div>

      {extractError ? (
        <div className="border border-[#C4BFB8] p-8 max-w-2xl">
          <p className="font-display text-2xl text-hueso mb-3">
            No pudimos procesar tu documento automáticamente.
          </p>
          <p className="font-body font-light text-base text-hueso/75 mb-8 leading-relaxed">
            Podés continuar completando el formulario manualmente — te tomará
            unos minutos más.
          </p>
          <button
            type="button"
            onClick={goManual}
            className="font-ui text-[11px] tracking-[0.2em] text-hueso border-b border-hueso/60 pb-1 hover:border-hueso"
          >
            COMPLETAR MANUALMENTE →
          </button>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={onDrop}
            onClick={() => !busy && files.length < MAX_FILES && fileInputRef.current?.click()}
            className={cn(
              "border border-dashed text-center py-12 px-6 transition-colors",
              busy ? "border-hueso/40 cursor-wait"
                : files.length >= MAX_FILES ? "border-hueso/20 cursor-not-allowed"
                : draggingOver ? "border-hueso bg-hueso/5 cursor-pointer"
                : "border-hueso/30 hover:border-hueso/70 cursor-pointer",
            )}
          >
            {busy ? (
              <div className="flex flex-col items-center gap-4">
                <Spinner />
                <p className="font-display text-xl text-hueso">Leyendo tus documentos…</p>
                <p className="font-body text-sm text-hueso/55 max-w-md">
                  Estamos extrayendo tus datos profesionales. Esto tarda unos segundos.
                </p>
              </div>
            ) : files.length === 0 ? (
              <>
                <p className="font-body text-base text-hueso/85 mb-2">
                  Arrastrá tus archivos acá o hacé clic para seleccionarlos.
                </p>
                <p className="font-ui text-[10px] text-hueso/45">{docsCfg.legend}</p>
              </>
            ) : (
              <>
                <p className="font-body text-sm text-hueso/65 mb-2">
                  {files.length < MAX_FILES
                    ? "Arrastrá más archivos o hacé clic para agregar."
                    : `Máximo ${MAX_FILES} documentos.`}
                </p>
                <p className="font-ui text-[10px] text-hueso/45">{docsCfg.legend}</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className="inline-flex items-center gap-2 border border-hueso/30 px-3 py-1.5 font-body text-sm text-hueso/85"
                >
                  {f.name}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={busy}
                    aria-label={`Eliminar ${f.name}`}
                    className="text-hueso/55 hover:text-hueso disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              ))}
              {files.length < MAX_FILES && !busy && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-ui text-[11px] tracking-[0.15em] text-hueso/65 hover:text-hueso underline underline-offset-4"
                >
                  + AGREGAR OTRO DOCUMENTO
                </button>
              )}
            </div>
          )}

          <p className="font-body text-xs text-hueso/45 mt-5 leading-relaxed max-w-2xl">
            Hasta {MAX_FILES} archivos. Formatos aceptados: PDF y Word. Tus documentos
            se procesan para extraer datos y no se almacenan como archivo.
          </p>

          {files.length > 0 && !busy && (
            <div className="mt-8">
              <button
                type="button"
                onClick={procesar}
                className="font-ui text-[11px] tracking-[0.2em] text-hueso border-b border-hueso/60 pb-1 hover:border-hueso"
              >
                PROCESAR DOCUMENTOS →
              </button>
            </div>
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
        </>
      )}
    </DiagnosticoShell>
  );
}

function Spinner() {
  return (
    <div className="w-6 h-6 border-2 border-hueso/30 border-t-hueso rounded-full animate-spin" aria-hidden />
  );
}

function mergeExtractions(list: DatosExtraidos[]): DatosExtraidos {
  const out: Record<string, unknown> = {};
  for (const item of list) {
    if (!item) continue;
    for (const [k, v] of Object.entries(item)) {
      if (v == null || v === "") continue;
      const cur = out[k];
      if (cur == null || cur === "") {
        out[k] = v;
      } else if (Array.isArray(cur) && Array.isArray(v)) {
        const merged = [...cur];
        for (const x of v) if (!merged.includes(x)) merged.push(x);
        out[k] = merged;
      }
    }
  }
  return out as DatosExtraidos;
}
