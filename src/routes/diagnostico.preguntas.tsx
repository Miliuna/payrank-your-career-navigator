import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import {
  CardOption,
  ChipOption,
  NavButtons,
  QuestionHint,
  QuestionTitle,
  TextArea,
  TextInput,
} from "@/components/diagnostico/Controls";
import { useDiagnostico } from "@/lib/diagnostico/store";
import { useLang } from "@/lib/lang";
import {
  ALCANCES, BENEFICIOS, COBERTURA_ALCANCE_EN, COBERTURA_ALCANCE_ES,
  COBERTURA_MEDICA_POR_PAIS, EXP_INDUSTRIA, EXP_TOTAL, FORMACIONES, FRECUENCIAS_IA,
  FUNCIONES, GENEROS, HERRAMIENTAS_IA, INDUSTRIAS, INDUSTRIAS_EN, INTERACCIONES,
  MONEDAS, NIVELES, NIVELES_EN, NIVELES_IDIOMA, NIVELES_IDIOMA_EN, PAISES, PAISES_EN,
  PERSONAS_A_CARGO, SITUACIONES, TIEMPOS_SIN_TRABAJO, TIPOS_EMPRESA, USOS_IA,
  esCoberturaEmpleador, labelOf,
} from "@/lib/diagnostico/data";
import type { Idioma, DatosExtraidos } from "@/lib/diagnostico/types";

// ───────────── Helpers de extracción ─────────────

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  return null;
}
function asArrayStr(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out = v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
  return out.length ? out : null;
}
function findOption(opts: readonly string[], val: string | null): string | null {
  if (!val) return null;
  const lower = val.toLowerCase();
  return opts.find((o) => o.toLowerCase() === lower)
    ?? opts.find((o) => o.toLowerCase().includes(lower) || lower.includes(o.toLowerCase()))
    ?? null;
}

/**
 * Mapea el JSON extraído por la IA a parciales de Respuestas.
 * SOLO Categoría A (campos inferibles de un CV/recibo). Los campos
 * compensológicos críticos (alcance, equipo, funciones reales, interacción,
 * situación, beneficios, descripción) NO se pre-completan: siempre se
 * preguntan al usuario.
 */
function mapExtraccionAResp(d: DatosExtraidos): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const industria = findOption(INDUSTRIAS, asString(d.industria_inferida));
  if (industria) out.industria = industria;
  const tipoEmp = findOption(TIPOS_EMPRESA, asString(d.tipo_empresa_inferida));
  if (tipoEmp) out.tipoEmpresa = tipoEmp;
  const nivel = findOption(NIVELES, asString(d.nivel_jerarquico_inferido));
  if (nivel) out.nivel = nivel;
  const expTot = findOption(EXP_TOTAL, asString(d.anos_experiencia_total_inferidos));
  if (expTot) out.expTotal = expTot;
  const expInd = findOption(EXP_INDUSTRIA, asString(d.anos_experiencia_industria_inferidos));
  if (expInd) out.expIndustria = expInd;

  const form = asArrayStr(d.formacion);
  if (form) {
    const matched = form.map((f) => findOption(FORMACIONES, f) ?? null).filter(Boolean) as string[];
    if (matched.length) out.formacion = Array.from(new Set(matched));
  }

  const certs = asArrayStr(d.certificaciones);
  if (certs) out.certificaciones = certs;

  const idiomas = Array.isArray(d.idiomas) ? d.idiomas : null;
  if (idiomas && idiomas.length) {
    const list: Idioma[] = idiomas.map((i): Idioma => {
      if (typeof i === "string") return { idioma: i, nivel: "" };
      const lvl = NIVELES_IDIOMA.find((n) => n.toLowerCase() === (i.nivel ?? "").toLowerCase());
      return {
        idioma: typeof i.idioma === "string" ? i.idioma : "",
        nivel: (lvl ?? "") as Idioma["nivel"],
        certificacion: typeof i.certificacion === "string" ? i.certificacion : undefined,
      };
    }).filter((i) => i.idioma);
    if (list.length) out.idiomas = list;
  }

  const ia = asArrayStr(d.herramientas_ia_inferidas);
  if (ia) {
    const matched = ia.map((t) => findOption(HERRAMIENTAS_IA, t) ?? null).filter(Boolean) as string[];
    if (matched.length) out.herramientasIA = Array.from(new Set(matched));
  }

  return out;
}

const STEP_TITULO_ES: Record<number, string> = {
  1: "¿En qué industria trabajás?",
  2: "¿En qué tipo de empresa trabajás?",
  3: "¿Cuál es tu nivel jerárquico?",
  8: "¿Qué idiomas usás en tu trabajo?",
  9: "¿Cuántos años de experiencia total tenés?",
  10: "¿Cuántos años de experiencia tenés en esta industria?",
  11: "¿Cuál es tu formación?",
  12: "¿Tenés certificaciones profesionales?",
  13: "¿Qué herramientas de IA usás?",
};

const STEP_TITULO_EN: Record<number, string> = {
  1: "What industry do you work in?",
  2: "What type of company do you work at?",
  3: "What is your hierarchical level?",
  8: "What languages do you use at work?",
  9: "How many years of total experience do you have?",
  10: "How many years of experience in this industry?",
  11: "What is your educational background?",
  12: "Do you have professional certifications?",
  13: "What AI tools do you use?",
};

// ───────────── EN option arrays ─────────────

const TIPOS_EMPRESA_EN = [
  "Startup / SMB (1–99 employees)",
  "Mid-size company (100–999 employees)",
  "Large national company (1,000–4,999 employees)",
  "Multinational / Enterprise (5,000+ employees)",
];

const ALCANCES_EN = ["Local (one country)", "Regional (several countries)", "Global"];

const PERSONAS_A_CARGO_EN = [
  "No, I work independently",
  "Yes, small team (1–5)",
  "Yes, medium team (6–15)",
  "Yes, large team (more than 15)",
];

const INTERACCIONES_EN = [
  "No direct contact",
  "Occasional interaction",
  "Frequent interaction with executive management",
  "I report directly to executive management",
];

const EXP_TOTAL_EN = [
  "Less than 3 years", "3–7 years", "7–12 years", "12–20 years", "More than 20 years",
];

const EXP_INDUSTRIA_EN = [
  "Less than 2 years", "2–5 years", "5–10 years", "More than 10 years",
];

const FORMACIONES_EN = [
  "High school diploma", "Technical degree", "Incomplete university",
  "University degree", "Postgraduate/Specialization", "Master's degree",
  "Doctorate", "Professional certifications",
];

const FRECUENCIAS_IA_EN = [
  "Rarely",
  "Several times a week",
  "Every day",
  "They are central to how I work",
];

const USOS_IA_EN = [
  "Writing and communication", "Analysis and research",
  "Images or visual content", "Code and automation",
  "Decision making", "Learning", "Other",
];

const BENEFICIOS_EN = [
  "Annual bonus", "Company car",
  "Company phone", "Home office/Remote work", "Travel expenses",
  "Company-paid training", "Stock options/Equity",
  "Meal vouchers", "Extra vacation days",
  "Life insurance", "Supplemental retirement plan",
  "Other", "None of the above",
];

const GENEROS_EN = [
  "Yes, I identify as a woman", "Yes, I identify as a man", "Yes, I am non-binary",
  "I prefer not to include this analysis",
];

