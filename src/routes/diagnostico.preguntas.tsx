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
  ALCANCES, EXP_INDUSTRIA, EXP_TOTAL, FORMACIONES, FRECUENCIAS_IA,
  FUNCIONES, GENEROS, HERRAMIENTAS_IA, INDUSTRIAS, INDUSTRIAS_EN, INTERACCIONES,
  MONEDAS, MOTIVACIONES, MOTIVACIONES_EN, NIVELES, NIVELES_EN, NIVELES_IDIOMA, NIVELES_IDIOMA_EN, PAISES, PAISES_EN,
  PERSONAS_A_CARGO, SITUACIONES, TIEMPOS_SIN_TRABAJO, TIPOS_EMPRESA, USOS_IA, labelOf,
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

function paisToMoneda(pais?: string, paisOtro?: string): string {
  const p = (pais === "Otro" ? paisOtro : pais) ?? "";
  switch (p) {
    case "Argentina": return "ARS";
    case "México": return "MXN";
    case "Chile": return "CLP";
    case "Colombia": return "COP";
    case "Perú": return "PEN";
    case "Uruguay": return "UYU";
    case "Brasil": return "BRL";
    case "Ecuador": return "USD";
    case "Estados Unidos": return "USD";
    case "España": return "EUR";
    default: return "USD";
  }
}

function placeholderPrestadora(pais?: string, paisOtro?: string, isEN?: boolean): string {
  const p = (pais === "Otro" ? paisOtro : pais) ?? "";
  const map: Record<string, { es: string; en: string }> = {
    Argentina: { es: "ej: OSDE, Swiss Medical, Medicus, Galeno, OMINT", en: "e.g., OSDE, Swiss Medical, Medicus, Galeno, OMINT" },
    México: { es: "ej: GNP Salud, AXA, Metlife, Allianz, IMSS Voluntario", en: "e.g., GNP Salud, AXA, Metlife, Allianz, IMSS Voluntary" },
    Colombia: { es: "ej: Sura, Compensar, Sanitas, Nueva EPS, Colmédica", en: "e.g., Sura, Compensar, Sanitas, Nueva EPS, Colmedica" },
    Perú: { es: "ej: Rímac, Pacífico, Mapfre, La Positiva, EsSalud Potestativo", en: "e.g., Rimac, Pacifico, Mapfre, La Positiva, EsSalud Potestativo" },
    Chile: { es: "ej: Banmédica, Colmena, Cruz Blanca, Consalud, Isapre Vida Tres", en: "e.g., Banmedica, Colmena, Cruz Blanca, Consalud, Isapre Vida Tres" },
    Uruguay: { es: "ej: CASMU, Médica Uruguaya, SEMM, Mucam, SMI", en: "e.g., CASMU, Medica Uruguaya, SEMM, Mucam, SMI" },
    Brasil: { es: "ej: Amil, Bradesco Saúde, SulAmérica, Unimed, NotreDame Intermédica", en: "e.g., Amil, Bradesco Saude, SulAmerica, Unimed, NotreDame Intermedica" },
    España: { es: "ej: Sanitas, Adeslas, Asisa, DKV, Mapfre Salud", en: "e.g., Sanitas, Adeslas, Asisa, DKV, Mapfre Salud" },
    "Estados Unidos": { es: "ej: Blue Cross, Aetna, UnitedHealth, Cigna, Kaiser", en: "e.g., Blue Cross, Aetna, UnitedHealth, Cigna, Kaiser" },
    Ecuador: { es: "ej: Ecuasanitas, BMI, Salud S.A., AXA Colpatria, IESS Voluntario", en: "e.g., Ecuasanitas, BMI, Salud S.A., AXA Colpatria, IESS Voluntary" },
  };
  const found = map[p];
  if (found) return isEN ? `Name of provider (${found.en})` : `Nombre de la prestadora (${found.es})`;
  return isEN ? "Name of your health provider or insurer" : "Nombre de tu prestadora o aseguradora médica";
}

function bucketExpTotal(n: unknown): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  if (n < 3) return "Menos de 3 años";
  if (n < 7) return "3–7 años";
  if (n < 12) return "7–12 años";
  if (n < 20) return "12–20 años";
  return "Más de 20 años";
}

function bucketExpIndustria(n: unknown): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  if (n < 2) return "Menos de 2 años";
  if (n < 5) return "2–5 años";
  if (n < 10) return "5–10 años";
  return "Más de 10 años";
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
  const expTotStr = bucketExpTotal(d.experiencia_total_anios) ?? asString(d.anos_experiencia_total_inferidos);
  const expTot = findOption(EXP_TOTAL, expTotStr);
  if (expTot) out.expTotal = expTot;
  const expIndStr = bucketExpIndustria(d.experiencia_industria_anios) ?? asString(d.anos_experiencia_industria_inferidos);
  const expInd = findOption(EXP_INDUSTRIA, expIndStr);
  if (expInd) out.expIndustria = expInd;

  const formMatched: string[] = [];
  const tituloAcad = asString(d.titulo_cv_academico);
  if (tituloAcad) {
    const m = findOption(FORMACIONES, tituloAcad);
    if (m) formMatched.push(m);
  }
  const form = asArrayStr(d.formacion);
  if (form) {
    for (const f of form) {
      const m = findOption(FORMACIONES, f);
      if (m) formMatched.push(m);
    }
  }
  if (formMatched.length) {
    // Selección única: nos quedamos con el mayor nivel alcanzado (último en el orden de FORMACIONES)
    out.formacion = formMatched.reduce((best, cur) =>
      FORMACIONES.indexOf(cur) > FORMACIONES.indexOf(best) ? cur : best
    );
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

  const pais = findOption(PAISES, asString(d.pais_inferido));
  if (pais) out.pais = pais;

  const fechaIngreso = asString(d.fecha_ingreso_empresa_actual);
  if (fechaIngreso) {
    const m = fechaIngreso.match(/^(\d{4})-(\d{2})/);
    if (m) out.antiguedadDesde = `${m[1]}-${m[2]}`;
  }

  const prestadora = asString(d.nombre_prestadora_salud);
  if (prestadora) out.beneficio_salud_prestadora = prestadora;

  const tituloCv = asString(d.titulo_cv);
  if (tituloCv && !out.tituloElegido) {
    const sinonimos: Record<string, string> = {
      "project manager": "Gestión de proyectos / PMO",
      "pmo": "Gestión de proyectos / PMO",
      "gerente de proyectos": "Gestión de proyectos / PMO",
      "coordinador de proyectos": "Gestión de proyectos / PMO",
      "product manager": "Tecnología/Producto",
      "product owner": "Tecnología/Producto",
      "desarrollador": "Desarrollo de software/Web",
      "developer": "Desarrollo de software/Web",
      "analista": "Data/Analytics",
      "data analyst": "Data/Analytics",
      "gerente de rrhh": "RRHH/Talento",
      "hr manager": "RRHH/Talento",
      "jefe de personas": "RRHH/Talento",
      "gerente comercial": "Ventas/Comercial",
      "sales manager": "Ventas/Comercial",
      "gerente de marketing": "Marketing",
      "marketing manager": "Marketing",
      "gerente de finanzas": "Finanzas/Contabilidad",
      "finance manager": "Finanzas/Contabilidad",
      "gerente general": "Estrategia",
      "director": "Estrategia",
    };
    const tituloLower = tituloCv.toLowerCase();
    const sinonimo = Object.entries(sinonimos).find(([k]) => tituloLower.includes(k))?.[1];
    const matchedFuncion = sinonimo ?? findOption(FUNCIONES, tituloCv);
    out.tituloElegido = matchedFuncion ?? tituloCv;
  }

  // Salario desde recibo
  const salarioInferido = d.salario_actual_inferido;
  if (salarioInferido != null) {
    const num = typeof salarioInferido === "number" ? salarioInferido : Number(String(salarioInferido).replace(/[^0-9]/g, ""));
    if (!isNaN(num) && num > 0) out.salario = num;
  }
  const monedaInferida = asString(d.moneda_inferida);
  if (monedaInferida) {
    const monedaUp = monedaInferida.toUpperCase();
    if (["ARS", "USD", "EUR", "MXN", "CLP", "COP", "BRL"].includes(monedaUp)) out.moneda = monedaUp;
  }
  const tipoSalario = asString(d.tipo_salario_inferido);
  if (tipoSalario) {
    const t = tipoSalario.toLowerCase();
    if (t === "bruto" || t === "neto") out.brutoNeto = t as "bruto" | "neto";
  }

  return out;
}

