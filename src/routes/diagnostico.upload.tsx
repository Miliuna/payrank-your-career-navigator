import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DiagnosticoShell } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import type { Modo } from "@/lib/diagnostico/types";
import { TITULOS_MODO } from "@/lib/diagnostico/data";
import { cn } from "@/lib/utils";

type Search = { modo?: Modo };

export const Route = createFileRoute("/diagnostico/upload")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    modo: (s.modo === "A" || s.modo === "B" || s.modo === "C" || s.modo === "D") ? s.modo : undefined,
  }),
  head: () => ({
    meta: [{ title: "Subí tus documentos — PayRank" }],
  }),
  component: UploadPage,
});

type DocConfig = {
  key: "cv" | "descriptivo" | "recibo" | "aviso";
  titulo: string;
  recomendado: boolean;
  permiteUrl?: boolean;
};

function docsForModo(modo: Modo): DocConfig[] {
  if (modo === "C") {
    return [
      { key: "cv", titulo: "CV o perfil de LinkedIn", recomendado: true, permiteUrl: true },
      { key: "aviso", titulo: "Aviso de empleo al que te postulás", recomendado: true },
    ];
  }
  return [
    { key: "cv", titulo: "CV o perfil de LinkedIn", recomendado: true, permiteUrl: true },
    { key: "descriptivo", titulo: "Descriptivo de puesto", recomendado: false },
    { key: "recibo", titulo: "Recibo de sueldo, liquidación o contrato profesional", recomendado: false },
  ];
}

function UploadPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();

  // Sync modo from search to store
  React.useEffect(() => {
    if (search.modo && search.modo !== state.modo) {
      setState((s) => ({ ...s, modo: search.modo as Modo }));
    }
  }, [search.modo, state.modo, setState]);

  const modo: Modo = search.modo ?? state.modo;
  const docs = docsForModo(modo);

  const handleContinue = () => {
    navigate({ to: "/diagnostico/preguntas" });
  };

  return (
    <DiagnosticoShell step={1}>
      <p className="font-ui text-[10px] text-hueso/50 mb-4">
        {TITULOS_MODO[modo]}
      </p>
      <h1 className="font-display text-3xl md:text-5xl mb-4 text-hueso">
        Subí tus <span className="font-display-italic">documentos</span>
      </h1>
      <p className="font-body text-base md:text-lg text-hueso/65 mb-10 leading-relaxed max-w-2xl">
        Cuanta más información aportés, más preciso será tu PayRank.
      </p>

      <div className="space-y-6">
        {docs.map((doc) => (
          <DocUpload key={doc.key} doc={doc} />
        ))}
      </div>

      <p className="font-body text-xs text-hueso/45 mt-10 leading-relaxed max-w-2xl">
        Tus documentos se procesan para extraer datos del diagnóstico. No se
        almacenan como archivos. Solo se guardan los datos estructurados
        extraídos, con tu consentimiento explícito.
      </p>

      <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          type="button"
          onClick={handleContinue}
          className="font-ui text-[11px] text-hueso/60 hover:text-hueso transition-colors text-left"
        >
          Continuar sin documentos →
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
        >
          Continuar con el formulario <span aria-hidden>→</span>
        </button>
      </div>
    </DiagnosticoShell>
  );
}

function DocUpload({ doc }: { doc: DocConfig }) {
  const { state, setState } = useDiagnostico();
  const [tab, setTab] = React.useState<"file" | "text" | "url">(
    doc.permiteUrl ? "url" : "file",
  );
  const [draggingOver, setDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fileNameKey =
    doc.key === "cv" ? "cvNombre"
    : doc.key === "descriptivo" ? "descriptivoNombre"
    : doc.key === "recibo" ? "reciboNombre"
    : "avisoNombre";
  const textKey =
    doc.key === "cv" ? "cvTexto"
    : doc.key === "descriptivo" ? "descriptivoTexto"
    : doc.key === "recibo" ? "reciboTexto"
    : "avisoTexto";

  const fileName = state.documentos[fileNameKey];
  const text = state.documentos[textKey] ?? "";
  const linkedin = state.documentos.linkedinUrl ?? "";

  const setDoc = (patch: Partial<typeof state.documentos>) => {
    setState((s) => ({ ...s, documentos: { ...s.documentos, ...patch } }));
  };

  const handleFile = async (file: File) => {
    setDoc({ [fileNameKey]: file.name } as never);
    // Texto plano lo cargamos en cliente; PDFs/Word los procesa el server en PR2
    if (file.type.startsWith("text/")) {
      try {
        const t = await file.text();
        setDoc({ [textKey]: t } as never);
      } catch { /* ignore */ }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="border border-hueso/15 p-5 md:p-6 bg-hueso/[0.02]">
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <h3 className="font-body text-base md:text-lg text-hueso">{doc.titulo}</h3>
        <span className="font-ui text-[9px] text-hueso/50 shrink-0">
          {doc.recomendado ? "RECOMENDADO" : "OPCIONAL"}
        </span>
      </div>

      <div className="flex gap-1 mb-4 font-ui text-[10px]">
        {doc.permiteUrl && (
          <TabBtn active={tab === "url"} onClick={() => setTab("url")}>URL LinkedIn</TabBtn>
        )}
        <TabBtn active={tab === "file"} onClick={() => setTab("file")}>Subir archivo</TabBtn>
        <TabBtn active={tab === "text"} onClick={() => setTab("text")}>Pegar texto</TabBtn>
      </div>

      {tab === "url" && doc.permiteUrl && (
        <input
          type="url"
          placeholder="https://linkedin.com/in/tu-perfil"
          value={linkedin}
          onChange={(e) => setDoc({ linkedinUrl: e.target.value })}
          className="w-full bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-base text-hueso placeholder:text-hueso/30 py-2 transition-colors"
        />
      )}

      {tab === "file" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border border-dashed cursor-pointer text-center py-8 px-4 transition-colors",
            draggingOver ? "border-hueso bg-hueso/5" : "border-hueso/25 hover:border-hueso/60",
          )}
        >
          <p className="font-body text-sm text-hueso/70">
            {fileName ? (
              <>
                Cargado: <span className="text-hueso">{fileName}</span>
              </>
            ) : (
              <>Arrastrá un PDF, Word o TXT acá, o hacé click para seleccionar.</>
            )}
          </p>
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
      )}

      {tab === "text" && (
        <textarea
          placeholder="Pegá el contenido acá..."
          value={text}
          onChange={(e) => setDoc({ [textKey]: e.target.value } as never)}
          className="w-full bg-hueso/5 border border-hueso/20 focus:border-hueso outline-none font-body text-sm text-hueso placeholder:text-hueso/30 p-3 transition-colors min-h-32"
        />
      )}

      {!doc.recomendado && (
        <p className="font-body text-xs text-hueso/40 mt-3">
          No es obligatorio. Si lo tenés, mejora la precisión del resultado.
        </p>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 border transition-colors",
        active
          ? "border-hueso text-hueso"
          : "border-hueso/15 text-hueso/50 hover:text-hueso/80",
      )}
    >
      {children}
    </button>
  );
}