const FUNCIONES_EN = [
  "People management", "Budget/P&L", "Strategy", "Operations",
  "Sales/Commercial", "Marketing", "Communications & PR", "Technology/Product", "HR/Talent",
  "Finance/Accounting", "Legal/Compliance", "Project management / PMO",
  "Software/Web development", "Design/UX",
  "Data/Analytics", "Innovation/R&D", "Customer service", "Other",
];

const TIEMPOS_SIN_TRABAJO_EN = [
  "Less than 3 months", "3–6 months", "6–12 months", "More than 1 year",
];

function tieneExtraccion(step: number, d: DatosExtraidos): boolean {
  return !!resumenExtraccion(step, d, false);
}

function resumenExtraccion(step: number, d: DatosExtraidos, isEN: boolean): { titulo: string; valor: string } | null {
  const STEP_TITULO = isEN ? STEP_TITULO_EN : STEP_TITULO_ES;
  const titulo = STEP_TITULO[step] ?? "";
  const v = (() => {
    switch (step) {
      case 1: {
        const m = findOption(INDUSTRIAS, asString(d.industria_inferida));
        return isEN && m ? (INDUSTRIAS_EN[m] ?? m) : m;
      }
      case 2: {
        const m = findOption(TIPOS_EMPRESA, asString(d.tipo_empresa_inferida));
        if (!m) return null;
        if (!isEN) return m;
        const idx = TIPOS_EMPRESA.indexOf(m);
        return idx >= 0 ? TIPOS_EMPRESA_EN[idx] : m;
      }
      case 3: {
        const m = findOption(NIVELES, asString(d.nivel_jerarquico_inferido));
        return isEN && m ? (NIVELES_EN[m] ?? m) : m;
      }
      case 8: {
        const arr = Array.isArray(d.idiomas) ? d.idiomas : null;
        if (!arr || !arr.length) return null;
        return arr.map((i) => {
          if (typeof i === "string") return i;
          const lvl = i.nivel ?? "";
          const lvlDisplay = isEN ? (NIVELES_IDIOMA_EN[lvl] ?? lvl) : lvl;
          return `${i.idioma ?? ""}${lvlDisplay ? ` (${lvlDisplay})` : ""}`;
        }).filter(Boolean).join(" · ");
      }
      case 9: return asString(d.anos_experiencia_total_inferidos);
      case 10: return asString(d.anos_experiencia_industria_inferidos);
      case 11: { const a = asArrayStr(d.formacion); return a ? a.join(" · ") : null; }
      case 12: { const a = asArrayStr(d.certificaciones); return a ? a.join(" · ") : null; }
      case 13: { const a = asArrayStr(d.herramientas_ia_inferidas); return a ? a.join(" · ") : null; }
      default: return null;
    }
  })();
  return v ? { titulo, valor: v } : null;
}


export const Route = createFileRoute("/diagnostico/preguntas")({
  head: () => ({ meta: [{ title: "Preguntas — PayRank" }] }),
  component: PreguntasPage,
});

const TOTAL = 19;

// Categoría A: campos inferibles del documento. El resto (alcance, equipo,
// funciones, interacción, situación, salario, beneficios, descripción, género,
// contacto) son Categoría B — siempre se preguntan al usuario.
const EXTRACTABLE_STEPS = new Set([1, 2, 3, 8, 9, 10, 11, 12, 13]);

function PreguntasPage() {
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const { lang } = useLang();
  const isEN = lang === "EN";
  const modo = state.modo;
  const [step, setStep] = React.useState(() => modo === "C" ? -1 : 0); // -1 = sub-case (Mode C only), 0..18
  const [certRawInput, setCertRawInput] = React.useState("");
  const appliedRef = React.useRef(false);

  const r = state.respuestas;
  const setR = (patch: Partial<typeof r>) => {
    setState((s) => ({ ...s, respuestas: { ...s.respuestas, ...patch } }));
  };

  const datos = state.datosExtraidos ?? null;
  const hasDoc = !!datos;
  const overrides = React.useMemo(() => new Set(state.pasosOverride ?? []), [state.pasosOverride]);

  // Pre-cargar respuestas desde extracción una sola vez al entrar
  React.useEffect(() => {
    if (appliedRef.current || !datos) return;
    appliedRef.current = true;
    setState((s) => ({ ...s, respuestas: { ...s.respuestas, ...mapExtraccionAResp(datos) } }));
  }, [datos, setState]);

  // Pasos pendientes (en modo documento) = pasos sin extracción válida o forzados a override
  const pendientes = React.useMemo(() => {
    if (!hasDoc) return null;
    const arr: number[] = [];
    for (let i = 0; i < TOTAL; i++) {
      if (!EXTRACTABLE_STEPS.has(i) || !tieneExtraccion(i, datos!) || overrides.has(i)) arr.push(i);
    }
    return arr;
  }, [hasDoc, datos, overrides]);

  const next = () => {
    if (step === -1) { setStep(0); return; }
    if (step === 12) {
      const pending = (certRawInput.trim() || (r.certificacionesPending ?? "").trim());
      if (pending) {
        const items = r.certificaciones ?? [];
        if (!items.includes(pending)) {
          setR({ certificaciones: [...items, pending], sinCertificaciones: false, certificacionesPending: "" });
        } else {
          setR({ certificacionesPending: "" });
        }
        setCertRawInput("");
      }
    }
    if (step < TOTAL - 1) setStep(step + 1);
    else navigate({ to: "/diagnostico/inferencia" });
  };
  const back = () => {
    if (step === -1) { navigate({ to: "/diagnostico/upload" }); return; }
    if (step === 0 && modo === "C") { setStep(-1); return; }
    if (step > 0) setStep(step - 1);
    else navigate({ to: "/diagnostico/upload" });
  };

  const onCorrecto = () => next();
  const onCambiar = () => {
    setState((s) => ({
      ...s,
      pasosOverride: Array.from(new Set([...(s.pasosOverride ?? []), step])),
    }));
  };

  const valid = isValid(step, r, modo, certRawInput);
  const extraccionTexto = step >= 0 && hasDoc && EXTRACTABLE_STEPS.has(step) && !overrides.has(step)
    ? resumenExtraccion(step, datos!, isEN)
    : null;

  // Cabecera de progreso
  const progressHeader = step === -1
    ? (isEN ? "PREVIOUS STEP" : "PASO PREVIO")
    : (hasDoc && pendientes
      ? (() => {
          const idx = pendientes.indexOf(step);
          const totalPend = pendientes.length;
          if (idx >= 0) return isEN ? `FIELD ${idx + 1} OF ${totalPend} TO CONFIRM` : `CAMPO ${idx + 1} DE ${totalPend} POR CONFIRMAR`;
          return isEN ? "FIELD CONFIRMED" : "CAMPO CONFIRMADO";
        })()
      : isEN ? `QUESTION ${step + 1} OF ${TOTAL}` : `PREGUNTA ${step + 1} DE ${TOTAL}`);

  const pct = step === -1
    ? 8
    : (hasDoc && pendientes && pendientes.length > 0
      ? Math.round(((Math.max(pendientes.indexOf(step), 0) + 1) / pendientes.length) * 50) + 10
      : Math.round(((step + 1) / TOTAL) * 50) + 10);

  return (
    <DiagnosticoShell step={2} progress={pct}>
      <p className="font-ui text-[10px] text-hueso/45 mb-3">{progressHeader}</p>
      {step === 0 && (
        <p className="font-body text-sm text-hueso/70 mb-6 leading-relaxed border-l-2 border-hueso/30 pl-4">
          {hasDoc
            ? (isEN
                ? "I found basic profile info. Confirm it quickly, then I'll ask what I need for the precise analysis."
                : "Encontré información básica de tu perfil. Confirmala rápido y después te pregunto lo que necesito para hacer el análisis preciso.")
            : (isEN
                ? "I'll ask a few questions to understand your full profile."
                : "Te hago algunas preguntas para entender tu perfil completo.")}
        </p>
      )}
      <StepFade k={step}>
        {step === -1 ? (
          <SubCasoC r={r} setR={setR} />
        ) : extraccionTexto ? (
          <ConfirmCard texto={extraccionTexto} onCorrecto={onCorrecto} onCambiar={onCambiar} isEN={isEN} />
        ) : (
          renderStep(step, r, setR, modo, isEN, certRawInput, setCertRawInput)
        )}
      </StepFade>
      {!extraccionTexto && <NavButtons onBack={back} onNext={next} nextDisabled={!valid} />}
      {extraccionTexto && (
        <div className="mt-8">
          <button
            type="button"
            onClick={back}
            className="font-ui text-[10px] text-hueso/55 hover:text-hueso underline underline-offset-4"
          >
            {isEN ? "← Back" : "← Volver"}
          </button>
        </div>
      )}
    </DiagnosticoShell>
  );
}