const STEP_TITULO_ES: Record<number, string> = {
  2: "¿En qué industria trabajás?",
  3: "¿En qué tipo de empresa trabajás?",
  4: "¿Cuál es tu nivel jerárquico?",
  9: "¿Qué idiomas usás en tu trabajo?",
  10: "¿Cuántos años de experiencia total tenés?",
  11: "¿Cuántos años de experiencia tenés en esta industria?",
  12: "¿Cuál es tu formación?",
  13: "¿Tenés certificaciones profesionales?",
  14: "¿Qué herramientas de IA usás?",
};

const STEP_TITULO_EN: Record<number, string> = {
  2: "What industry do you work in?",
  3: "What type of company do you work at?",
  4: "What is your hierarchical level?",
  9: "What languages do you use at work?",
  10: "How many years of total experience do you have?",
  11: "How many years of experience in this industry?",
  12: "What is your educational background?",
  13: "Do you have professional certifications?",
  14: "What AI tools do you use?",
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
  "Doctorate",
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
      case 2: {
        const m = findOption(INDUSTRIAS, asString(d.industria_inferida));
        return isEN && m ? (INDUSTRIAS_EN[m] ?? m) : m;
      }
      case 3: {
        const m = findOption(TIPOS_EMPRESA, asString(d.tipo_empresa_inferida));
        if (!m) return null;
        if (!isEN) return m;
        const idx = TIPOS_EMPRESA.indexOf(m);
        return idx >= 0 ? TIPOS_EMPRESA_EN[idx] : m;
      }
      case 4: {
        const m = findOption(NIVELES, asString(d.nivel_jerarquico_inferido));
        return isEN && m ? (NIVELES_EN[m] ?? m) : m;
      }
      case 9: {
        const arr = Array.isArray(d.idiomas) ? d.idiomas : null;
        if (!arr || !arr.length) return null;
        return arr.map((i) => {
          if (typeof i === "string") return i;
          const lvl = i.nivel ?? "";
          const lvlDisplay = isEN ? (NIVELES_IDIOMA_EN[lvl] ?? lvl) : lvl;
          return `${i.idioma ?? ""}${lvlDisplay ? ` (${lvlDisplay})` : ""}`;
        }).filter(Boolean).join(" · ");
      }
      case 10: return asString(d.anos_experiencia_total_inferidos);
      case 11: return asString(d.anos_experiencia_industria_inferidos);
      case 12: { const a = asArrayStr(d.formacion); return a ? a.join(" · ") : null; }
      case 13: { const a = asArrayStr(d.certificaciones); return a ? a.join(" · ") : null; }
      case 14: { const a = asArrayStr(d.herramientas_ia_inferidas); return a ? a.join(" · ") : null; }
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
const EXTRACTABLE_STEPS = new Set([2, 3, 4, 9, 10, 11, 12, 13, 14]);

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

  // Orden de pasos. Para freelance/contractor, Beneficios (paso lógico 15) va
  // inmediatamente después de Situación (paso 1), que incluye horas trabajadas
  // y monto mensual. El resto del flujo (empleado/búsqueda) no cambia.
  const esIndep = r.situacion === "contractor";
  const orden = React.useMemo(() => {
    const base = Array.from({ length: TOTAL }, (_, i) => i);
    if (!esIndep) return base;
    return [0, 1, 15, ...base.filter((i) => i >= 2 && i !== 15)];
  }, [esIndep]);
  // step = índice visual de navegación; stepLogico = pregunta que se muestra.
  const stepLogico = step === -1 ? -1 : (orden[step] ?? step);

  // Pre-cargar respuestas desde extracción una sola vez al entrar
  React.useEffect(() => {
    if (appliedRef.current || !datos) return;
    appliedRef.current = true;
    setState((s) => ({ ...s, respuestas: { ...s.respuestas, ...mapExtraccionAResp(datos) } }));
  }, [datos, setState]);

  // Scroll al tocar cada paso para que el título y primer campo se vean arriba
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Pasos pendientes (en modo documento) = pasos sin extracción válida o forzados a override
  const pendientes = React.useMemo(() => {
    if (!hasDoc) return null;
    const arr: number[] = [];
    for (const i of orden) {
      // Pasos 10 y 11 (años de experiencia total / industria) siempre se muestran,
      // aunque vengan pre-completados desde el CV, para que el usuario pueda verificar/editar.
      if (i === 10 || i === 11 || !EXTRACTABLE_STEPS.has(i) || !tieneExtraccion(i, datos!) || overrides.has(i)) arr.push(i);
    }
    return arr;
  }, [hasDoc, datos, overrides, orden]);

  const next = () => {
    if (step === -1) { setStep(0); return; }
    if (stepLogico === 13) {
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
    if (stepLogico === 15) {
      const otherText = r.beneficiosOtro?.trim();
      const items = r.beneficios ?? [];
      const hasOther = items.includes("Otro") || items.includes("Other");
      if (hasOther && otherText) {
        const committed = items.filter((x) => x !== "Otro" && x !== "Other");
        setR({
          beneficios: committed.includes(otherText) ? committed : [...committed, otherText],
          beneficiosOtro: "",
        });
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
      pasosOverride: Array.from(new Set([...(s.pasosOverride ?? []), stepLogico])),
    }));
  };

  const valid = isValid(stepLogico, r, modo, certRawInput);
  const extraccionTexto = stepLogico >= 0 && hasDoc && EXTRACTABLE_STEPS.has(stepLogico) && !overrides.has(stepLogico) && stepLogico !== 10 && stepLogico !== 11
    ? resumenExtraccion(stepLogico, datos!, isEN)
    : null;
  const inferidoDesdeCV = hasDoc && (
    (stepLogico === 10 && tieneExtraccion(10, datos!)) ||
    (stepLogico === 11 && tieneExtraccion(11, datos!))
  );

  // Cabecera de progreso
  const progressHeader = step === -1
    ? (isEN ? "PREVIOUS STEP" : "PASO PREVIO")
    : (hasDoc && pendientes
      ? (() => {
          const idx = pendientes.indexOf(stepLogico);
          const totalPend = pendientes.length;
          if (idx >= 0) return isEN ? `FIELD ${idx + 1} OF ${totalPend} TO CONFIRM` : `CAMPO ${idx + 1} DE ${totalPend} POR CONFIRMAR`;
          return isEN ? "FIELD CONFIRMED" : "CAMPO CONFIRMADO";
        })()
      : isEN ? `QUESTION ${step + 1} OF ${TOTAL}` : `PREGUNTA ${step + 1} DE ${TOTAL}`);

  const pct = step === -1
    ? 8
    : (hasDoc && pendientes && pendientes.length > 0
      ? Math.round(((Math.max(pendientes.indexOf(stepLogico), 0) + 1) / pendientes.length) * 50) + 10
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
          <>
            {renderStep(stepLogico, r, setR, modo, isEN, datos, certRawInput, setCertRawInput)}
            {inferidoDesdeCV && (
              <p className="font-body text-sm text-hueso/60 mt-4 leading-relaxed border-l-2 border-hueso/30 pl-4">
                {isEN ? "Double-check this — we inferred it from your CV." : "Verificá este dato — lo inferimos de tu CV."}
              </p>
            )}
          </>
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
    case 1: {
      if (!r.situacion) return false;
      if (modo === "C") return true; // salario opcional en Modo C
      if (r.situacion === "empleado") return !!r.salario && !!r.moneda && !!r.brutoNeto;
      
      if (r.situacion === "contractor") return !!r.contractorHoras && !!r.contractorPago && !!r.salario && !!r.moneda;
      // busqueda
      if (r.trabajaActualmente === "si") return !!r.salario && !!r.moneda;
      if (r.trabajaActualmente === "no") return !!r.salarioAnterior && !!r.monedaAnterior && !!r.tiempoSinTrabajo;
      return false;
    }
    case 2: return !!r.industria && (r.industria !== "Otra" || !!r.industriaOtra?.trim());
    case 3: return !!r.tipoEmpresa;
    case 4: return !!r.nivel && (r.nivel !== "Otro" || !!r.nivelOtro?.trim());
    case 5: return !!r.alcance;
    case 6: return !!r.personasACargo;
    case 7: return ((r.funciones?.length ?? 0) > 0) || !!r.funcionesTexto?.trim();
    case 8: return !!r.interaccion;
    case 9: return !!r.sinIdiomas || ((r.idiomas?.length ?? 0) > 0 && r.idiomas!.every((i) => i.idioma.trim() && i.nivel));
    case 10: return !!r.expTotal;
    case 11: return !!r.expIndustria;
    case 12: return !!r.formacion;
    case 13: return !!r.sinCertificaciones || (r.certificaciones?.length ?? 0) > 0 || !!certRawInput?.trim() || !!r.certificacionesPending?.trim();
    case 14: return !!r.sinIA || ((r.herramientasIA?.length ?? 0) > 0 && !!r.frecuenciaIA && (r.usoIA?.length ?? 0) > 0);
    case 15: return true;
    case 16: return true;
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
  datos: import("@/lib/diagnostico/types").DatosExtraidos | null,
  certRawInput?: string,
  onCertRawChange?: (v: string) => void,
) {
  switch (step) {
    case 0: return <P1Pais r={r} setR={setR} />;
    case 1: return <P15Situacion r={r} setR={setR} modo={modo} datosExtraidos={datos} />;
    case 2: return <P2Industria r={r} setR={setR} />;
    case 3: return <P3TipoEmpresa r={r} setR={setR} />;
    case 4: return <P4Nivel r={r} setR={setR} />;
    case 5: return <SimpleCards title={isEN ? "What is the scope of your role?" : "¿Cuál es el alcance de tu rol?"} options={isEN ? ALCANCES_EN : ALCANCES} value={r.alcance} onChange={(v) => setR({ alcance: v })} />;
    case 6: return <SimpleCards title={isEN ? "Do you have people reporting to you?" : "¿Tenés personas a cargo?"} options={isEN ? PERSONAS_A_CARGO_EN : PERSONAS_A_CARGO} value={r.personasACargo} onChange={(v) => setR({ personasACargo: v })} />;
    case 7: return <P7Funciones r={r} setR={setR} datosExtraidos={datos} />;
    case 8: return <SimpleCards title={isEN ? "How do you interact with senior management?" : "¿Cómo interactuás con la alta dirección?"} options={isEN ? INTERACCIONES_EN : INTERACCIONES} value={r.interaccion} onChange={(v) => setR({ interaccion: v })} />;
    case 9: return <P9Idiomas r={r} setR={setR} />;
    case 10: return <SimpleCards title={isEN ? "How many years of total career experience do you have?" : "¿Cuántos años de experiencia total tenés en tu carrera?"} options={isEN ? EXP_TOTAL_EN : EXP_TOTAL} value={r.expTotal} onChange={(v) => setR({ expTotal: v })} />;
    case 11: return <SimpleCards title={isEN ? "How many years of experience in this industry?" : "¿Cuántos años de experiencia tenés en esta industria?"} options={isEN ? EXP_INDUSTRIA_EN : EXP_INDUSTRIA} value={r.expIndustria} onChange={(v) => setR({ expIndustria: v })} />;
    case 12: return <P12Formacion r={r} setR={setR} />;
    case 13: return <P13Certificaciones r={r} setR={setR} certRawInput={certRawInput ?? ""} onCertRawChange={onCertRawChange ?? (() => {})} />;
    case 14: return <P14HerramientasIA r={r} setR={setR} />;
    case 15: return <P16Beneficios r={r} setR={setR} />;
    case 16: return <P17Motivacion r={r} setR={setR} isEN={isEN} />;
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

function P7Funciones({ r, setR, datosExtraidos }: Props & { datosExtraidos?: import("@/lib/diagnostico/types").DatosExtraidos | null }) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const sel = r.funciones ?? [];
  const funcsDisplay = isEN ? FUNCIONES_EN : FUNCIONES;
  const prefilledRef = React.useRef(false);
  React.useEffect(() => {
    if (prefilledRef.current) return;
    if ((r.funciones?.length ?? 0) > 0) { prefilledRef.current = true; return; }
    const inferred = datosExtraidos?.funciones_inferidas;
    if (!Array.isArray(inferred) || inferred.length === 0) return;
    const matches = FUNCIONES.filter((opt) => {
      const oWords = opt.toLowerCase().replace(/[/&]/g, " ").split(/\s+/).filter((w) => w.length > 3);
      return inferred.some((inf) => {
        if (typeof inf !== "string") return false;
        const i = inf.toLowerCase();
        return oWords.some((w) => i.includes(w));
      });
    });
    if (matches.length > 0) {
      prefilledRef.current = true;
      setR({ funciones: matches });
    }
  }, [datosExtraidos, r.funciones, setR]);
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
            ? "Is there anything you didn't find in the list? You can add it here (optional)."
            : "¿Hay algo que no encontraste en la lista? Podés agregarlo acá (opcional)."}
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
  const options = isEN ? FORMACIONES_EN : FORMACIONES;
  const selected = r.formacion;
  const handleClick = (opt: string) => {
    // Selección estrictamente única (radio): el valor es un string único.
    setR({ formacion: opt });
  };
  return (
    <>
      <QuestionTitle>{isEN ? "What is your educational background?" : "¿Cuál es tu formación?"}</QuestionTitle>
      <QuestionHint>
        {isEN ? "Select your highest level of education attained." : "Seleccioná tu mayor nivel de estudios alcanzado."}
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => (
          <CardOption key={opt} selected={selected === opt} onClick={() => handleClick(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>

    </>
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
  const sinIA = r.sinIA ?? false;
  const toolOptions = isEN ? [...HERRAMIENTAS_IA.slice(0, -1), "Other"] : HERRAMIENTAS_IA;
  const toggleTool = (t: string) => {
    if (tools.includes(t)) setR({ herramientasIA: tools.filter((x) => x !== t), sinIA: false });
    else setR({ herramientasIA: [...tools, t], sinIA: false });
  };
  const toggleUso = (u: string) => {
    if (usos.includes(u)) setR({ usoIA: usos.filter((x) => x !== u) });
    else setR({ usoIA: [...usos, u] });
  };
  const toggleSinIA = () => {
    if (sinIA) {
      setR({ sinIA: false });
    } else {
      setR({ sinIA: true, herramientasIA: [], frecuenciaIA: undefined, usoIA: [], herramientasIAOtra: undefined });
    }
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
        <ChipOption selected={sinIA} onClick={toggleSinIA}>
          {isEN ? "I don't use AI tools" : "NO USO HERRAMIENTAS DE IA"}
        </ChipOption>
      </div>
      {(tools.includes("Otra") || tools.includes("Other")) && !sinIA && (
        <div className="mb-10 animate-in fade-in duration-300">
          <TextInput
            placeholder={isEN ? "Specify here" : "Especificá acá"}
            value={r.herramientasIAOtra ?? ""}
            onChange={(e) => setR({ herramientasIAOtra: e.target.value })}
            autoFocus
          />
        </div>
      )}

      {!sinIA && (
        <>
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
      )}
    </>
  );
}

const SITUACIONES_LABELS_EN: Record<string, string> = {
  empleado: "I am currently employed",
  busqueda: "I am actively job searching",
  
  contractor: "I work as a contractor or under a service contract",
};
const SITUACIONES_DESC_EN: Record<string, string> = {
  contractor: "You have a contract with a company (usually international) with fixed weekly hours, but without formal local employment relationship.",
};

function P15Situacion({ r, setR, modo, datosExtraidos }: Props & { modo?: string; datosExtraidos?: import("@/lib/diagnostico/types").DatosExtraidos | null }) {
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
              onClick={() => {
                const esEmpleado = s.id === "empleado";
                setR({
                  situacion: s.id,
                  salario: esEmpleado ? r.salario : undefined,
                  moneda: esEmpleado ? r.moneda : undefined,
                  brutoNeto: esEmpleado ? r.brutoNeto : undefined,
                  trabajaActualmente: undefined,
                  salarioAnterior: undefined,
                  monedaAnterior: undefined,
                  tiempoSinTrabajo: undefined,
                  contractorHoras: undefined,
                  contractorPago: undefined,
                });
              }}
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
          {datosExtraidos?.recibo_fecha && r.salario && (() => {
            const reciboDate = new Date(datosExtraidos.recibo_fecha + "-01");
            const hoy = new Date();
            const diffDias = Math.floor((hoy.getTime() - reciboDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDias > 60) {
              const mes = reciboDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
              return (
                <div className="border border-hueso/30 bg-hueso/5 p-4 text-sm font-body text-hueso/75 leading-relaxed">
                  Encontramos <strong>${r.salario.toLocaleString("es-AR")}</strong> en tu recibo de {mes}. Si tu salario cambió desde entonces, actualizá el monto abajo.
                </div>
              );
            }
            return null;
          })()}
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

      {(r.situacion === "empleado" || r.situacion === "contractor" || (r.situacion === "busqueda" && r.trabajaActualmente === "si")) && (
        <div className="border-t border-hueso/10 pt-8 space-y-6">
          <div>
            <p className="font-body text-base text-hueso mb-3">
              {isEN ? "Did you receive any salary increase in the last 12 months?" : "¿Recibiste algún incremento salarial en los últimos 12 meses?"}
            </p>
            <div className="flex gap-2">
              <ChipOption
                selected={r.incrementoUltimoAnio === "si"}
                onClick={() => setR({ incrementoUltimoAnio: "si" })}
              >
                {isEN ? "Yes" : "Sí"}
              </ChipOption>
              <ChipOption
                selected={r.incrementoUltimoAnio === "no"}
                onClick={() => setR({ incrementoUltimoAnio: "no", incrementoUltimoAnioPct: undefined, incrementoUltimoAnioMonto: undefined })}
              >
                No
              </ChipOption>
            </div>
          </div>
          {r.incrementoUltimoAnio === "si" && (
            <div className="animate-in fade-in duration-300">
              <p className="font-body text-base text-hueso mb-3">
                {isEN ? "What percentage increase did you receive?" : "¿Qué porcentaje de incremento recibiste?"}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 max-w-[200px]">
                  <TextInput
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={r.incrementoUltimoAnioPct != null ? String(r.incrementoUltimoAnioPct) : ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const pct = digits ? Number(digits) : undefined;
                      const monto = pct != null && typeof r.salario === "number" && r.salario > 0
                        ? Math.round((r.salario * pct) / 100)
                        : undefined;
                      setR({ incrementoUltimoAnioPct: pct, incrementoUltimoAnioMonto: monto });
                    }}
                  />
                  <span className="font-body text-lg text-hueso">%</span>
                </div>
                <div className="flex items-center gap-2 max-w-[260px]">
                  <TextInput
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={r.incrementoUltimoAnioMonto != null ? String(r.incrementoUltimoAnioMonto) : ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const monto = digits ? Number(digits) : undefined;
                      const pct = monto != null && typeof r.salario === "number" && r.salario > 0
                        ? Math.round((monto / r.salario) * 100)
                        : undefined;
                      setR({ incrementoUltimoAnioMonto: monto, incrementoUltimoAnioPct: pct });
                    }}
                  />
                  <span className="font-body text-lg text-hueso">{r.moneda || paisToMoneda(r.pais, r.paisOtro)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(r.situacion === "empleado" || (r.situacion === "busqueda" && r.trabajaActualmente === "si")) && (() => {
        const tieneBono = r.bono_target_sueldos && r.bono_target_sueldos !== "no_tengo";
        const fmt = (n: number) => n.toLocaleString(isEN ? "en-US" : "es-AR");
        const monedaPaisBono = paisToMoneda(r.pais, r.paisOtro);
        const monedaBono = r.bono_moneda ?? monedaPaisBono;
        const realOpts: Array<[string, string]> = isEN
          ? [
              ["completo", "Yes, in full"],
              ["parcial", "Partially"],
              ["no_recibi", "No, I didn't receive it"],
            ]
          : [
              ["completo", "Sí, completo"],
              ["parcial", "Parcialmente"],
              ["no_recibi", "No lo cobré"],
            ];
        return (
          <div className="border-t border-hueso/10 pt-8 flex flex-col gap-5">
            {/* Q1 — ¿Tenés bono variable? */}
            <div className="flex flex-col gap-2">
              <p className="font-body text-base text-hueso">
                {isEN ? "Do you have a variable bonus?" : "¿Tenés bono variable?"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <CardOption
                  selected={r.bono_target_sueldos === "no_tengo"}
                  onClick={() => setR({
                    bono_target_sueldos: "no_tengo",
                    bono_monto: undefined,
                    bono_moneda: undefined,
                    bono_realizacion: undefined,
                  })}
                >
                  {isEN ? "No bonus" : "No tengo bono"}
                </CardOption>
                <CardOption
                  selected={!!tieneBono}
                  onClick={() => setR({
                    bono_target_sueldos: tieneBono ? undefined : "si_tengo",
                    ...(tieneBono ? { bono_monto: undefined, bono_moneda: undefined, bono_realizacion: undefined } : {}),
                  })}
                >
                  {isEN ? "Yes, I have a bonus" : "Sí tengo bono"}
                </CardOption>
              </div>
            </div>

            {/* Q2 — Monto anual del bono */}
            {tieneBono && (
              <div className="flex flex-col gap-2">
                <p className="font-body text-sm text-hueso/70">
                  {isEN
                    ? "How much do you earn in bonuses in a typical year?"
                    : "¿Cuánto cobrás de bono en un año típico?"}
                </p>
                <p className="font-body text-xs text-hueso/50">
                  {isEN
                    ? "Add up all payments throughout the year — whether annual, semi-annual, or quarterly."
                    : "Sumá todos los pagos del año — sea anual, semestral o trimestral."}
                </p>
                <MontoInput
                  placeholder="0"
                  valor={r.bono_monto}
                  onValor={(v) => setR({ bono_monto: v, bono_moneda: r.bono_moneda ?? monedaPaisBono })}
                  moneda={monedaBono}
                  onMoneda={(m) => setR({ bono_moneda: m })}
                  monedaOpciones={Array.from(new Set([monedaPaisBono, "USD", "EUR"]))}
                />
                {r.bono_monto != null && r.bono_monto > 0 && (
                  <p className="font-body text-sm text-hueso/60">
                    {isEN
                      ? `Annual bonus: $${fmt(r.bono_monto)} ${monedaBono}`
                      : `Bono anual: $${fmt(r.bono_monto)} ${monedaBono}`}
                  </p>
                )}
              </div>
            )}

            {/* Q3 — ¿Lo cobraste completo el año pasado? */}
            {tieneBono && (
              <div className="flex flex-col gap-2">
                <p className="font-body text-sm text-hueso/70">
                  {isEN
                    ? "Did you receive your full bonus last year?"
                    : "¿El año pasado lo cobraste completo?"}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {realOpts.map(([val, label]) => (
                    <CardOption
                      key={val}
                      selected={r.bono_realizacion === val}
                      onClick={() => setR({
                        bono_realizacion: r.bono_realizacion === val ? undefined : val,
                      })}
                    >
                      {label}
                    </CardOption>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
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

function MontoInput({
  placeholder, valor, onValor, moneda, onMoneda, monedaOpciones, etiquetaMoneda,
}: {
  placeholder: string;
  valor?: number;
  onValor: (v: number | undefined) => void;
  moneda?: string;
  onMoneda?: (m: string) => void;
  monedaOpciones?: string[];
  etiquetaMoneda?: string;
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
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <TextInput
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={formatted}
          onChange={(e) => handleChange(e.target.value)}
        />
        <p className="font-body text-[11px] text-hueso/40 mt-1">
          {isEN
            ? "Enter a whole number, no decimals. Periods are added automatically."
            : "Ingresá un número entero, sin decimales. Los puntos los agregamos automáticamente."}
        </p>
      </div>
      {etiquetaMoneda && (
        <div className="font-body text-lg text-hueso/70 py-3">{etiquetaMoneda}</div>
      )}
      {onMoneda && monedaOpciones && (
        <div>
          <select
            value={moneda ?? ""}
            onChange={(e) => onMoneda(e.target.value)}
            className="bg-tinta border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso py-3 pr-2"
          >
            {monedaOpciones.map((m) => (
              <option key={m} value={m} className="bg-tinta">{m}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}


function P16Beneficios({ r, setR }: Props) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const pais = (r.pais === "Otro" ? r.paisOtro : r.pais) ?? "";
  const isUSA = pais === "Estados Unidos";
  const esIndep = r.situacion === "contractor";

  // Si el usuario es freelance/contractor, limpiamos campos que no aplican
  // para evitar que queden valores antiguos en el estado.
  React.useEffect(() => {
    if (!esIndep) return;
    const clear: Partial<typeof r> = {};
    if (r.equity !== undefined) clear.equity = undefined;
    if (r.beneficio_seguro_vida !== undefined) clear.beneficio_seguro_vida = undefined;
    if (r.beneficio_retiro !== undefined) clear.beneficio_retiro = undefined;
    if (r.beneficio_401k_match !== undefined) clear.beneficio_401k_match = undefined;
    if (r.beneficio_401k_porcentaje !== undefined) clear.beneficio_401k_porcentaje = undefined;
    if (r.auto_corporativo !== undefined) clear.auto_corporativo = undefined;
    if (r.beneficio_movilidad_tipo !== undefined) clear.beneficio_movilidad_tipo = undefined;
    if (r.beneficio_movilidad_monto !== undefined) clear.beneficio_movilidad_monto = undefined;
    if (r.beneficio_alimentacion_tipo !== undefined) clear.beneficio_alimentacion_tipo = undefined;
    if (r.beneficio_alimentacion_monto !== undefined) clear.beneficio_alimentacion_monto = undefined;
    if (r.bono_target_sueldos !== undefined) clear.bono_target_sueldos = undefined;
    if (r.bono_monto !== undefined) clear.bono_monto = undefined;
    if (r.bono_moneda !== undefined) clear.bono_moneda = undefined;
    if (r.bono_realizacion !== undefined) clear.bono_realizacion = undefined;
    if (r.beneficio_capacitacion !== undefined) clear.beneficio_capacitacion = undefined;
    // Cobertura médica: si el valor pertenece al esquema empleado, reseteamos
    if (r.beneficio_salud_tipo && !["empresa_paga","yo_pago","no_tengo","no_se"].includes(r.beneficio_salud_tipo)) {
      clear.beneficio_salud_tipo = undefined;
      clear.beneficio_salud_prestadora = undefined;
    }
    if (Object.keys(clear).length > 0) setR(clear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esIndep]);

  const ticketLabel = isEN
    ? "Meal allowance / food benefit"
    : pais === "México" ? "Vales de despensa"
    : pais === "Argentina" ? "Ticket alimentario"
    : "Beneficio alimentación";

  const toNum = (s: string): number | undefined => {
    const n = parseFloat(s);
    return isNaN(n) ? undefined : n;
  };

  const pick = <K extends keyof typeof r>(field: K, val: string, clear?: Partial<typeof r>) => ({
    selected: r[field] === val,
    onClick: () => setR({ [field]: r[field] === val ? undefined : val, ...clear } as Partial<typeof r>),
  });

  const vacHasInput = r.beneficio_vacaciones_adicionales !== undefined && r.beneficio_vacaciones_adicionales !== "no";

  return (
    <>
      <QuestionTitle>{isEN ? "Benefits" : "Beneficios"}</QuestionTitle>
      <QuestionHint>
        {isEN
          ? "All fields are optional — skip anything you don't know."
          : "Todos los campos son opcionales — saltá lo que no sabés."}
      </QuestionHint>

      <div className="flex flex-col gap-8 mt-2">

        {/* GRUPO A — Cobertura médica */}
        <div className="flex flex-col gap-3">
          <p className="font-body text-sm uppercase tracking-widest text-hueso/50">
            {isEN ? "A — Health coverage" : "A — Cobertura médica"}
          </p>
          {esIndep && (
            <p className="font-body text-sm text-hueso/70">
              {isEN ? "Do you have health coverage? Who pays for it?" : "¿Tenés cobertura médica? ¿Quién la paga?"}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2">
          {(esIndep
            ? (isEN
              ? [["empresa_paga","The company/client pays for it"],["yo_pago","I pay for it"],["no_tengo","I don't have it"],["no_se","Don't know"]]
              : [["empresa_paga","La paga la empresa/cliente"],["yo_pago","La pago yo"],["no_tengo","No tengo"],["no_se","No sé"]])
            : (isEN
              ? [["individual","Individual only"],["familiar","Me + family group"],["publica","Public coverage only (by law)"],["no_tengo","I don't have it"],["no_se","Don't know"]]
              : [["individual","Solo para mí"],["familiar","Para mí y grupo familiar"],["publica","Solo cobertura pública de ley"],["no_tengo","No tengo"],["no_se","No sé"]])
          ).map(([val, label]) => (
            <CardOption
              key={val}
              selected={r.beneficio_salud_tipo === val}
              onClick={() => setR({
                beneficio_salud_tipo: r.beneficio_salud_tipo === val ? undefined : val,
                ...(val !== "individual" && val !== "familiar" ? { beneficio_salud_prestadora: undefined } : {}),
              })}
            >
              {label}
            </CardOption>
          ))}
        </div>
        {(r.beneficio_salud_tipo === "individual" || r.beneficio_salud_tipo === "familiar") && (
          <TextInput
            placeholder={placeholderPrestadora(r.pais, r.paisOtro, isEN)}
            value={r.beneficio_salud_prestadora ?? ""}
            onChange={(e) => setR({ beneficio_salud_prestadora: e.target.value || undefined })}
          />
        )}
        </div>

        {/* GRUPO B — Compensación variable */}
        <div className="flex flex-col gap-5">
          <p className="font-body text-sm uppercase tracking-widest text-hueso/50">
            {isEN ? "B — Variable compensation" : "B — Compensación variable"}
          </p>

          {/* Bono variable: movido al paso de Situación, después del incremento salarial */}


          {/* Equity */}
          {!esIndep && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">Equity / RSUs / Stock options</p>
              <div className="grid grid-cols-2 gap-2">
                {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"]].map(([val, label]) => (
                  <CardOption key={val} {...pick("equity", val)}>{label}</CardOption>
                ))}
              </div>
            </div>
          )}

          {/* Comisiones */}
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm text-hueso/70">{isEN ? "Commissions" : "Comisiones"}</p>
            <div className="grid grid-cols-1 gap-2">
              {(isEN
                ? [["con_monto","Yes, I know the monthly average"],["no","No"]]
                : [["con_monto","Sí, sé el promedio mensual"],["no","No"]]
              ).map(([val, label]) => (
                <CardOption
                  key={val}
                  selected={r.comisiones_tipo === val}
                  onClick={() => setR({
                    comisiones_tipo: r.comisiones_tipo === val ? undefined : val,
                    ...(val !== "con_monto" ? { comisiones_monto: undefined } : {}),
                  })}
                >
                  {label}
                </CardOption>
              ))}
            </div>
            {r.comisiones_tipo === "con_monto" && (
              <MontoInput
                placeholder={isEN ? "Average monthly commissions (optional)" : "Promedio mensual de comisiones (opcional)"}
                valor={r.comisiones_monto}
                onValor={(v) => setR({ comisiones_monto: v })}
              />
            )}
          </div>
        </div>

        {/* GRUPO C — Alimentación y movilidad */}
        <div className="flex flex-col gap-5">
          <p className="font-body text-sm uppercase tracking-widest text-hueso/50">
            {esIndep
              ? (isEN ? "C — Equipment & phone" : "C — Equipamiento y celular")
              : (isEN ? "C — Food & mobility" : "C — Alimentación y movilidad")}
          </p>

          {/* Ticket / alimentación */}
          {!esIndep && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">{ticketLabel}</p>
              <div className="grid grid-cols-1 gap-2">
                {(isEN
                  ? [["con_monto","Yes, I know the amount"],["no","No"]]
                  : [["con_monto","Sí, sé el monto"],["no","No"]]
                ).map(([val, label]) => (
                  <CardOption
                    key={val}
                    selected={r.beneficio_alimentacion_tipo === val}
                    onClick={() => setR({
                      beneficio_alimentacion_tipo: r.beneficio_alimentacion_tipo === val ? undefined : val,
                      ...(val !== "con_monto" ? { beneficio_alimentacion_monto: undefined } : {}),
                    })}
                  >
                    {label}
                  </CardOption>
                ))}
              </div>
              {r.beneficio_alimentacion_tipo === "con_monto" && (
                <MontoInput
                  placeholder={isEN ? "Monthly amount (optional)" : "Monto mensual (opcional)"}
                  valor={r.beneficio_alimentacion_monto}
                  onValor={(v) => setR({ beneficio_alimentacion_monto: v })}
                  etiquetaMoneda={paisToMoneda(r.pais, r.paisOtro)}
                />
              )}
            </div>
          )}

          {/* Auto corporativo */}
          {!esIndep && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">{isEN ? "Company car" : "Auto corporativo"}</p>
              <div className="grid grid-cols-2 gap-2">
                {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"]].map(([val, label]) => (
                  <CardOption key={val} {...pick("auto_corporativo", val)}>{label}</CardOption>
                ))}
              </div>
            </div>
          )}

          {/* Celular corporativo */}
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm text-hueso/70">{isEN ? "Company phone" : "Celular corporativo"}</p>
            <div className="grid grid-cols-2 gap-2">
              {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"]].map(([val, label]) => (
                <CardOption key={val} {...pick("beneficio_celular", val)}>{label}</CardOption>
              ))}
            </div>
          </div>

          {/* Computadora / equipamiento — solo independientes */}
          {esIndep && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">
                {isEN ? "Computer / equipment provided by the company" : "Computadora / equipamiento provisto por la empresa"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"]].map(([val, label]) => (
                  <CardOption key={val} {...pick("beneficio_equipamiento", val)}>{label}</CardOption>
                ))}
              </div>
            </div>
          )}

          {/* Allowance de movilidad */}
          {!esIndep && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">{isEN ? "Mobility allowance" : "Allowance de movilidad"}</p>
              <div className="grid grid-cols-1 gap-2">
                {(isEN
                  ? [["con_monto","Yes, I know the amount"],["no","No"]]
                  : [["con_monto","Sí, sé el monto"],["no","No"]]
                ).map(([val, label]) => (
                  <CardOption
                    key={val}
                    selected={r.beneficio_movilidad_tipo === val}
                    onClick={() => setR({
                      beneficio_movilidad_tipo: r.beneficio_movilidad_tipo === val ? undefined : val,
                      ...(val !== "con_monto" ? { beneficio_movilidad_monto: undefined } : {}),
                    })}
                  >
                    {label}
                  </CardOption>
                ))}
              </div>
              {r.beneficio_movilidad_tipo === "con_monto" && (
                <MontoInput
                  placeholder={isEN ? "Monthly amount (optional)" : "Monto mensual (opcional)"}
                  valor={r.beneficio_movilidad_monto}
                  onValor={(v) => setR({ beneficio_movilidad_monto: v })}
                  etiquetaMoneda={paisToMoneda(r.pais, r.paisOtro)}
                />
              )}
            </div>
          )}
        </div>

        {/* GRUPO D — Retiro y financieros (oculto para freelance/contractor) */}
        {!esIndep && (
        <div className="flex flex-col gap-5">
          <p className="font-body text-sm uppercase tracking-widest text-hueso/50">
            {isEN ? "D — Retirement & insurance" : "D — Retiro y financieros"}
          </p>

          {/* Seguro de vida */}
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm text-hueso/70">{isEN ? "Life insurance" : "Seguro de vida"}</p>
            <div className="grid grid-cols-3 gap-2">
              {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"], ["no_se", isEN ? "Don't know" : "No sé"]].map(([val, label]) => (
                <CardOption key={val} {...pick("beneficio_seguro_vida", val)}>{label}</CardOption>
              ))}
            </div>
          </div>

          {/* Plan de retiro */}
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm text-hueso/70">{isEN ? "Supplemental retirement plan" : "Plan de retiro complementario"}</p>
            <div className="grid grid-cols-3 gap-2">
              {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"], ["no_se", isEN ? "Don't know" : "No sé"]].map(([val, label]) => (
                <CardOption key={val} {...pick("beneficio_retiro", val)}>{label}</CardOption>
              ))}
            </div>
          </div>

          {/* Employer match 401k — solo Estados Unidos */}
          {isUSA && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">{isEN ? "Employer 401(k) match" : "Employer match 401k"}</p>
              <div className="grid grid-cols-1 gap-2">
                {(isEN
                  ? [["con_porcentaje","Yes, I know the %"],["no","No"],["no_se","Don't know"]]
                  : [["con_porcentaje","Sí, sé el %"],["no","No"],["no_se","No sé"]]
                ).map(([val, label]) => (
                  <CardOption
                    key={val}
                    selected={r.beneficio_401k_match === val}
                    onClick={() => setR({
                      beneficio_401k_match: r.beneficio_401k_match === val ? undefined : val,
                      ...(val !== "con_porcentaje" ? { beneficio_401k_porcentaje: undefined } : {}),
                    })}
                  >
                    {label}
                  </CardOption>
                ))}
              </div>
              {r.beneficio_401k_match === "con_porcentaje" && (
                <TextInput
                  type="number"
                  placeholder={isEN ? "Match % (e.g. 4)" : "% de match (ej: 4)"}
                  value={r.beneficio_401k_porcentaje ?? ""}
                  onChange={(e) => setR({ beneficio_401k_porcentaje: e.target.value })}
                />
              )}
            </div>
          )}
        </div>
        )}

        {/* GRUPO E — Flexibilidad */}
        <div className="flex flex-col gap-5">
          <p className="font-body text-sm uppercase tracking-widest text-hueso/50">
            {isEN ? "E — Flexibility" : "E — Flexibilidad"}
          </p>

          {/* Modalidad */}
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm text-hueso/70">{isEN ? "Work arrangement" : "Modalidad de trabajo"}</p>
            <div className="grid grid-cols-1 gap-2">
              {(isEN
                ? [["remoto","100% remote"],["hibrido","Hybrid"],["presencial","100% in-office"]]
                : [["remoto","100% remoto"],["hibrido","Híbrido"],["presencial","100% presencial"]]
              ).map(([val, label]) => (
                <CardOption
                  key={val}
                  selected={r.modalidad_trabajo === val}
                  onClick={() => setR({
                    modalidad_trabajo: r.modalidad_trabajo === val ? undefined : val,
                    ...(val !== "hibrido" ? { modalidad_dias_presenciales: undefined } : {}),
                  })}
                >
                  {label}
                </CardOption>
              ))}
            </div>
            {r.modalidad_trabajo === "hibrido" && (
              <div className="flex flex-col gap-2 mt-1">
                <p className="font-body text-sm text-hueso/70">{isEN ? "Days in office per week" : "Días presenciales por semana"}</p>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4"].map((d) => (
                    <CardOption
                      key={d}
                      selected={r.modalidad_dias_presenciales === d}
                      onClick={() => setR({ modalidad_dias_presenciales: r.modalidad_dias_presenciales === d ? undefined : d })}
                    >
                      {d}
                    </CardOption>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Días adicionales de vacaciones */}
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm text-hueso/70">
              {isEN ? "Additional vacation days (beyond legal minimum)" : "Días adicionales de vacaciones (más allá del mínimo legal)"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CardOption
                selected={r.beneficio_vacaciones_adicionales === "no"}
                onClick={() => setR({ beneficio_vacaciones_adicionales: r.beneficio_vacaciones_adicionales === "no" ? undefined : "no" })}
              >
                {isEN ? "None" : "Ninguno"}
              </CardOption>
              <CardOption
                selected={vacHasInput}
                onClick={() => setR({ beneficio_vacaciones_adicionales: vacHasInput ? undefined : "" })}
              >
                {isEN ? "Yes" : "Sí"}
              </CardOption>
            </div>
            {vacHasInput && (
              <TextInput
                type="number"
                placeholder={isEN ? "How many additional days? (optional)" : "¿Cuántos días adicionales? (opcional)"}
                value={r.beneficio_vacaciones_adicionales ?? ""}
                onChange={(e) => setR({ beneficio_vacaciones_adicionales: e.target.value })}
                autoFocus
              />
            )}
          </div>

          {/* Capacitación */}
          {!esIndep && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-sm text-hueso/70">{isEN ? "Company-paid training / learning budget" : "Capacitación paga por la empresa"}</p>
              <div className="grid grid-cols-2 gap-2">
                {[[`si`, isEN ? "Yes" : "Sí"], ["no", "No"]].map(([val, label]) => (
                  <CardOption key={val} {...pick("beneficio_capacitacion", val)}>{label}</CardOption>
                ))}
              </div>
            </div>
          )}

          {/* Beneficios adicionales — texto libre */}
          <div className="flex flex-col gap-3 pt-4 border-t border-hueso/10">
            <p className="font-body text-sm text-hueso/70">
              {isEN ? "Any additional benefit not listed above?" : "¿Tenés algún beneficio adicional que no apareció en la lista?"}
            </p>
            <TextInput
              placeholder={isEN ? "E.g.: gas, daycare, car, parking, gym membership..." : "Ej: gas, guardería, auto, estacionamiento, membresía gimnasio..."}
              value={r.beneficiosAdicionalesTexto ?? ""}
              onChange={(e) => setR({ beneficiosAdicionalesTexto: e.target.value })}
            />
          </div>

        </div>
      </div>
    </>
  );
}

function P17Motivacion({ r, setR, isEN }: Props & { isEN: boolean }) {
  const options = isEN ? MOTIVACIONES_EN : MOTIVACIONES;
  return (
    <SimpleCards
      title={isEN ? "What brought you to check if you're being paid competitively?" : "¿Qué te llevó a querer saber si te pagan competitivamente?"}
      options={options}
      value={r.motivacion}
      onChange={(v) => setR({ motivacion: v })}
    />
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
