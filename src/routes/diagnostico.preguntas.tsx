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
import {
  ALCANCES, BENEFICIOS, EXP_INDUSTRIA, EXP_TOTAL, FORMACIONES, FRECUENCIAS_IA,
  FUNCIONES, GENEROS, HERRAMIENTAS_IA, INDUSTRIAS, INTERACCIONES,
  MONEDAS, NIVELES, NIVELES_IDIOMA, PAISES, PERSONAS_A_CARGO, SITUACIONES,
  TIEMPOS_SIN_TRABAJO, TIPOS_EMPRESA, USOS_IA,
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

/** Mapea el JSON extraído por la IA a parciales de Respuestas */
function mapExtraccionAResp(d: DatosExtraidos): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const industria = findOption(INDUSTRIAS, asString(d.industria_inferida));
  if (industria) out.industria = industria;
  const tipoEmp = findOption(TIPOS_EMPRESA, asString(d.tipo_empresa_inferida));
  if (tipoEmp) out.tipoEmpresa = tipoEmp;
  const nivel = findOption(NIVELES, asString(d.nivel_jerarquico_inferido));
  if (nivel) out.nivel = nivel;
  const alcance = findOption(ALCANCES, asString(d.alcance_inferido));
  if (alcance) out.alcance = alcance;
  const equipo = findOption(PERSONAS_A_CARGO, asString(d.equipo_inferido));
  if (equipo) out.personasACargo = equipo;
  const expTot = findOption(EXP_TOTAL, asString(d.anos_experiencia_total_inferidos));
  if (expTot) out.expTotal = expTot;
  const expInd = findOption(EXP_INDUSTRIA, asString(d.anos_experiencia_industria_inferidos));
  if (expInd) out.expIndustria = expInd;

  const funcs = asArrayStr(d.funciones_inferidas);
  if (funcs) {
    const matched = funcs.map((f) => findOption(FUNCIONES, f) ?? null).filter(Boolean) as string[];
    if (matched.length) out.funciones = Array.from(new Set(matched));
    else out.funcionesTexto = funcs.join(", ");
  }

  const form = asArrayStr(d.formacion);
  if (form) {
    const matched = form.map((f) => findOption(FORMACIONES, f) ?? null).filter(Boolean) as string[];
    if (matched.length) out.formacion = Array.from(new Set(matched));
  }

  const certs = asArrayStr(d.certificaciones);
  if (certs) out.certificaciones = certs;

  const idiomas = Array.isArray(d.idiomas) ? d.idiomas : null;
  if (idiomas && idiomas.length) {
    const list: Idioma[] = idiomas.map((i) => {
      if (typeof i === "string") return { idioma: i, nivel: "" };
      return {
        idioma: typeof i.idioma === "string" ? i.idioma : "",
        nivel: (NIVELES_IDIOMA.find((n) => n.toLowerCase() === (i.nivel ?? "").toLowerCase()) ?? "") as Idioma["nivel"],
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

  const salario = typeof d.salario_actual_inferido === "number"
    ? d.salario_actual_inferido
    : (typeof d.salario_actual_inferido === "string" ? Number(d.salario_actual_inferido.replace(/\D/g, "")) : null);
  if (salario && Number.isFinite(salario) && salario > 0) out.salario = salario;
  const moneda = findOption(MONEDAS, asString(d.moneda_inferida));
  if (moneda) out.moneda = moneda;
  const tipoSal = asString(d.tipo_salario_inferido);
  if (tipoSal) {
    const lower = tipoSal.toLowerCase();
    if (lower.includes("bruto")) out.brutoNeto = "bruto";
    else if (lower.includes("neto")) out.brutoNeto = "neto";
  }

  const beneficios = asArrayStr(d.beneficios_inferidos);
  if (beneficios) {
    const matched = beneficios.map((b) => findOption(BENEFICIOS, b) ?? null).filter(Boolean) as string[];
    if (matched.length) out.beneficios = Array.from(new Set(matched));
  }

  const titulo = asString(d.titulo_puesto);
  if (titulo) out.descripcionPuesto = titulo;

  return out;
}

const STEP_TITULO: Record<number, string> = {
  1: "¿En qué industria trabajás?",
  2: "¿En qué tipo de empresa trabajás?",
  3: "¿Cuál es tu nivel jerárquico?",
  4: "¿Cuál es el alcance de tu rol?",
  5: "¿Tenés personas a cargo?",
  6: "¿Qué funciones forman parte de tu trabajo?",
  8: "¿Qué idiomas usás en tu trabajo?",
  9: "¿Cuántos años de experiencia total tenés?",
  10: "¿Cuántos años de experiencia tenés en esta industria?",
  11: "¿Cuál es tu formación?",
  12: "¿Tenés certificaciones profesionales?",
  13: "¿Qué herramientas de IA usás?",
  14: "¿Cuál es tu compensación actual?",
  15: "¿Qué beneficios recibís?",
  16: "Tu puesto",
};

function tieneExtraccion(step: number, d: DatosExtraidos): boolean {
  return !!resumenExtraccion(step, d);
}

function resumenExtraccion(step: number, d: DatosExtraidos): { titulo: string; valor: string } | null {
  const titulo = STEP_TITULO[step] ?? "";
  const v = (() => {
    switch (step) {
      case 1: return findOption(INDUSTRIAS, asString(d.industria_inferida));
      case 2: return findOption(TIPOS_EMPRESA, asString(d.tipo_empresa_inferida));
      case 3: return findOption(NIVELES, asString(d.nivel_jerarquico_inferido));
      case 4: return findOption(ALCANCES, asString(d.alcance_inferido));
      case 5: return findOption(PERSONAS_A_CARGO, asString(d.equipo_inferido));
      case 6: {
        const arr = asArrayStr(d.funciones_inferidas);
        return arr ? arr.slice(0, 6).join(" · ") : null;
      }
      case 8: {
        const arr = Array.isArray(d.idiomas) ? d.idiomas : null;
        if (!arr || !arr.length) return null;
        return arr.map((i) => typeof i === "string" ? i : `${i.idioma ?? ""}${i.nivel ? ` (${i.nivel})` : ""}`).filter(Boolean).join(" · ");
      }
      case 9: return asString(d.anos_experiencia_total_inferidos);
      case 10: return asString(d.anos_experiencia_industria_inferidos);
      case 11: { const a = asArrayStr(d.formacion); return a ? a.join(" · ") : null; }
      case 12: { const a = asArrayStr(d.certificaciones); return a ? a.join(" · ") : null; }
      case 13: { const a = asArrayStr(d.herramientas_ia_inferidas); return a ? a.join(" · ") : null; }
      case 14: {
        const sal = d.salario_actual_inferido;
        const mon = asString(d.moneda_inferida);
        const tipo = asString(d.tipo_salario_inferido);
        if (!sal || !mon) return null;
        return `${mon} ${typeof sal === "number" ? sal.toLocaleString("es-AR") : sal}${tipo ? ` (${tipo})` : ""}`;
      }
      case 15: { const a = asArrayStr(d.beneficios_inferidos); return a ? a.join(" · ") : null; }
      case 16: return asString(d.titulo_puesto);
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

// Mapa de pasos que pueden pre-completarse desde el documento
const EXTRACTABLE_STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

function PreguntasPage() {
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const [step, setStep] = React.useState(0); // 0..18
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
    if (step < TOTAL - 1) setStep(step + 1);
    else navigate({ to: "/diagnostico/inferencia" });
  };
  const back = () => {
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

  const valid = isValid(step, r);
  const extraccionTexto = hasDoc && EXTRACTABLE_STEPS.has(step) && !overrides.has(step)
    ? resumenExtraccion(step, datos!)
    : null;

  // Cabecera de progreso
  const progressHeader = hasDoc && pendientes
    ? (() => {
        const idx = pendientes.indexOf(step);
        const totalPend = pendientes.length;
        if (idx >= 0) return `CAMPO ${idx + 1} DE ${totalPend} POR CONFIRMAR`;
        return `CAMPO CONFIRMADO`;
      })()
    : `PREGUNTA ${step + 1} DE ${TOTAL}`;

  const pct = hasDoc && pendientes && pendientes.length > 0
    ? Math.round(((Math.max(pendientes.indexOf(step), 0) + 1) / pendientes.length) * 50) + 10
    : Math.round(((step + 1) / TOTAL) * 50) + 10;

  return (
    <DiagnosticoShell step={2} progress={pct}>
      <p className="font-ui text-[10px] text-hueso/45 mb-3">{progressHeader}</p>
      <StepFade k={step}>
        {extraccionTexto ? (
          <ConfirmCard texto={extraccionTexto} onCorrecto={onCorrecto} onCambiar={onCambiar} />
        ) : (
          renderStep(step, r, setR)
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
            ← Volver
          </button>
        </div>
      )}
    </DiagnosticoShell>
  );
}

function ConfirmCard({ texto, onCorrecto, onCambiar }: {
  texto: { titulo: string; valor: string };
  onCorrecto: () => void;
  onCambiar: () => void;
}) {
  return (
    <div>
      <p className="font-body text-base text-hueso/60 mb-3">{texto.titulo}</p>
      <p className="font-ui text-[10px] text-hueso/45 mb-3">ENCONTRÉ EN TU DOCUMENTO</p>
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
          ✓ Correcto · continuá <span aria-hidden>→</span>
        </button>
        <button
          type="button"
          onClick={onCambiar}
          className="inline-flex items-center justify-center font-ui text-[11px] text-hueso/70 px-6 py-3 border border-hueso/30 hover:border-hueso transition-colors"
        >
          Cambiar
        </button>
      </div>
    </div>
  );
}

function isValid(step: number, r: ReturnType<typeof useDiagnostico>["state"]["respuestas"]): boolean {
  switch (step) {
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
    case 12: return !!r.sinCertificaciones || (r.certificaciones?.length ?? 0) > 0;
    case 13: return (r.herramientasIA?.length ?? 0) > 0 && !!r.frecuenciaIA && (r.usoIA?.length ?? 0) > 0;
    case 14: {
      if (!r.situacion) return false;
      if (r.situacion === "empleado") return !!r.salario && !!r.moneda && !!r.brutoNeto;
      if (r.situacion === "freelance") return !!r.salario && !!r.moneda;
      // busqueda
      if (r.trabajaActualmente === "si") return !!r.salario && !!r.moneda;
      if (r.trabajaActualmente === "no") return !!r.salarioAnterior && !!r.monedaAnterior && !!r.tiempoSinTrabajo;
      return false;
    }
    case 15: return (r.beneficios?.length ?? 0) > 0;
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
) {
  switch (step) {
    case 0: return <P1Pais r={r} setR={setR} />;
    case 1: return <P2Industria r={r} setR={setR} />;
    case 2: return <P3TipoEmpresa r={r} setR={setR} />;
    case 3: return <P4Nivel r={r} setR={setR} />;
    case 4: return <SimpleCards title="¿Cuál es el alcance de tu rol?" options={ALCANCES} value={r.alcance} onChange={(v) => setR({ alcance: v })} />;
    case 5: return <SimpleCards title="¿Tenés personas a cargo?" options={PERSONAS_A_CARGO} value={r.personasACargo} onChange={(v) => setR({ personasACargo: v })} />;
    case 6: return <P7Funciones r={r} setR={setR} />;
    case 7: return <SimpleCards title="¿Cómo interactuás con la alta dirección?" options={INTERACCIONES} value={r.interaccion} onChange={(v) => setR({ interaccion: v })} />;
    case 8: return <P9Idiomas r={r} setR={setR} />;
    case 9: return <SimpleCards title="¿Cuántos años de experiencia total tenés en tu carrera?" options={EXP_TOTAL} value={r.expTotal} onChange={(v) => setR({ expTotal: v })} />;
    case 10: return <SimpleCards title="¿Cuántos años de experiencia tenés en esta industria?" options={EXP_INDUSTRIA} value={r.expIndustria} onChange={(v) => setR({ expIndustria: v })} />;
    case 11: return <P12Formacion r={r} setR={setR} />;
    case 12: return <P13Certificaciones r={r} setR={setR} />;
    case 13: return <P14HerramientasIA r={r} setR={setR} />;
    case 14: return <P15Situacion r={r} setR={setR} />;
    case 15: return <P16Beneficios r={r} setR={setR} />;
    case 16: return <P17Descripcion r={r} setR={setR} />;
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
  const [query, setQuery] = React.useState("");
  const filtered = PAISES.filter((p) => p.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <QuestionTitle>¿En qué país operás en tu rol?</QuestionTitle>
      <QuestionHint>Si trabajás para varios países, elegí donde estás vos.</QuestionHint>
      <TextInput
        placeholder="Buscar país..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
        {filtered.map((p) => (
          <ChipOption key={p} selected={r.pais === p} onClick={() => setR({ pais: p })}>
            {p}
          </ChipOption>
        ))}
      </div>
      {r.pais === "Otro" && (
        <div className="mt-6">
          <TextInput
            placeholder="Especificá tu país"
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
  return (
    <>
      <QuestionTitle>¿En qué industria trabajás?</QuestionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INDUSTRIAS.map((opt) => (
          <CardOption key={opt} selected={r.industria === opt} onClick={() => setR({ industria: opt })}>
            {opt}
          </CardOption>
        ))}
      </div>
      {r.industria === "Otra" && (
        <div className="mt-6">
          <TextInput
            placeholder="Especificá tu industria"
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
  return <SimpleCards title="¿En qué tipo de empresa trabajás?" options={TIPOS_EMPRESA} value={r.tipoEmpresa} onChange={(v) => setR({ tipoEmpresa: v })} />;
}

function P4Nivel({ r, setR }: Props) {
  return (
    <>
      <QuestionTitle>¿Cuál es tu nivel jerárquico?</QuestionTitle>
      <QuestionHint>
        Si ninguna opción te representa, elegí "Otro" y describilo en tus palabras.
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {NIVELES.map((opt) => (
          <CardOption key={opt} selected={r.nivel === opt} onClick={() => setR({ nivel: opt })}>
            {opt}
          </CardOption>
        ))}
      </div>
      {r.nivel === "Otro" && (
        <div className="mt-6">
          <TextInput
            placeholder="Especificá tu nivel"
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
  const sel = r.funciones ?? [];
  const toggle = (opt: string) => {
    if (sel.includes(opt)) setR({ funciones: sel.filter((x) => x !== opt) });
    else setR({ funciones: [...sel, opt] });
  };
  return (
    <>
      <QuestionTitle>¿Qué funciones reales forman parte de tu trabajo?</QuestionTitle>
      <QuestionHint>
        Seleccioná todas las funciones que forman parte real de tu trabajo —
        aunque no estén en tu descripción formal de puesto.
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FUNCIONES.map((opt) => (
          <CardOption key={opt} selected={sel.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>
      {sel.includes("Otra") && (
        <div className="mt-6">
          <TextInput
            placeholder="Especificá la función"
            value={r.funcionesOtra ?? ""}
            onChange={(e) => setR({ funcionesOtra: e.target.value })}
          />
        </div>
      )}
      <div className="mt-8 pt-8 border-t border-hueso/10">
        <p className="font-body text-sm text-hueso/60 mb-3">
          O si preferís, pegá tu descripción de puesto o responsabilidades acá y la IA extrae las funciones.
        </p>
        <TextArea
          placeholder="Pegá tu descripción de puesto..."
          value={r.funcionesTexto ?? ""}
          onChange={(e) => setR({ funcionesTexto: e.target.value })}
        />
      </div>
    </>
  );
}

function P9Idiomas({ r, setR }: Props) {
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
      <QuestionTitle>¿Qué idiomas usás en tu trabajo además del español?</QuestionTitle>
      {r.sinIdiomas ? (
        <div className="border border-hueso/20 p-5 text-hueso/70 font-body">
          No usás otros idiomas en tu trabajo.
          <button
            type="button"
            className="ml-3 font-ui text-[10px] text-hueso/60 hover:text-hueso underline"
            onClick={() => setR({ sinIdiomas: false })}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {idiomas.map((idi, i) => (
              <div key={i} className="border border-hueso/15 p-4 bg-hueso/[0.02]">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="font-ui text-[10px] text-hueso/50">IDIOMA {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="font-ui text-[10px] text-hueso/40 hover:text-hueso"
                  >
                    Quitar
                  </button>
                </div>
                <TextInput
                  placeholder="Ej: Inglés, Portugués, Francés"
                  value={idi.idioma}
                  onChange={(e) => update(i, { idioma: e.target.value })}
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {NIVELES_IDIOMA.map((n) => (
                    <ChipOption key={n} selected={idi.nivel === n} onClick={() => update(i, { nivel: n })}>
                      {n}
                    </ChipOption>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="font-ui text-[9px] text-hueso/40 mb-2">CERTIFICACIÓN INTERNACIONAL (OPCIONAL)</p>
                  <TextInput
                    placeholder="Ej: TOEFL 95, Cambridge C1, DELF B2"
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
              + Agregar idioma
            </button>
            <button
              type="button"
              onClick={() => setR({ sinIdiomas: true, idiomas: [] })}
              className="font-ui text-[11px] text-hueso/50 hover:text-hueso transition-colors"
            >
              No uso otros idiomas en mi trabajo
            </button>
          </div>
        </>
      )}
    </>
  );
}

function P12Formacion({ r, setR }: Props) {
  return <MultiCards title="¿Cuál es tu formación?" hint="Podés seleccionar varias." options={FORMACIONES} value={r.formacion} onChange={(v) => setR({ formacion: v })} />;
}

function P13Certificaciones({ r, setR }: Props) {
  const [input, setInput] = React.useState("");
  const items = r.certificaciones ?? [];
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (items.includes(v)) { setInput(""); return; }
    setR({ certificaciones: [...items, v], sinCertificaciones: false });
    setInput("");
  };
  return (
    <>
      <QuestionTitle>¿Tenés certificaciones profesionales?</QuestionTitle>
      <QuestionHint>
        Cuentan como certificaciones formales aquellas que incluyen examen o
        acreditación de un organismo reconocido (ej: PMP, AWS Certified, CFA,
        Scrum Master, Google Analytics, SHRM, CPA). No incluyas cursos cortos
        sin examen ni capacitaciones internas.
      </QuestionHint>
      {r.sinCertificaciones ? (
        <div className="border border-hueso/20 p-5 text-hueso/70 font-body">
          No tenés certificaciones relevantes.
          <button
            type="button"
            className="ml-3 font-ui text-[10px] text-hueso/60 hover:text-hueso underline"
            onClick={() => setR({ sinCertificaciones: false })}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <TextInput
            placeholder="Ej: PMP, AWS, Google Analytics, SHRM. Escribí cada una y presioná Enter."
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
                    aria-label={`Quitar ${c}`}
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
            No tengo certificaciones relevantes
          </button>
        </>
      )}
    </>
  );
}

function P14HerramientasIA({ r, setR }: Props) {
  const tools = r.herramientasIA ?? [];
  const usos = r.usoIA ?? [];
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
      <QuestionTitle>¿Qué herramientas de IA usás en tu trabajo?</QuestionTitle>
      <QuestionHint>Seleccioná todas las que apliquen.</QuestionHint>
      <div className="flex flex-wrap gap-2 mb-10">
        {HERRAMIENTAS_IA.map((t) => (
          <ChipOption key={t} selected={tools.includes(t)} onClick={() => toggleTool(t)}>
            {t}
          </ChipOption>
        ))}
      </div>

      <div className="border-t border-hueso/10 pt-8 mb-10">
        <h2 className="font-display text-2xl mb-5 text-hueso">¿Con qué frecuencia las usás?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FRECUENCIAS_IA.map((f) => (
            <CardOption key={f} selected={r.frecuenciaIA === f} onClick={() => setR({ frecuenciaIA: f })}>
              {f}
            </CardOption>
          ))}
        </div>
      </div>

      <div className="border-t border-hueso/10 pt-8">
        <h2 className="font-display text-2xl mb-5 text-hueso">¿Para qué las usás principalmente?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {USOS_IA.map((u) => (
            <CardOption key={u} selected={usos.includes(u)} onClick={() => toggleUso(u)}>
              {u}
            </CardOption>
          ))}
        </div>
      </div>
    </>
  );
}

function P15Situacion({ r, setR }: Props) {
  return (
    <>
      <QuestionTitle>¿Cuál es tu situación laboral actual?</QuestionTitle>
      <div className="grid grid-cols-1 gap-3 mb-8">
        {SITUACIONES.map((s) => (
          <CardOption
            key={s.id}
            selected={r.situacion === s.id}
            onClick={() => setR({
              situacion: s.id,
              // reset campos dependientes
              salario: undefined, moneda: undefined, brutoNeto: undefined,
              trabajaActualmente: undefined, salarioAnterior: undefined,
              monedaAnterior: undefined, tiempoSinTrabajo: undefined,
            })}
          >
            {s.label}
          </CardOption>
        ))}
      </div>

      {r.situacion === "empleado" && (
        <div className="border-t border-hueso/10 pt-8 space-y-6">
          <SalarioInput
            label="¿Cuál es tu salario bruto mensual actual?"
            valor={r.salario}
            moneda={r.moneda}
            onValor={(v) => setR({ salario: v })}
            onMoneda={(m) => setR({ moneda: m })}
          />
          <div>
            <p className="font-body text-sm text-hueso/70 mb-3">
              ¿Este monto es bruto (antes de impuestos) o neto (lo que recibís en mano)?
            </p>
            <div className="flex gap-2">
              <ChipOption selected={r.brutoNeto === "bruto"} onClick={() => setR({ brutoNeto: "bruto" })}>Bruto</ChipOption>
              <ChipOption selected={r.brutoNeto === "neto"} onClick={() => setR({ brutoNeto: "neto" })}>Neto</ChipOption>
            </div>
          </div>
        </div>
      )}

      {r.situacion === "freelance" && (
        <div className="border-t border-hueso/10 pt-8">
          <SalarioInput
            label="¿Cuánto cobrás mensualmente en promedio?"
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
              ¿Estás trabajando actualmente mientras buscás?
            </p>
            <div className="flex gap-2">
              <ChipOption selected={r.trabajaActualmente === "si"} onClick={() => setR({ trabajaActualmente: "si" })}>Sí</ChipOption>
              <ChipOption selected={r.trabajaActualmente === "no"} onClick={() => setR({ trabajaActualmente: "no" })}>No</ChipOption>
            </div>
          </div>
          {r.trabajaActualmente === "si" && (
            <SalarioInput
              label="¿Cuál es tu salario bruto mensual actual?"
              valor={r.salario}
              moneda={r.moneda}
              onValor={(v) => setR({ salario: v })}
              onMoneda={(m) => setR({ moneda: m })}
            />
          )}
          {r.trabajaActualmente === "no" && (
            <>
              <SalarioInput
                label="¿Cuánto ganabas en tu último trabajo?"
                valor={r.salarioAnterior}
                moneda={r.monedaAnterior}
                onValor={(v) => setR({ salarioAnterior: v })}
                onMoneda={(m) => setR({ monedaAnterior: m })}
              />
              <div>
                <p className="font-body text-base text-hueso mb-3">¿Hace cuánto dejaste ese trabajo?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TIEMPOS_SIN_TRABAJO.map((t) => (
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
            Ingresá un número entero, sin decimales. Los puntos los agregamos automáticamente.
          </p>
        </div>
        <div>
          <select
            value={moneda ?? ""}
            onChange={(e) => onMoneda(e.target.value)}
            className="bg-tinta border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso py-3 pr-2"
          >
            <option value="" className="bg-tinta">Moneda</option>
            {MONEDAS.map((m) => <option key={m} value={m} className="bg-tinta">{m}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function P16Beneficios({ r, setR }: Props) {
  const sel = r.beneficios ?? [];
  const NINGUNO = "Ninguno de los anteriores";
  const toggle = (opt: string) => {
    if (opt === NINGUNO) {
      setR({ beneficios: sel.includes(NINGUNO) ? [] : [NINGUNO], beneficiosOtro: "" });
      return;
    }
    const without = sel.filter((x) => x !== NINGUNO);
    if (without.includes(opt)) setR({ beneficios: without.filter((x) => x !== opt) });
    else setR({ beneficios: [...without, opt] });
  };
  return (
    <>
      <QuestionTitle>¿Qué beneficios recibís?</QuestionTitle>
      <QuestionHint>Seleccioná todos los que apliquen.</QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BENEFICIOS.map((opt) => (
          <CardOption key={opt} selected={sel.includes(opt)} onClick={() => toggle(opt)}>
            {opt}
          </CardOption>
        ))}
      </div>
      {sel.includes("Otro") && (
        <div className="mt-6">
          <TextInput
            placeholder="Especificá el/los beneficios"
            value={r.beneficiosOtro ?? ""}
            onChange={(e) => setR({ beneficiosOtro: e.target.value })}
            autoFocus
          />
        </div>
      )}
    </>
  );
}

function P17Descripcion({ r, setR }: Props) {
  return (
    <>
      <QuestionTitle>Contanos sobre tu puesto</QuestionTitle>
      <QuestionHint>
        Cuanto más detalle, más preciso tu PayRank.
      </QuestionHint>
      <TextArea
        placeholder="Describí tu puesto, responsabilidades principales, a quién reportás y qué decisiones tomás."
        value={r.descripcionPuesto ?? ""}
        onChange={(e) => setR({ descripcionPuesto: e.target.value })}
        className="min-h-48"
      />
    </>
  );
}

function P18Genero({ r, setR }: Props) {
  return (
    <>
      <QuestionTitle>Análisis de brecha de género</QuestionTitle>
      <QuestionHint>
        El análisis compara tu compensación con la de tu mismo puesto, nivel,
        industria y país, segmentado por género — sirve para cualquier identidad,
        no solo para mujeres. La información se usa exclusivamente para este
        cálculo y se almacena de forma anonimizada.
      </QuestionHint>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GENEROS.map((g) => (
          <CardOption key={g} selected={r.genero === g} onClick={() => setR({ genero: g })}>
            {g}
          </CardOption>
        ))}
      </div>
    </>
  );
}

function P19Contacto({ r, setR }: Props) {
  return (
    <>
      <QuestionTitle>¿Cómo te contactamos?</QuestionTitle>
      <div className="space-y-8">
        <div>
          <p className="font-ui text-[10px] text-hueso/50 mb-3">MAIL (OBLIGATORIO)</p>
          <TextInput
            type="email"
            placeholder="tu@mail.com"
            value={r.email ?? ""}
            onChange={(e) => setR({ email: e.target.value })}
          />
          <p className="font-body text-xs text-hueso/45 mt-2">
            Para recibir tu PayRank completo y acceder a tu reporte en cualquier momento. Ante cualquier consulta escribinos a hello@payrank.co
          </p>
        </div>
        <div>
          <p className="font-ui text-[10px] text-hueso/50 mb-3">WHATSAPP (OPCIONAL)</p>
          <TextInput
            type="tel"
            placeholder="+54 9 11 1234 5678"
            value={r.whatsapp ?? ""}
            onChange={(e) => setR({ whatsapp: e.target.value })}
          />
          <p className="font-body text-xs text-hueso/45 mt-2">
            Opcional. Si lo dejás, también recibís tu PayRank por WhatsApp.
          </p>
        </div>
      </div>
    </>
  );
}