function ConfirmCard({ texto, onCorrecto, onCambiar, isEN }: {
  texto: { titulo: string; valor: string };
  onCorrecto: () => void;
  onCambiar: () => void;
  isEN: boolean;
}) {
  return (
    <div>
      <p className="font-body text-base text-hueso/60 mb-3">{texto.titulo}</p>
      <p className="font-ui text-[10px] text-hueso/45 mb-3">{isEN ? "FOUND IN YOUR DOCUMENT" : "ENCONTRÉ EN TU DOCUMENTO"}</p>
      <div className="border border-hueso/20 bg-hueso/[0.03] p-6 mb-8">
        <p className="font-display text-2xl md:text-3xl text-hueso leading-snug whitespace-pre-line">
          {texto.valor}
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <button
          type="button"
          onClick={onCorrecto}
          className="inline-flex items-center justify-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
        >
          {isEN ? "✓ Correct · continue" : "✓ Correcto · continuá"} <span aria-hidden>→</span>
        </button>
        <button
          type="button"
          onClick={onCambiar}
          className="inline-flex items-center justify-center font-ui text-[11px] text-hueso/70 px-6 py-3 border border-hueso/30 hover:border-hueso transition-colors"
        >
          {isEN ? "Change" : "Cambiar"}
        </button>
      </div>
    </div>
  );
}

function isValid(
  step: number,
  r: ReturnType<typeof useDiagnostico>["state"]["respuestas"],
  modo: string,
  certRawInput?: string,
): boolean {
  switch (step) {
    case -1: return !!r.subCasoC;
    case 0: return !!r.pais && (r.pais !== "Otro" || !!r.paisOtro?.trim());
    case 1: return !!r.industria && (r.industria !== "Otra" || !!r.industriaOtra?.trim());
    case 2: return !!r.tipoEmpresa;
    case 3: return !!r.nivel && (r.nivel !== "Otro" || !!r.nivelOtro?.trim());
    case 4: return !!r.alcance;
    case 5: return !!r.personasACargo;
    case 6: return ((r.funciones?.length ?? 0) > 0) || !!r.funcionesTexto?.trim();
    case 7: return !!r.interaccion;
    case 8: return !!r.sinIdiomas || ((r.idiomas?.length ?? 0) > 0 && r.idiomas!.every((i) => i.idioma.trim() && i.nivel));
    case 9: return !!r.expTotal;
    case 10: return !!r.expIndustria;
    case 11: return (r.formacion?.length ?? 0) > 0;
    case 12: return !!r.sinCertificaciones || (r.certificaciones?.length ?? 0) > 0 || !!certRawInput?.trim() || !!r.certificacionesPending?.trim();
    case 13: return (r.herramientasIA?.length ?? 0) > 0 && !!r.frecuenciaIA && (r.usoIA?.length ?? 0) > 0;
    case 14: {
      if (!r.situacion) return false;
      if (modo === "C") return true; // salario opcional en Modo C
      if (r.situacion === "empleado") return !!r.salario && !!r.moneda && !!r.brutoNeto;
      if (r.situacion === "freelance") return !!r.salario && !!r.moneda;
      if (r.situacion === "contractor") return !!r.contractorHoras && !!r.contractorPago && !!r.salario && !!r.moneda;
      // busqueda
      if (r.trabajaActualmente === "si") return !!r.salario && !!r.moneda;
      if (r.trabajaActualmente === "no") return !!r.salarioAnterior && !!r.monedaAnterior && !!r.tiempoSinTrabajo;
      return false;
    }
    case 15: {
      if (!r.coberturaMedicaTipo) return false;
      if (esCoberturaEmpleador(r.coberturaMedicaTipo) && !r.coberturaMedicaAlcance) return false;
      return (r.beneficios?.length ?? 0) > 0;
    }
    case 16: return !!r.descripcionPuesto?.trim();
    case 17: return !!r.genero;
    case 18: return !!r.email && /\S+@\S+\.\S+/.test(r.email);
    default: return true;
  }
}

function renderStep(
  step: number,
  r: ReturnType<typeof useDiagnostico>["state"]["respuestas"],
  setR: (p: Partial<typeof r>) => void,
  modo: string,
  isEN: boolean,
  certRawInput?: string,
  onCertRawChange?: (v: string) => void,
) {
  switch (step) {
    case 0: return <P1Pais r={r} setR={setR} />;
    case 1: return <P2Industria r={r} setR={setR} />;
    case 2: return <P3TipoEmpresa r={r} setR={setR} />;
    case 3: return <P4Nivel r={r} setR={setR} />;
    case 4: return <SimpleCards title={isEN ? "What is the scope of your role?" : "¿Cuál es el alcance de tu rol?"} options={isEN ? ALCANCES_EN : ALCANCES} value={r.alcance} onChange={(v) => setR({ alcance: v })} />;
    case 5: return <SimpleCards title={isEN ? "Do you have people reporting to you?" : "¿Tenés personas a cargo?"} options={isEN ? PERSONAS_A_CARGO_EN : PERSONAS_A_CARGO} value={r.personasACargo} onChange={(v) => setR({ personasACargo: v })} />;
    case 6: return <P7Funciones r={r} setR={setR} />;
    case 7: return <SimpleCards title={isEN ? "How do you interact with senior management?" : "¿Cómo interactuás con la alta dirección?"} options={isEN ? INTERACCIONES_EN : INTERACCIONES} value={r.interaccion} onChange={(v) => setR({ interaccion: v })} />;
    case 8: return <P9Idiomas r={r} setR={setR} />;
    case 9: return <SimpleCards title={isEN ? "How many years of total career experience do you have?" : "¿Cuántos años de experiencia total tenés en tu carrera?"} options={isEN ? EXP_TOTAL_EN : EXP_TOTAL} value={r.expTotal} onChange={(v) => setR({ expTotal: v })} />;
    case 10: return <SimpleCards title={isEN ? "How many years of experience in this industry?" : "¿Cuántos años de experiencia tenés en esta industria?"} options={isEN ? EXP_INDUSTRIA_EN : EXP_INDUSTRIA} value={r.expIndustria} onChange={(v) => setR({ expIndustria: v })} />;
    case 11: return <P12Formacion r={r} setR={setR} />;
    case 12: return <P13Certificaciones r={r} setR={setR} certRawInput={certRawInput ?? ""} onCertRawChange={onCertRawChange ?? (() => {})} />;
    case 13: return <P14HerramientasIA r={r} setR={setR} />;
    case 14: return <P15Situacion r={r} setR={setR} modo={modo} />;
    case 15: return <P16Beneficios r={r} setR={setR} />;
    case 16: return <P17Descripcion r={r} setR={setR} modo={modo} />;
    case 17: return <P18Genero r={r} setR={setR} />;
    case 18: return <P19Contacto r={r} setR={setR} />;
    default: return null;
  }
}

