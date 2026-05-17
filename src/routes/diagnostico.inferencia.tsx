import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import { NavButtons } from "@/components/diagnostico/Controls";
import { useDiagnostico } from "@/lib/diagnostico/store";
import type { Inferencia } from "@/lib/diagnostico/types";

export const Route = createFileRoute("/diagnostico/inferencia")({
  head: () => ({ meta: [{ title: "Validá la inferencia — PayRank" }] }),
  component: InferenciaPage,
});

function inferirMock(r: ReturnType<typeof useDiagnostico>["state"]["respuestas"]): Inferencia {
  const nivel = r.nivel ?? "";
  const interaccion = r.interaccion ?? "";
  const alcance = r.alcance ?? "";
  const equipo = r.personasACargo ?? "";
  const funciones = Array.isArray(r.funciones) ? (r.funciones as string[]) : [];
  const funcionesTexto = (r.funcionesTexto as string) ?? "";
  const descPuesto = (r.descripcionPuesto as string) ?? "";
  const textoLibre = `${funcionesTexto} ${descPuesto}`.toLowerCase();

  // ---------- Interlocución ----------
  const mencionaCLevel = /\b(founder|co[- ]?founder|ceo|cfo|coo|cto|cmo|chro|director\s+general|gerente\s+general)\b/.test(textoLibre);
  let interlocucion: string;
  let interlocucionJustif: string;
  if (interaccion.startsWith("Reporto directamente") || mencionaCLevel) {
    interlocucion = "Ejecutivo";
    interlocucionJustif = mencionaCLevel && !interaccion.startsWith("Reporto directamente")
      ? "Mencionás reporte directo a C-Level/founder en la descripción de tu rol."
      : "Reportás directamente a dirección ejecutiva.";
  } else if (interaccion.includes("frecuente")) {
    interlocucion = "Senior";
    interlocucionJustif = "Tenés interacción frecuente con dirección ejecutiva.";
  } else if (interaccion.includes("ocasional")) {
    interlocucion = "Medio";
    interlocucionJustif = "Tu interacción con dirección ejecutiva es ocasional.";
  } else {
    interlocucion = "Operativo";
    interlocucionJustif = "Sin contacto directo declarado con dirección ejecutiva.";
  }

  // ---------- Alcance (lectura directa del campo) ----------
  let influencia: string;
  if (alcance === "Global") influencia = "Global";
  else if (alcance.startsWith("Regional")) influencia = "Regional";
  else if (alcance.startsWith("Local")) influencia = "Local";
  else influencia = "Local";
  const influenciaJustif = `Alcance declarado en el formulario: ${alcance || "—"}.`;

  // ---------- Autonomía ----------
  const reportaCLevel = interaccion.startsWith("Reporto directamente") || mencionaCLevel;
  const tieneEquipo = equipo.startsWith("Sí");
  let autonomia: string;
  let autonomiaJustif: string;
  if (nivel === "Director/Head" || nivel === "C-Level/VP") {
    autonomia = "Alta";
    autonomiaJustif = `Tu nivel (${nivel}) implica autonomía decisional alta.`;
  } else if (nivel === "Senior Manager/Gerente" && reportaCLevel) {
    autonomia = "Alta";
    autonomiaJustif = "Gerente con reporte directo a C-Level: autonomía decisional alta.";
  } else if (nivel === "Manager/Líder de equipo" && tieneEquipo) {
    autonomia = "Media-Alta";
    autonomiaJustif = "Manager con equipo a cargo: autonomía media-alta.";
  } else if (nivel === "Senior/Especialista" || nivel === "Semi-senior") {
    autonomia = "Media";
    autonomiaJustif = `Nivel ${nivel}: autonomía media.`;
  } else if (nivel === "Junior/Analista") {
    autonomia = "Baja";
    autonomiaJustif = "Nivel junior: autonomía baja, decisiones supervisadas.";
  } else {
    autonomia = "Media";
    autonomiaJustif = `Inferido a partir de tu nivel (${nivel || "—"}).`;
  }

  // ---------- Impacto en el negocio ----------
  const fnImpacto = funciones.some((f) =>
    ["Presupuesto/P&L", "Estrategia", "RRHH/Talento", "Gestión de personas", "Finanzas/Contabilidad"].includes(f),
  );
  const fnCoord = funciones.some((f) => ["Proyectos/PMO", "Project Management", "Operaciones"].includes(f));
  let impactoNegocio: string;
  let impactoJustif: string;
  if (fnImpacto) {
    impactoNegocio = "Alto";
    impactoJustif = "Tus funciones incluyen P&L, estrategia o decisiones de personas/presupuesto.";
  } else if (fnCoord) {
    impactoNegocio = "Medio";
    impactoJustif = "Tus funciones son principalmente de coordinación.";
  } else {
    impactoNegocio = "Bajo";
    impactoJustif = "Tus funciones son principalmente de ejecución.";
  }

  // ---------- Complejidad de gestión ----------
  let complejidad: Inferencia["complejidad"];
  let complejidadJustif: string;
  if (equipo.includes("grande")) {
    complejidad = "Alto";
    complejidadJustif = "Equipo grande a cargo (más de 15 personas).";
  } else if (equipo.startsWith("Sí")) {
    complejidad = "Medio";
    complejidadJustif = `Equipo a cargo: ${equipo.replace(/^Sí, /, "")}.`;
  } else {
    complejidad = "Bajo";
    complejidadJustif = "Trabajás de forma individual, sin equipo a cargo.";
  }

  return {
    impactoNegocio,
    impactoJustif,
    complejidad,
    complejidadJustif,
    interlocucion,
    interlocucionJustif,
    influencia,
    influenciaJustif,
    autonomia,
    autonomiaJustif,
  };
}

