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
  const isSenior = ["Senior Manager/Gerente", "Director/Head", "C-Level/VP"].includes(r.nivel ?? "");
  const isManager = ["Manager/Líder de equipo", "Senior Manager/Gerente", "Director/Head", "C-Level/VP"].includes(r.nivel ?? "");
  const equipoGrande = (r.personasACargo ?? "").includes("grande") || (r.personasACargo ?? "").includes("mediano");
  const alcanceGlobal = r.alcance === "Global";
  const alcanceRegional = r.alcance?.startsWith("Regional");
  const altaInteraccion = (r.interaccion ?? "").includes("frecuente") || (r.interaccion ?? "").includes("Reporto");

  return {
    impactoNegocio: isSenior ? "Alto" : isManager ? "Medio" : "Bajo",
    impactoJustif: `Inferido a partir de tu nivel (${r.nivel ?? "—"}) y funciones reportadas.`,
    complejidad: equipoGrande || isManager ? "Alto" : "Medio",
    complejidadJustif: `Tu rol incluye ${r.personasACargo?.toLowerCase() ?? "trabajo individual"}.`,
    interlocucion: altaInteraccion ? "Ejecutivo" : isManager ? "Senior" : "Medio",
    interlocucionJustif: `Basado en tu interacción con dirección: ${r.interaccion ?? "—"}.`,
    influencia: alcanceGlobal ? "Global" : alcanceRegional ? "Regional" : "Local",
    influenciaJustif: `Alcance declarado: ${r.alcance ?? "—"}.`,
    autonomia: isSenior ? "Alta" : isManager ? "Media" : "Baja",
    autonomiaJustif: `Inferido por nivel jerárquico y reporte directo.`,
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
        <p className="font-body text-hueso/60 mb-10">
          Esta inferencia impacta directamente en tu diagnóstico. Si algo no refleja tu situación real, corregilo ahora.
        </p>

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
