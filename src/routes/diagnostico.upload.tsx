import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DiagnosticoShell } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import { useLang } from "@/lib/lang";
import type { Modo, DatosExtraidos } from "@/lib/diagnostico/types";
import { TITULOS_MODO, TITULOS_MODO_EN } from "@/lib/diagnostico/data";
import { extractFromDocument } from "@/lib/diagnostico/diagnostico.functions";
import { extractPdfText } from "@/lib/diagnostico/pdf-text";
import { cn } from "@/lib/utils";

type Search = { modo?: Modo };

export const Route = createFileRoute("/diagnostico/upload")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    modo: (s.modo === "A" || s.modo === "B" || s.modo === "C" || s.modo === "D") ? s.modo : undefined,
  }),
  head: () => ({ meta: [{ title: "Subí tus documentos — PayRank" }] }),
  component: UploadPage,
});

type DocTipo = "cv" | "recibo" | "descriptivo";

type ZoneCopy = {
  label: string;
  sublabel: string;
  required?: boolean;
};

function zoneCopy(tipo: DocTipo, isEN: boolean): ZoneCopy {
  if (isEN) {
    switch (tipo) {
      case "cv":
        return {
          label: "Resume / Professional profile",
          sublabel: "Your CV, exported LinkedIn profile or any document with your career history",
          required: true,
        };
      case "recibo":
        return {
          label: "Pay stub or salary slip",
          sublabel: "The most recent one you have. Lets us pre-fill your current salary",
        };
      case "descriptivo":
        return {
          label: "Job description",
          sublabel: "If you have one, it improves the accuracy of your role analysis",
        };
    }
  }
  switch (tipo) {
    case "cv":
      return {
        label: "CV / Perfil profesional",
        sublabel: "Tu CV, perfil de LinkedIn exportado o cualquier documento con tu trayectoria",
        required: true,
      };
    case "recibo":
      return {
        label: "Recibo de sueldo o liquidación",
        sublabel: "El más reciente que tengas. Nos permite pre-completar tu salario actual",
      };
    case "descriptivo":
      return {
        label: "Descriptivo de puesto",
        sublabel: "Si tenés uno, mejora la precisión del análisis de tu rol",
      };
  }
}

function UploadPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const { lang } = useLang();
  const isEN = lang === "EN";
  const extract = useServerFn(extractFromDocument);

  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [reciboFile, setReciboFile] = React.useState<File | null>(null);
  const [descriptivoFile, setDescriptivoFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [extractError, setExtractError] = React.useState(false);

  React.useEffect(() => {
    if (search.modo && search.modo !== state.modo) {
      setState((s) => ({ ...s, modo: search.modo as Modo }));
    }
  }, [search.modo, state.modo, setState]);

  React.useEffect(() => {
    if (state.datosExtraidos) {
      navigate({ to: "/diagnostico/preguntas", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modo: Modo = search.modo ?? state.modo;

  const goManual = () => {
    setState((s) => ({ ...s, datosExtraidos: null, pasosOverride: [] }));
    navigate({ to: "/diagnostico/preguntas" });
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

  const extractOne = async (file: File, tipo: DocTipo): Promise<DatosExtraidos> => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      try {
        const txt = await extractPdfText(file);
        if (txt && txt.length > 50) {
          const prefixed = `[TIPO: ${tipo}]\n\n${txt.slice(0, 100_000)}`;
          return (await extract({ data: { kind: "text", text: prefixed } })) as DatosExtraidos;
        }
        throw new Error("PDF sin texto extraíble");
      } catch (err) {
        console.warn(`[upload] PDF.js falló para ${file.name}, usando base64 truncado:`, err);
        const b64 = await fileToBase64Local(file);
        const b64Truncated = b64.slice(0, 15_000);
        return (await extract({ data: { kind: "pdf", base64: b64Truncated } })) as DatosExtraidos;
      }
    }
    const txt = await file.text();
    const prefixed = `[TIPO: ${tipo}]\n\n${txt.slice(0, 100_000)}`;
    return (await extract({ data: { kind: "text", text: prefixed } })) as DatosExtraidos;
  };

  const procesar = async () => {
    if (busy || !cvFile) return;
    setBusy(true);
    setExtractError(false);
    try {
      const jobs: Array<Promise<DatosExtraidos>> = [];
      const names: string[] = [];
      jobs.push(extractOne(cvFile, "cv"));
      names.push(cvFile.name);
      if (reciboFile) {
        jobs.push(extractOne(reciboFile, "recibo"));
        names.push(reciboFile.name);
      }
      if (descriptivoFile) {
        jobs.push(extractOne(descriptivoFile, "descriptivo"));
        names.push(descriptivoFile.name);
      }
      const results = await Promise.all(jobs);
      const extracted = mergeExtractions(results);

      console.log("[upload] datosExtraidos:", extracted);

      setState((s) => ({
        ...s,
        datosExtraidos: extracted,
        pasosOverride: [],
        documentos: { ...s.documentos, cvNombre: names.join(", ") },
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
      <p className="font-ui text-[10px] text-hueso/50 mb-4">{isEN ? TITULOS_MODO_EN[modo] : TITULOS_MODO[modo]}</p>
      <h1 className="font-display text-3xl md:text-5xl mb-4 text-hueso leading-tight">
        {isEN
          ? <>Upload your documents and <span className="font-display-italic">we pre-fill your profile</span></>
          : <>Subí tus documentos y <span className="font-display-italic">pre-completamos tu perfil</span></>}
      </h1>
      <p className="font-body text-base md:text-lg text-hueso/70 mb-8 leading-relaxed max-w-2xl">
        {isEN
          ? "AI extracts what it can from your documents. You confirm and fill in the rest — the process is shorter and more precise."
          : "La IA extrae lo que puede de tus documentos. Vos confirmás y completás el resto — el proceso es más corto y más preciso."}
      </p>

      {extractError ? (
        <div className="border border-[#C4BFB8] p-8 max-w-2xl">
          <p className="font-display text-2xl text-hueso mb-3">
            {isEN ? "We couldn't process your information automatically." : "No pudimos procesar tu información automáticamente."}
          </p>
          <p className="font-body font-light text-base text-hueso/75 mb-8 leading-relaxed">
            {isEN
              ? "You can continue filling the form manually — it'll take a few more minutes."
              : "Podés continuar completando el formulario manualmente — te tomará unos minutos más."}
          </p>
          <button
            type="button"
            onClick={goManual}
            className="font-ui text-[11px] tracking-[0.2em] text-hueso border-b border-hueso/60 pb-1 hover:border-hueso"
          >
            {isEN ? "FILL MANUALLY →" : "COMPLETAR MANUALMENTE →"}
          </button>
        </div>
      ) : busy ? (
        <div className="border border-dashed border-hueso/40 py-16 px-6 text-center max-w-3xl">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="font-display text-xl text-hueso">{isEN ? "Reading your documents…" : "Leyendo tus documentos…"}</p>
            <p className="font-body text-sm text-hueso/55 max-w-md">
              {isEN
                ? "We're extracting your professional data. This takes a few seconds."
                : "Estamos extrayendo tus datos profesionales. Esto tarda unos segundos."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6 max-w-3xl">
            <UploadZone
              tipo="cv"
              copy={zoneCopy("cv", isEN)}
              file={cvFile}
              onFile={setCvFile}
              isEN={isEN}
            />
            <UploadZone
              tipo="recibo"
              copy={zoneCopy("recibo", isEN)}
              file={reciboFile}
              onFile={setReciboFile}
              isEN={isEN}
            />
            <UploadZone
              tipo="descriptivo"
              copy={zoneCopy("descriptivo", isEN)}
              file={descriptivoFile}
              onFile={setDescriptivoFile}
              isEN={isEN}
            />
          </div>

          <p className="font-body text-xs text-hueso/45 mt-6 leading-relaxed max-w-2xl">
            {isEN
              ? "Accepted formats: PDF and Word. Your documents are processed to extract data and not stored as files."
              : "Formatos aceptados: PDF y Word. Tus documentos se procesan para extraer datos y no se almacenan como archivo."}
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={procesar}
              disabled={!cvFile}
              className={cn(
                "font-ui text-[11px] tracking-[0.2em] pb-1 border-b transition-colors",
                cvFile
                  ? "text-hueso border-hueso/60 hover:border-hueso"
                  : "text-hueso/30 border-hueso/20 cursor-not-allowed",
              )}
            >
              {isEN ? "CONTINUE →" : "CONTINUAR →"}
            </button>
          </div>

          <div className="mt-12">
            <button
              type="button"
              onClick={goManual}
              className="font-ui text-[11px] text-hueso/55 hover:text-hueso underline underline-offset-4"
            >
              {isEN ? "I PREFER TO FILL EVERYTHING MANUALLY →" : "PREFIERO COMPLETAR TODO MANUALMENTE →"}
            </button>
          </div>
        </>
      )}
    </DiagnosticoShell>
  );
}

function UploadZone({
  tipo,
  copy,
  file,
  onFile,
  isEN,
}: {
  tipo: DocTipo;
  copy: ZoneCopy;
  file: File | null;
  onFile: (f: File | null) => void;
  isEN: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = React.useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <p className="font-ui text-[11px] tracking-[0.15em] text-hueso uppercase">{copy.label}</p>
        <span className="font-ui text-[10px] text-hueso/50">
          {copy.required
            ? (isEN ? "· REQUIRED" : "· OBLIGATORIO")
            : (isEN ? "· OPTIONAL" : "· OPCIONAL")}
        </span>
      </div>
      <p className="font-body text-sm text-hueso/65 mb-3 leading-relaxed">{copy.sublabel}</p>

      {file ? (
        <div className="border border-hueso/30 px-4 py-3 flex items-center justify-between">
          <span className="font-body text-sm text-hueso/85 truncate pr-3">{file.name}</span>
          <button
            type="button"
            onClick={() => onFile(null)}
            aria-label={isEN ? `Remove ${file.name}` : `Eliminar ${file.name}`}
            className="text-hueso/55 hover:text-hueso text-lg leading-none"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border border-dashed text-center py-8 px-6 cursor-pointer transition-colors",
            draggingOver
              ? "border-hueso bg-hueso/5"
              : "border-hueso/30 hover:border-hueso/70",
          )}
        >
          <p className="font-body text-sm text-hueso/75">
            {isEN
              ? "Drag your file here or click to select it."
              : "Arrastrá tu archivo acá o hacé clic para seleccionarlo."}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
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