function InferenciaPage() {
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const [editando, setEditando] = React.useState(false);

  React.useEffect(() => {
    if (!state.inferencia) {
      const inferida = inferirMock(state.respuestas);
      setState((s) => ({ ...s, inferencia: inferida }));
    }
  }, [state.inferencia, state.respuestas, setState]);

  const inf = state.inferencia;
  if (!inf) {
    return (
      <DiagnosticoShell step={3} progress={65}>
        <p className="font-body text-hueso/60">Analizando tu perfil...</p>
      </DiagnosticoShell>
    );
  }

  const updateInf = (patch: Partial<Inferencia>) => {
    setState((s) => ({ ...s, inferencia: { ...inf, ...patch } }));
  };

  const confirm = () => {
    setState((s) => ({ ...s, inferenciaValidada: true }));
    navigate({ to: "/diagnostico/perfil" });
  };

  const dimensiones: { key: keyof Inferencia; label: string; valueKey: keyof Inferencia; justifKey: keyof Inferencia; opciones: string[] }[] = [
    { key: "impactoNegocio", label: "Impacto en el negocio", valueKey: "impactoNegocio", justifKey: "impactoJustif", opciones: ["Alto", "Medio", "Bajo"] },
    { key: "complejidad", label: "Complejidad de gestión", valueKey: "complejidad", justifKey: "complejidadJustif", opciones: ["Alto", "Medio", "Bajo"] },
    { key: "interlocucion", label: "Nivel de interlocución", valueKey: "interlocucion", justifKey: "interlocucionJustif", opciones: ["Ejecutivo", "Senior", "Medio", "Operativo"] },
    { key: "influencia", label: "Alcance de influencia", valueKey: "influencia", justifKey: "influenciaJustif", opciones: ["Global", "Regional", "Local"] },
    { key: "autonomia", label: "Autonomía en decisiones", valueKey: "autonomia", justifKey: "autonomiaJustif", opciones: ["Alta", "Media", "Baja"] },
  ];

  return (
    <DiagnosticoShell step={3} progress={70}>
      <StepFade k="inf">
        <p className="font-ui text-[10px] text-hueso/45 mb-3">VALIDACIÓN DE INFERENCIA</p>
        <h1 className="font-display text-3xl md:text-4xl mb-3 text-hueso leading-tight">
          Esto es lo que <span className="font-display-italic">inferimos</span> sobre el alcance real de tu rol
        </h1>
        <p className="font-body text-hueso/60 mb-6">
          Esta inferencia impacta directamente en tu diagnóstico. Si algo no refleja tu situación real, corregilo ahora.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/diagnostico/preguntas" })}
          className="font-ui text-[10px] text-hueso/60 hover:text-hueso underline mb-10"
        >
          ← Volver y editar respuestas anteriores
        </button>

        <div className="space-y-5">
          {dimensiones.map((d) => (
            <div key={d.key} className="border border-hueso/15 p-5 md:p-6 bg-hueso/[0.02]">
              <div className="flex items-baseline justify-between mb-2 gap-3">
                <p className="font-ui text-[10px] text-hueso/50">{d.label.toUpperCase()}</p>
                <p className="font-display text-2xl text-hueso">→ {String(inf[d.valueKey])}</p>
              </div>
              <p className="font-body text-sm text-hueso/65 leading-relaxed">
                {String(inf[d.justifKey])}
              </p>
              {editando && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {d.opciones.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateInf({ [d.valueKey]: opt } as Partial<Inferencia>)}
                      className={`font-ui text-[10px] px-3 py-1.5 border transition-colors ${
                        inf[d.valueKey] === opt
                          ? "border-hueso bg-hueso text-tinta"
                          : "border-hueso/30 text-hueso/70 hover:border-hueso"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {!editando ? (
          <div className="mt-10 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={confirm}
              className="inline-flex items-center justify-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
            >
              Todo correcto — continuá <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="inline-flex items-center justify-center font-ui text-[11px] text-hueso/70 px-6 py-3 border border-hueso/30 hover:border-hueso transition-colors"
            >
              Quiero ajustar algo
            </button>
          </div>
        ) : (
          <NavButtons
            onBack={() => setEditando(false)}
            onNext={confirm}
            nextLabel="Guardar y continuar"
          />
        )}
      </StepFade>
    </DiagnosticoShell>
  );
}