// ───────────── Step components ─────────────

type Props = {
  r: ReturnType<typeof useDiagnostico>["state"]["respuestas"];
  setR: (p: Partial<Props["r"]>) => void;
};

function SubCasoC({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  return (
    <>
      <QuestionTitle>{isEN ? "What stage are you at?" : "¿En qué momento estás?"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "This defines the diagnostic strategy: if you already have an offer, the focus is negotiating terms. If you're in the process, the focus is positioning yourself to get it."
          : "Esto define la estrategia del diagnóstico: si ya tenés una oferta, el foco es negociar los términos. Si estás en proceso, el foco es posicionarte para obtenerla."}
      </QuestionHint>
      <div className="grid grid-cols-1 gap-3">
        <CardOption
          selected={r.subCasoC === "oferta"}
          onClick={() => setR({ subCasoC: "oferta" })}
        >
          {isEN ? "I already have a concrete offer" : "Ya tengo una oferta concreta"}
        </CardOption>
        <CardOption
          selected={r.subCasoC === "entrevista"}
          onClick={() => setR({ subCasoC: "entrevista" })}
        >
          {isEN ? "I have an interview / I'm in a selection process" : "Tengo una entrevista / estoy en proceso de selección"}
        </CardOption>
      </div>
    </>
  );
}

function SimpleCards({ title, hint, options, value, onChange }: {
  title: string; hint?: string; options: readonly string[]; value?: string; onChange: (v: string) => void;
}) {
  return (
    <>
      <QuestionTitle>{title}</QuestionTitle>
      {hint && <QuestionHint>{hint}</QuestionHint>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <CardOption key={opt} selected={value === opt} onClick={() => onChange(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>
    </>
  );
}

function MultiCards({ title, hint, options, value, onChange }: {
  title: string; hint?: string; options: readonly string[]; value: string[] | undefined;
  onChange: (v: string[]) => void;
}) {
  const sel = value ?? [];
  const toggle = (opt: string) => {
    if (sel.includes(opt)) onChange(sel.filter((x) => x !== opt));
    else onChange([...sel, opt]);
  };
  return (
    <>
      <QuestionTitle>{title}</QuestionTitle>
      {hint && <QuestionHint>{hint}</QuestionHint>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <CardOption key={opt} selected={sel.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>
    </>
  );
}

function P1Pais({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const [query, setQuery] = React.useState("");
  const filtered = PAISES.filter((p) => {
    const q = query.toLowerCase();
    return p.toLowerCase().includes(q) || (isEN && (PAISES_EN[p] ?? "").toLowerCase().includes(q));
  });
  return (
    <>
      <QuestionTitle>{isEN ? "In which country does your role operate?" : "¿En qué país operás en tu rol?"}</QuestionTitle>
      <QuestionHint>{isEN ? "If you work across multiple countries, choose where you are." : "Si trabajás para varios países, elegí donde estás vos."}</QuestionHint>
      <TextInput
        placeholder={isEN ? "Search country..." : "Buscar país..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
        {filtered.map((p) => (
          <ChipOption key={p} selected={r.pais === p} onClick={() => setR({ pais: p })}>
            {labelOf(p, PAISES_EN, isEN)}
          </ChipOption>
        ))}
      </div>
      {r.pais === "Otro" && (
        <div className="mt-6 animate-in fade-in duration-300">
          <TextInput
            placeholder={isEN ? "Specify here" : "Especificá acá"}
            value={r.paisOtro ?? ""}
            onChange={(e) => setR({ paisOtro: e.target.value })}
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function P2Industria({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  return (
    <>
      <QuestionTitle>{isEN ? "What industry do you work in?" : "¿En qué industria trabajás?"}</QuestionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INDUSTRIAS.map((opt) => (
          <CardOption key={opt} selected={r.industria === opt} onClick={() => setR({ industria: opt })}>
            {labelOf(opt, INDUSTRIAS_EN, isEN)}
          </CardOption>
        ))}
      </div>
      {r.industria === "Otra" && (
        <div className="mt-6">
          <TextInput
            placeholder={isEN ? "Specify your industry" : "Especificá tu industria"}
            value={r.industriaOtra ?? ""}
            onChange={(e) => setR({ industriaOtra: e.target.value })}
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function P3TipoEmpresa({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const options = isEN ? TIPOS_EMPRESA_EN : TIPOS_EMPRESA;
  const displayValue = isEN
    ? (r.tipoEmpresa ? (TIPOS_EMPRESA_EN[TIPOS_EMPRESA.indexOf(r.tipoEmpresa)] ?? r.tipoEmpresa) : undefined)
    : r.tipoEmpresa;
  return (
    <SimpleCards
      title={isEN ? "What type of company do you work at?" : "¿En qué tipo de empresa trabajás?"}
      options={options}
      value={displayValue}
      onChange={(v) => {
        if (isEN) {
          const idx = TIPOS_EMPRESA_EN.indexOf(v);
          setR({ tipoEmpresa: idx >= 0 ? TIPOS_EMPRESA[idx] : v });
        } else {
          setR({ tipoEmpresa: v });
        }
      }}
    />
  );
}

function P4Nivel({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  return (
    <>
      <QuestionTitle>{isEN ? "What is your hierarchical level?" : "¿Cuál es tu nivel jerárquico?"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "If none of the options fit you, choose 'Other' and describe it in your own words."
          : "Si ninguna opción te representa, elegí \"Otro\" y describilo en tus palabras."}
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {NIVELES.map((opt) => (
          <CardOption key={opt} selected={r.nivel === opt} onClick={() => setR({ nivel: opt })}>
            {labelOf(opt, NIVELES_EN, isEN)}
          </CardOption>
        ))}
      </div>
      {r.nivel === "Otro" && (
        <div className="mt-6">
          <TextInput
            placeholder={isEN ? "Specify your level" : "Especificá tu nivel"}
            value={r.nivelOtro ?? ""}
            onChange={(e) => setR({ nivelOtro: e.target.value })}
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function P7Funciones({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const sel = r.funciones ?? [];
  const funcsDisplay = isEN ? FUNCIONES_EN : FUNCIONES;
  const toggle = (opt: string) => {
    if (sel.includes(opt)) setR({ funciones: sel.filter((x) => x !== opt) });
    else setR({ funciones: [...sel, opt] });
  };
  return (
    <>
      <QuestionTitle>{isEN ? "What functions are actually part of your work?" : "¿Qué funciones reales forman parte de tu trabajo?"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "Select all functions that are actually part of your work — even if they're not in your formal job description."
          : "Seleccioná todas las funciones que forman parte real de tu trabajo — aunque no estén en tu descripción formal de puesto."}
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {funcsDisplay.map((opt) => (
          <CardOption key={opt} selected={sel.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>
      {(sel.includes("Otra") || sel.includes("Other")) && (
        <div className="mt-6">
          <TextInput
            placeholder={isEN ? "Specify the function" : "Especificá la función"}
            value={r.funcionesOtra ?? ""}
            onChange={(e) => setR({ funcionesOtra: e.target.value })}
          />
        </div>
      )}
      <div className="mt-8 pt-8 border-t border-hueso/10">
        <p className="font-body text-sm text-hueso/60 mb-3">
          {isEN
            ? "Or if you prefer, paste your job description or responsibilities here and AI will extract the functions."
            : "O si preferís, pegá tu descripción de puesto o responsabilidades acá y la IA extrae las funciones."}
        </p>
        <TextArea
          placeholder={isEN ? "Paste your job description..." : "Pegá tu descripción de puesto..."}
          value={r.funcionesTexto ?? ""}
          onChange={(e) => setR({ funcionesTexto: e.target.value })}
        />
      </div>
    </>
  );
}

function P9Idiomas({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const idiomas = r.idiomas ?? [];

  const update = (i: number, patch: Partial<Idioma>) => {
    const copy = [...idiomas];
    copy[i] = { ...copy[i], ...patch };
    setR({ idiomas: copy, sinIdiomas: false });
  };
  const add = () => setR({ idiomas: [...idiomas, { idioma: "", nivel: "" }], sinIdiomas: false });
  const remove = (i: number) => setR({ idiomas: idiomas.filter((_, idx) => idx !== i) });

  return (
    <>
      <QuestionTitle>
        {isEN ? "What languages do you use at work besides Spanish?" : "¿Qué idiomas usás en tu trabajo además del español?"}
      </QuestionTitle>
      {r.sinIdiomas ? (
        <div className="border border-hueso/20 p-5 text-hueso/70 font-body">
          {isEN ? "You don't use other languages at work." : "No usás otros idiomas en tu trabajo."}
          <button
            type="button"
            className="ml-3 font-ui text-[10px] text-hueso/60 hover:text-hueso underline"
            onClick={() => setR({ sinIdiomas: false })}
          >
            {isEN ? "Change" : "Cambiar"}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {idiomas.map((idi, i) => (
              <div key={i} className="border border-hueso/15 p-4 bg-hueso/[0.02]">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="font-ui text-[10px] text-hueso/50">{isEN ? `LANGUAGE ${i + 1}` : `IDIOMA ${i + 1}`}</p>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="font-ui text-[10px] text-hueso/40 hover:text-hueso"
                  >
                    {isEN ? "Remove" : "Quitar"}
                  </button>
                </div>
                <TextInput
                  placeholder={isEN ? "E.g.: English, Portuguese, French" : "Ej: Inglés, Portugués, Francés"}
                  value={idi.idioma}
                  onChange={(e) => update(i, { idioma: e.target.value })}
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {NIVELES_IDIOMA.map((n) => (
                    <ChipOption key={n} selected={idi.nivel === n} onClick={() => update(i, { nivel: n })}>
                      {labelOf(n, NIVELES_IDIOMA_EN, isEN)}
                    </ChipOption>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="font-ui text-[9px] text-hueso/40 mb-2">{isEN ? "INTERNATIONAL CERTIFICATION (OPTIONAL)" : "CERTIFICACIÓN INTERNACIONAL (OPCIONAL)"}</p>
                  <TextInput
                    placeholder={isEN ? "E.g.: TOEFL 95, Cambridge C1, DELF B2" : "Ej: TOEFL 95, Cambridge C1, DELF B2"}
                    value={idi.certificacion ?? ""}
                    onChange={(e) => update(i, { certificacion: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={add}
              className="font-ui text-[11px] border border-hueso/30 text-hueso/80 px-4 py-2 hover:border-hueso transition-colors"
            >
              {isEN ? "+ Add language" : "+ Agregar idioma"}
            </button>
            <button
              type="button"
              onClick={() => setR({ sinIdiomas: true, idiomas: [] })}
              className="font-ui text-[11px] text-hueso/50 hover:text-hueso transition-colors"
            >
              {isEN ? "I don't use other languages at work" : "No uso otros idiomas en mi trabajo"}
            </button>
          </div>
        </>
      )}
    </>
  );
}

function P12Formacion({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  return (
    <MultiCards
      title={isEN ? "What is your educational background?" : "¿Cuál es tu formación?"}
      hint={isEN ? "You can select multiple." : "Podés seleccionar varias."}
      options={isEN ? FORMACIONES_EN : FORMACIONES}
      value={r.formacion}
      onChange={(v) => setR({ formacion: v })}
    />
  );
}

function P13Certificaciones({ r, setR, certRawInput, onCertRawChange }: Props & { certRawInput: string; onCertRawChange: (v: string) => void }) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const items = r.certificaciones ?? [];
  const add = () => {
    const v = certRawInput.trim();
    if (!v) return;
    if (items.includes(v)) { onCertRawChange(""); setR({ certificacionesPending: "" }); return; }
    setR({ certificaciones: [...items, v], sinCertificaciones: false, certificacionesPending: "" });
    onCertRawChange("");
  };
  return (
    <>
      <QuestionTitle>{isEN ? "Do you have professional certifications?" : "¿Tenés certificaciones profesionales?"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "Formal certifications include those with an exam or accreditation from a recognized body (e.g.: PMP, AWS Certified, CFA, Scrum Master, Google Analytics, SHRM, CPA). Do not include short courses without exams or internal training."
          : "Cuentan como certificaciones formales aquellas que incluyen examen o acreditación de un organismo reconocido (ej: PMP, AWS Certified, CFA, Scrum Master, Google Analytics, SHRM, CPA). No incluyas cursos cortos sin examen ni capacitaciones internas."}
      </QuestionHint>
      {r.sinCertificaciones ? (
        <div className="border border-hueso/20 p-5 text-hueso/70 font-body">
          {isEN ? "No relevant certifications." : "No tenés certificaciones relevantes."}
          <button
            type="button"
            className="ml-3 font-ui text-[10px] text-hueso/60 hover:text-hueso underline"
            onClick={() => setR({ sinCertificaciones: false })}
          >
            {isEN ? "Change" : "Cambiar"}
          </button>
        </div>
      ) : (
        <>
          <TextInput
            placeholder={isEN
              ? "E.g.: PMP, AWS, Google Analytics, SHRM. Type each one and press Enter."
              : "Ej: PMP, AWS, Google Analytics, SHRM. Escribí cada una y presioná Enter."}
            value={certRawInput}
            onChange={(e) => {
              const v = e.target.value;
              onCertRawChange(v);
              setR({ certificacionesPending: v, sinCertificaciones: v.trim() ? false : r.sinCertificaciones });
            }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          />
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {items.map((c) => (
                <span key={c} className="inline-flex items-center gap-2 font-ui text-[10px] border border-hueso/30 px-3 py-1.5">
                  {c}
                  <button
                    type="button"
                    onClick={() => setR({ certificaciones: items.filter((x) => x !== c) })}
                    className="text-hueso/50 hover:text-hueso"
                    aria-label={isEN ? `Remove ${c}` : `Quitar ${c}`}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setR({ sinCertificaciones: true, certificaciones: [] })}
            className="font-ui text-[11px] text-hueso/50 hover:text-hueso transition-colors mt-6"
          >
            {isEN ? "I don't have relevant certifications" : "No tengo certificaciones relevantes"}
          </button>
        </>
      )}
    </>
  );
}

function P14HerramientasIA({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const tools = r.herramientasIA ?? [];
  const usos = r.usoIA ?? [];
  const toolOptions = isEN ? [...HERRAMIENTAS_IA.slice(0, -1), "Other"] : HERRAMIENTAS_IA;
  const toggleTool = (t: string) => {
    if (tools.includes(t)) setR({ herramientasIA: tools.filter((x) => x !== t) });
    else setR({ herramientasIA: [...tools, t] });
  };
  const toggleUso = (u: string) => {
    if (usos.includes(u)) setR({ usoIA: usos.filter((x) => x !== u) });
    else setR({ usoIA: [...usos, u] });
  };
  return (
    <>
      <QuestionTitle>{isEN ? "What AI tools do you use at work?" : "¿Qué herramientas de IA usás en tu trabajo?"}</QuestionTitle>
      <QuestionHint>{isEN ? "Select all that apply." : "Seleccioná todas las que apliquen."}</QuestionHint>
      <div className="flex flex-wrap gap-2 mb-6">
        {toolOptions.map((t) => (
          <ChipOption key={t} selected={tools.includes(t)} onClick={() => toggleTool(t)}>
            {t}
          </ChipOption>
        ))}
      </div>
      {(tools.includes("Otra") || tools.includes("Other")) && (
        <div className="mb-10 animate-in fade-in duration-300">
          <TextInput
            placeholder={isEN ? "Specify here" : "Especificá acá"}
            value={r.herramientasIAOtra ?? ""}
            onChange={(e) => setR({ herramientasIAOtra: e.target.value })}
            autoFocus
          />
        </div>
      )}

      <div className="border-t border-hueso/10 pt-8 mb-10">
        <h2 className="font-display text-2xl mb-5 text-hueso">{isEN ? "How often do you use them?" : "¿Con qué frecuencia las usás?"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(isEN ? FRECUENCIAS_IA_EN : FRECUENCIAS_IA).map((f) => (
            <CardOption key={f} selected={r.frecuenciaIA === f} onClick={() => setR({ frecuenciaIA: f })}>
              {f}
            </CardOption>
          ))}
        </div>
      </div>

      <div className="border-t border-hueso/10 pt-8">
        <h2 className="font-display text-2xl mb-5 text-hueso">{isEN ? "What do you mainly use them for?" : "¿Para qué las usás principalmente?"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(isEN ? USOS_IA_EN : USOS_IA).map((u) => (
            <CardOption key={u} selected={usos.includes(u)} onClick={() => toggleUso(u)}>
              {u}
            </CardOption>
          ))}
        </div>
      </div>
    </>
  );
}

const SITUACIONES_LABELS_EN: Record<string, string> = {
  empleado: "I am currently employed",
  busqueda: "I am actively job searching",
  freelance: "I am a freelance or independent consultant",
  contractor: "I work as a contractor or under a service contract",
};
const SITUACIONES_DESC_EN: Record<string, string> = {
  contractor: "You have a contract with a company (usually international) with fixed weekly hours, but without formal local employment relationship.",
};

function P15Situacion({ r, setR, modo }: Props & { modo?: string }) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  return (
    <>
      <QuestionTitle>{isEN ? "What is your current employment situation?" : "¿Cuál es tu situación laboral actual?"}</QuestionTitle>
      {modo === "C" && (
        <QuestionHint>
          {isEN
            ? "Salary is optional in this mode — we still use it if you declare it to calculate your positioning."
            : "El salario es opcional en este modo — igual lo usamos si lo declarás para calcular tu posicionamiento."}
        </QuestionHint>
      )}
      <div className="grid grid-cols-1 gap-3 mb-8">
        {SITUACIONES.map((s) => (
          <div key={s.id}>
            <CardOption
              selected={r.situacion === s.id}
              onClick={() => setR({
                situacion: s.id,
                salario: undefined, moneda: undefined, brutoNeto: undefined,
                trabajaActualmente: undefined, salarioAnterior: undefined,
                monedaAnterior: undefined, tiempoSinTrabajo: undefined,
                contractorHoras: undefined, contractorPago: undefined,
              })}
            >
              {isEN ? (SITUACIONES_LABELS_EN[s.id] ?? s.label) : s.label}
            </CardOption>
            {s.descripcion && r.situacion === s.id && (
              <p className="mt-2 ml-1 font-body text-xs text-hueso/55 leading-relaxed animate-in fade-in duration-300">
                {isEN ? (SITUACIONES_DESC_EN[s.id] ?? s.descripcion) : s.descripcion}
              </p>
            )}
          </div>
        ))}
      </div>

      {r.situacion === "empleado" && (
        <div className="border-t border-hueso/10 pt-8 space-y-6">
          <SalarioInput
            label={isEN ? "What is your current gross monthly salary?" : "¿Cuál es tu salario bruto mensual actual?"}
            valor={r.salario}
            moneda={r.moneda}
            onValor={(v) => setR({ salario: v })}
            onMoneda={(m) => setR({ moneda: m })}
          />
          <div>
            <p className="font-body text-sm text-hueso/70 mb-3">
              {isEN
                ? "Is this amount gross (before taxes) or net (what you receive in hand)?"
                : "¿Este monto es bruto (antes de impuestos) o neto (lo que recibís en mano)?"}
            </p>
            <div className="flex gap-2">
              <ChipOption selected={r.brutoNeto === "bruto"} onClick={() => setR({ brutoNeto: "bruto" })}>{isEN ? "Gross" : "Bruto"}</ChipOption>
              <ChipOption selected={r.brutoNeto === "neto"} onClick={() => setR({ brutoNeto: "neto" })}>{isEN ? "Net" : "Neto"}</ChipOption>
            </div>
          </div>
        </div>
      )}

      {r.situacion === "freelance" && (
        <div className="border-t border-hueso/10 pt-8">
          <SalarioInput
            label={isEN ? "How much do you earn per month on average?" : "¿Cuánto cobrás mensualmente en promedio?"}
            valor={r.salario}
            moneda={r.moneda}
            onValor={(v) => setR({ salario: v })}
            onMoneda={(m) => setR({ moneda: m })}
          />
        </div>
      )}

      {r.situacion === "contractor" && (
        <div className="border-t border-hueso/10 pt-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <p className="font-body text-base text-hueso mb-3">
              {isEN ? "Does your contract establish a fixed weekly hours?" : "¿Tu contrato establece una cantidad fija de horas semanales?"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CardOption selected={r.contractorHoras === "40h"} onClick={() => setR({ contractorHoras: "40h" })}>{isEN ? "Yes, 40 hours" : "Sí, 40 horas"}</CardOption>
              <CardOption selected={r.contractorHoras === "menos40"} onClick={() => setR({ contractorHoras: "menos40" })}>{isEN ? "Yes, less than 40 hours" : "Sí, menos de 40 horas"}</CardOption>
              <CardOption selected={r.contractorHoras === "proyecto"} onClick={() => setR({ contractorHoras: "proyecto" })}>{isEN ? "No, project-based" : "No, es por proyecto"}</CardOption>
            </div>
          </div>
          <div>
            <p className="font-body text-base text-hueso mb-3">{isEN ? "How do you receive your payment?" : "¿Cómo recibís tu pago?"}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CardOption selected={r.contractorPago === "usd"} onClick={() => setR({ contractorPago: "usd" })}>{isEN ? "In USD or foreign currency" : "En USD o moneda extranjera"}</CardOption>
              <CardOption selected={r.contractorPago === "local"} onClick={() => setR({ contractorPago: "local" })}>{isEN ? "In local currency" : "En moneda local"}</CardOption>
              <CardOption selected={r.contractorPago === "mixto"} onClick={() => setR({ contractorPago: "mixto" })}>{isEN ? "Mixed" : "Mixto"}</CardOption>
            </div>
          </div>
          <SalarioInput
            label={isEN ? "How much do you earn per month?" : "¿Cuánto cobrás mensualmente?"}
            valor={r.salario}
            moneda={r.moneda}
            onValor={(v) => setR({ salario: v })}
            onMoneda={(m) => setR({ moneda: m })}
          />
        </div>
      )}

      {r.situacion === "busqueda" && (
        <div className="border-t border-hueso/10 pt-8 space-y-6">
          <div>
            <p className="font-body text-base text-hueso mb-3">
              {isEN ? "Are you currently working while searching?" : "¿Estás trabajando actualmente mientras buscás?"}
            </p>
            <div className="flex gap-2">
              <ChipOption selected={r.trabajaActualmente === "si"} onClick={() => setR({ trabajaActualmente: "si" })}>{isEN ? "Yes" : "Sí"}</ChipOption>
              <ChipOption selected={r.trabajaActualmente === "no"} onClick={() => setR({ trabajaActualmente: "no" })}>No</ChipOption>
            </div>
          </div>
          {r.trabajaActualmente === "si" && (
            <SalarioInput
              label={isEN ? "What is your current gross monthly salary?" : "¿Cuál es tu salario bruto mensual actual?"}
              valor={r.salario}
              moneda={r.moneda}
              onValor={(v) => setR({ salario: v })}
              onMoneda={(m) => setR({ moneda: m })}
            />
          )}
          {r.trabajaActualmente === "no" && (
            <>
              <SalarioInput
                label={isEN ? "How much did you earn in your last job?" : "¿Cuánto ganabas en tu último trabajo?"}
                valor={r.salarioAnterior}
                moneda={r.monedaAnterior}
                onValor={(v) => setR({ salarioAnterior: v })}
                onMoneda={(m) => setR({ monedaAnterior: m })}
              />
              <div>
                <p className="font-body text-base text-hueso mb-3">{isEN ? "How long ago did you leave that job?" : "¿Hace cuánto dejaste ese trabajo?"}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(isEN ? TIEMPOS_SIN_TRABAJO_EN : TIEMPOS_SIN_TRABAJO).map((t) => (
                    <CardOption key={t} selected={r.tiempoSinTrabajo === t} onClick={() => setR({ tiempoSinTrabajo: t })}>
                      {t}
                    </CardOption>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function SalarioInput({ label, valor, moneda, onValor, onMoneda }: {
  label: string; valor?: number; moneda?: string;
  onValor: (v: number | undefined) => void; onMoneda: (m: string) => void;
}) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const formatted = valor != null ? new Intl.NumberFormat("es-AR").format(valor) : "";
  const handleChange = (raw: string) => {
    // Solo dígitos: ignoramos puntos, comas y cualquier separador. Sin decimales.
    const digits = raw.replace(/\D/g, "");
    if (!digits) { onValor(undefined); return; }
    onValor(Number(digits));
  };
  return (
    <div>
      <p className="font-body text-base text-hueso mb-3">{label}</p>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <TextInput
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={formatted}
            onChange={(e) => handleChange(e.target.value)}
          />
          <p className="font-body text-[11px] text-hueso/40 mt-1">
            {isEN
              ? "Enter a whole number, no decimals. Periods are added automatically."
              : "Ingresá un número entero, sin decimales. Los puntos los agregamos automáticamente."}
          </p>
        </div>
        <div>
          <select
            value={moneda ?? ""}
            onChange={(e) => onMoneda(e.target.value)}
            className="bg-tinta border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso py-3 pr-2"
          >
            <option value="" className="bg-tinta">{isEN ? "Currency" : "Moneda"}</option>
            {MONEDAS.map((m) => <option key={m} value={m} className="bg-tinta">{m}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function P16Beneficios({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const sel = r.beneficios ?? [];
  const NINGUNO = isEN ? "None of the above" : "Ninguno de los anteriores";
  const bensDisplay = isEN ? BENEFICIOS_EN : BENEFICIOS;
  const toggle = (opt: string) => {
    if (opt === NINGUNO) {
      setR({ beneficios: sel.includes(NINGUNO) ? [] : [NINGUNO], beneficiosOtro: "" });
      return;
    }
    const without = sel.filter((x) => x !== NINGUNO && x !== "Ninguno de los anteriores" && x !== "None of the above");
    if (without.includes(opt)) setR({ beneficios: without.filter((x) => x !== opt) });
    else setR({ beneficios: [...without, opt] });
  };

  const paisKey = r.pais && COBERTURA_MEDICA_POR_PAIS[r.pais] ? r.pais : "default";
  const cobOpts = COBERTURA_MEDICA_POR_PAIS[paisKey][isEN ? "en" : "es"];
  const showAlcance = esCoberturaEmpleador(r.coberturaMedicaTipo);
  const alcanceOpts = isEN ? COBERTURA_ALCANCE_EN : COBERTURA_ALCANCE_ES;

  return (
    <>
      <QuestionTitle>{isEN ? "What benefits do you receive?" : "¿Qué beneficios recibís?"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "Start with your medical coverage, then select all other benefits that apply."
          : "Empezá por tu cobertura médica y luego seleccioná todos los demás beneficios que apliquen."}
      </QuestionHint>

      {/* Paso 1: Tipo de cobertura médica */}
      <div className="mb-8">
        <p className="font-ui text-[11px] text-hueso/60 mb-3 uppercase tracking-wider">
          {isEN ? "1 · Type of medical coverage" : "1 · Tipo de cobertura médica"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cobOpts.map((opt) => (
            <CardOption
              key={opt}
              selected={r.coberturaMedicaTipo === opt}
              onClick={() => {
                const next: Partial<typeof r> = { coberturaMedicaTipo: opt };
                if (!esCoberturaEmpleador(opt)) next.coberturaMedicaAlcance = undefined;
                setR(next);
              }}
            >
              {opt}
            </CardOption>
          ))}
        </div>
      </div>

      {/* Paso 2: Alcance (sólo si el empleador paga total o parcial) */}
      {showAlcance && (
        <div className="mb-8 animate-in fade-in duration-300">
          <p className="font-ui text-[11px] text-hueso/60 mb-3 uppercase tracking-wider">
            {isEN ? "2 · Coverage scope" : "2 · Alcance de la cobertura"}
          </p>
          <p className="font-body text-base text-hueso/80 mb-3">
            {isEN ? "Does the coverage include your family?" : "¿La cobertura incluye a tu grupo familiar?"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alcanceOpts.map((opt) => (
              <CardOption
                key={opt}
                selected={r.coberturaMedicaAlcance === opt}
                onClick={() => setR({ coberturaMedicaAlcance: opt })}
              >
                {opt}
              </CardOption>
            ))}
          </div>
        </div>
      )}

      {/* Otros beneficios */}
      <p className="font-ui text-[11px] text-hueso/60 mb-3 uppercase tracking-wider">
        {isEN ? "Other benefits (select all that apply)" : "Otros beneficios (seleccioná todos los que apliquen)"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bensDisplay.map((opt) => (
          <CardOption key={opt} selected={sel.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>
      {(sel.includes("Otro") || sel.includes("Other")) && (
        <div className="mt-6">
          <TextInput
            placeholder={isEN ? "Specify the benefit(s)" : "Especificá el/los beneficios"}
            value={r.beneficiosOtro ?? ""}
            onChange={(e) => setR({ beneficiosOtro: e.target.value })}
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function P17Descripcion({ r, setR, modo }: Props & { modo?: string }) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  if (modo === "B") {
    return (
      <>
        <QuestionTitle>{isEN ? "Does your actual role go beyond your job title?" : "¿Tu rol va más allá del título de tu puesto?"}</QuestionTitle>
        <QuestionHint>
          {isEN
            ? "Describe what you actually do: decisions you make, projects you lead, impact you generate — even if they're not in your formal description. This is the central argument for your negotiation."
            : "Describí lo que hacés de verdad: decisiones que tomás, proyectos que liderás, impacto que generás — aunque no estén en tu descripción formal. Esto es el argumento central de tu negociación."}
        </QuestionHint>
        <TextArea
          placeholder={isEN
            ? "Describe the real scope of your role: decisions, projects, responsibilities that exceed your title, concrete business impact."
            : "Describí el alcance real de tu puesto: decisiones, proyectos, responsabilidades que exceden tu título, impacto concreto en el negocio."}
          value={r.descripcionPuesto ?? ""}
          onChange={(e) => setR({ descripcionPuesto: e.target.value })}
          className="min-h-48"
        />
      </>
    );
  }
  if (modo === "C") {
    return (
      <>
        <QuestionTitle>{isEN ? "What experience do you want to highlight for this role?" : "¿Qué experiencia querés destacar para este rol?"}</QuestionTitle>
        <QuestionHint>
          {isEN
            ? "Describe the most relevant parts of your career for the role you're applying to. This is used to build your arguments with the target company."
            : "Describí lo más relevante de tu trayectoria para el puesto al que aplicás. Esto se usa para construir tus argumentos frente a la empresa objetivo."}
        </QuestionHint>
        <TextArea
          placeholder={isEN
            ? "Describe the achievements, projects, and skills most relevant to the role you're applying for."
            : "Describí los logros, proyectos y habilidades más relevantes para el rol al que aplicás."}
          value={r.descripcionPuesto ?? ""}
          onChange={(e) => setR({ descripcionPuesto: e.target.value })}
          className="min-h-48"
        />
      </>
    );
  }
  if (modo === "D") {
    return (
      <>
        <QuestionTitle>{isEN ? "Tell us about your current role and where you're headed" : "Contanos sobre tu rol actual y adónde apuntás"}</QuestionTitle>
        <QuestionHint>
          {isEN
            ? "Describe your current role and the next move you want to make. The diagnostic maps the route between both."
            : "Describí tu puesto actual y el próximo salto que querés dar. El diagnóstico traza la ruta entre ambos."}
        </QuestionHint>
        <TextArea
          placeholder={isEN
            ? "Describe your current role: responsibilities, decisions, and real scope."
            : "Describí tu puesto actual: responsabilidades, decisiones y alcance real."}
          value={r.descripcionPuesto ?? ""}
          onChange={(e) => setR({ descripcionPuesto: e.target.value })}
          className="min-h-48"
        />
        <div className="mt-6">
          <p className="font-body text-base text-hueso mb-3">{isEN ? "Where are you aiming?" : "¿A dónde apuntás?"}</p>
          <TextArea
            placeholder={isEN
              ? "Describe the next role or level you want to reach: title, type of company, responsibilities you want to take on."
              : "Describí el siguiente rol o nivel que querés alcanzar: título, tipo de empresa, responsabilidades que buscás asumir."}
            value={r.targetDireccionD ?? ""}
            onChange={(e) => setR({ targetDireccionD: e.target.value })}
            className="min-h-32"
          />
        </div>
      </>
    );
  }
  // Modo A (default)
  return (
    <>
      <QuestionTitle>{isEN ? "Tell us about your role" : "Contanos sobre tu puesto"}</QuestionTitle>
      <QuestionHint>
        {isEN ? "The more detail, the more precise your PayRank." : "Cuanto más detalle, más preciso tu PayRank."}
      </QuestionHint>
      <TextArea
        placeholder={isEN
          ? "Describe your role, main responsibilities, who you report to, and what decisions you make."
          : "Describí tu puesto, responsabilidades principales, a quién reportás y qué decisiones tomás."}
        value={r.descripcionPuesto ?? ""}
        onChange={(e) => setR({ descripcionPuesto: e.target.value })}
        className="min-h-48"
      />
    </>
  );
}

function P18Genero({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  return (
    <>
      <QuestionTitle>{isEN ? "Gender gap analysis" : "Análisis de brecha de género"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "The analysis compares your compensation with others in the same role, level, industry and country, segmented by gender — relevant for any identity, not just women. The information is used exclusively for this calculation and stored anonymously."
          : "El análisis compara tu compensación con la de tu mismo puesto, nivel, industria y país, segmentado por género — sirve para cualquier identidad, no solo para mujeres. La información se usa exclusivamente para este cálculo y se almacena de forma anonimizada."}
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(isEN ? GENEROS_EN : GENEROS).map((g) => (
          <CardOption key={g} selected={r.genero === g} onClick={() => setR({ genero: g })}>
            {g}
          </CardOption>
        ))}
      </div>
    </>
  );
}

function P19Contacto({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const paisSel = r.pais === "Otro" ? r.paisOtro : r.pais;
  const phonePlaceholder = ((): string => {
    switch ((paisSel ?? "").toLowerCase()) {
      case "argentina": return "+54 9 11 XXXX XXXX";
      case "méxico":
      case "mexico": return "+52 1 55 XXXX XXXX";
      case "chile": return "+56 9 XXXX XXXX";
      case "colombia": return "+57 3XX XXX XXXX";
      case "españa":
      case "espana": return "+34 6XX XXX XXX";
      case "estados unidos":
      case "usa": return "+1 (XXX) XXX-XXXX";
      default: return "+[code] number";
    }
  })();
  return (
    <>
      <QuestionTitle>{isEN ? "How do we contact you?" : "¿Cómo te contactamos?"}</QuestionTitle>
      <div className="space-y-8">
        <div>
          <p className="font-ui text-[10px] text-hueso/50 mb-3">{isEN ? "EMAIL (REQUIRED)" : "MAIL (OBLIGATORIO)"}</p>
          <TextInput
            type="email"
            placeholder="tu@mail.com"
            value={r.email ?? ""}
            onChange={(e) => setR({ email: e.target.value })}
          />
          <p className="font-body text-xs text-hueso/45 mt-2">
            {isEN
              ? "To receive your complete PayRank and access your report at any time. For any questions write us at hello@payrank.co"
              : "Para recibir tu PayRank completo y acceder a tu reporte en cualquier momento. Ante cualquier consulta escribinos a hello@payrank.co"}
          </p>
        </div>
        <div>
          <p className="font-ui text-[10px] text-hueso/50 mb-3">{isEN ? "WHATSAPP (OPTIONAL)" : "WHATSAPP (OPCIONAL)"}</p>
          <TextInput
            type="tel"
            placeholder={phonePlaceholder}
            value={r.whatsapp ?? ""}
            onChange={(e) => setR({ whatsapp: e.target.value })}
          />
          <p className="font-body text-xs text-hueso/45 mt-2">
            {isEN
              ? "Optional. If you leave it, you'll also receive your PayRank via WhatsApp."
              : "Opcional. Si lo dejás, también recibís tu PayRank por WhatsApp."}
          </p>
        </div>
      </div>
    </>
  );
}
