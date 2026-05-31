import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnostico/validacion")({
  head: () => ({ meta: [{ title: "Validá tu información — PayRank" }] }),
  component: ValidacionPage,
});

function monthsAgo(iso: string): number | null {
  // Acepta YYYY-MM-DD o YYYY-MM
  const m = iso.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (!isFinite(y) || !isFinite(mo)) return null;
  const d = new Date(y, mo - 1, 1);
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() - (mo - 1));
}

function formatRecibo(iso: string, isEN: boolean): string {
  const m = iso.match(/^(\d{4})-(\d{1,2})/);
  if (!m) return iso;
  const months = isEN
    ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    : ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${months[Number(m[2]) - 1]} ${m[1]}`;
}

function ValidacionPage() {
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
  const { lang } = useLang();
  const isEN = lang === "EN";
  const r = state.respuestas;
  const ex = state.datosExtraidos ?? {};

  // Detecciones
  const reciboFecha = typeof ex.recibo_fecha === "string" ? ex.recibo_fecha : null;
  const reciboMonthsOld = reciboFecha ? monthsAgo(reciboFecha) : null;
  const showStale = reciboFecha && reciboMonthsOld != null && reciboMonthsOld > 3;

  // Bono sin monto: dispara si CUALQUIER documento lo menciona sin monto.
  const bonoSinMontoFlag =
    ex.bono_mencionado_sin_monto === true || ex.recibo_tiene_variable_sin_monto === true;
  const showVariable = bonoSinMontoFlag && !r.bonoUltimo && !r.sinVariable;

  // Frecuencias de bono inconsistentes entre documentos.
  const frecuenciasRaw = Array.isArray(ex.bono_frecuencias_detectadas)
    ? (ex.bono_frecuencias_detectadas as string[]).filter((x) => typeof x === "string" && x.trim().length > 0)
    : [];
  const frecuenciasUnicas = Array.from(
    new Set(frecuenciasRaw.map((x) => x.trim().toLowerCase())),
  );
  const showFrecuencia = frecuenciasUnicas.length >= 2 && !r.bonoFrecuencia && !r.sinVariable;

  const tituloCv = typeof ex.titulo_cv === "string" ? ex.titulo_cv.trim() : "";
  const tituloRecibo = typeof ex.titulo_recibo === "string" ? ex.titulo_recibo.trim() : "";
  const tituloAcademico = typeof ex.titulo_cv_academico === "string" ? ex.titulo_cv_academico.trim() : "";
  // Mismatch clásico CV vs recibo
  const mismatchCvRecibo =
    !!tituloCv && !!tituloRecibo && tituloCv.toLowerCase() !== tituloRecibo.toLowerCase();
  // Caso ambiguo: solo CV (sin recibo) y además se detectó un grado académico → preguntamos
  // para evitar que el sistema confunda el título académico con el puesto actual.
  const mismatchCvAcademico =
    !tituloRecibo && !!tituloCv && !!tituloAcademico &&
    tituloCv.toLowerCase() !== tituloAcademico.toLowerCase();
  const showTituloMismatch = (mismatchCvRecibo || mismatchCvAcademico) && !r.tituloElegido;

  const showTenure = !r.antiguedadDesde && (r.situacion === "empleado" || r.situacion === "contractor");

  // Experiencia calculada desde el CV — siempre pedimos confirmación si hay valores extraídos
  const extTotal = typeof ex.experiencia_total_anios === "number" ? ex.experiencia_total_anios : null;
  const extIndustria = typeof ex.experiencia_industria_anios === "number" ? ex.experiencia_industria_anios : null;
  const industriaNombre = (r.industria === "Otra" ? r.industriaOtra : r.industria) || (isEN ? "your industry" : "tu industria");
  const showExperiencia =
    (extTotal != null || extIndustria != null) &&
    (r.experienciaTotalAnios == null || r.experienciaIndustriaAnios == null);

  const anyWarning = showStale || showVariable || showFrecuencia || showTituloMismatch || showTenure || showExperiencia;

  // Si no hay nada que validar, saltar a perfil automáticamente
  React.useEffect(() => {
    if (!anyWarning) navigate({ to: "/diagnostico/perfil", replace: true });
  }, [anyWarning, navigate]);

  // Estado local del paso
  const [staleChoice, setStaleChoice] = React.useState<"igual" | "cambio" | null>(null);
  const [nuevoSalario, setNuevoSalario] = React.useState<string>("");
  const [bono, setBono] = React.useState("");
  const [sinVariable, setSinVariable] = React.useState(false);
  const [frecuenciaPick, setFrecuenciaPick] = React.useState<string | null>(null);
  const [frecuenciaOtra, setFrecuenciaOtra] = React.useState("");
  const [tituloPick, setTituloPick] = React.useState<"cv" | "recibo" | "academico" | "otro" | null>(null);
  const [tituloOtro, setTituloOtro] = React.useState("");
  const [antiguedad, setAntiguedad] = React.useState<string>("");
  const [expTotalNum, setExpTotalNum] = React.useState<string>(extTotal != null ? String(extTotal) : "");
  const [expIndNum, setExpIndNum] = React.useState<string>(extIndustria != null ? String(extIndustria) : "");

  const staleOk = !showStale || staleChoice === "igual" || (staleChoice === "cambio" && Number(nuevoSalario.replace(/[^\d]/g, "")) > 0);
  const variableOk = !showVariable || sinVariable || bono.trim().length > 0;
  const frecuenciaOk =
    !showFrecuencia ||
    (frecuenciaPick && frecuenciaPick !== "otra") ||
    (frecuenciaPick === "otra" && frecuenciaOtra.trim().length > 1);
  const tituloOk =
    !showTituloMismatch ||
    tituloPick === "cv" ||
    tituloPick === "recibo" ||
    tituloPick === "academico" ||
    (tituloPick === "otro" && tituloOtro.trim().length > 1);
  const tenureOk = !showTenure || /^\d{4}-\d{2}$/.test(antiguedad);
  const expOk =
    !showExperiencia ||
    (Number(expTotalNum) > 0 && Number(expTotalNum) <= 70 &&
      Number(expIndNum) >= 0 && Number(expIndNum) <= Number(expTotalNum));

  const canContinue = staleOk && variableOk && frecuenciaOk && tituloOk && tenureOk && expOk;

  const onContinue = () => {
    setState((s) => {
      const nr = { ...s.respuestas };
      if (showStale) {
        if (staleChoice === "cambio") {
          const n = Number(nuevoSalario.replace(/[^\d]/g, ""));
          if (n > 0) nr.salario = n;
        }
      }
      if (showVariable) {
        if (sinVariable) nr.sinVariable = true;
        else nr.bonoUltimo = bono.trim();
      }
      if (showFrecuencia) {
        nr.bonoFrecuencia =
          frecuenciaPick === "otra" ? frecuenciaOtra.trim() : (frecuenciaPick ?? "");
      }
      if (showTituloMismatch) {
        nr.tituloElegido =
          tituloPick === "cv" ? tituloCv :
          tituloPick === "recibo" ? tituloRecibo :
          tituloPick === "academico" ? tituloAcademico :
          tituloOtro.trim();
      }
      if (showTenure && /^\d{4}-\d{2}$/.test(antiguedad)) {
        nr.antiguedadDesde = antiguedad;
      }
      return { ...s, respuestas: nr };
    });
    navigate({ to: "/diagnostico/perfil" });
  };

  if (!anyWarning) {
    return (
      <DiagnosticoShell step={3} progress={72}>
        <p className="font-body text-hueso/60">{isEN ? "Continuing…" : "Continuando…"}</p>
      </DiagnosticoShell>
    );
  }

  return (
    <DiagnosticoShell step={3} progress={75}>
      <StepFade k="valid">
        <p className="font-ui text-[10px] text-hueso/45 mb-3">
          {isEN ? "DOCUMENT REVIEW" : "REVISIÓN DE DOCUMENTOS"}
        </p>
        <h1 className="font-display text-3xl md:text-4xl mb-3 text-hueso leading-tight">
          {isEN
            ? <>Before we continue, <span className="font-display-italic">a few quick checks</span></>
            : <>Antes de continuar, <span className="font-display-italic">unas verificaciones rápidas</span></>}
        </h1>
        <p className="font-body text-hueso/60 mb-10">
          {isEN
            ? "We detected things in your documents that need your confirmation. This makes the report accurate."
            : "Detectamos cosas en tus documentos que necesitan tu confirmación. Esto hace que el reporte sea preciso."}
        </p>

        <div className="space-y-6">
          {showStale && (
            <Card>
              <Label>{isEN ? "Pay stub age" : "Fecha del recibo"}</Label>
              <p className="font-body text-base text-hueso mb-4">
                {isEN
                  ? `Your pay stub is from ${formatRecibo(reciboFecha!, true)}. Is your current salary still the same or did it change?`
                  : `Tu recibo es de ${formatRecibo(reciboFecha!, false)}. ¿Tu salario actual sigue siendo el mismo o cambió desde entonces?`}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Pick selected={staleChoice === "igual"} onClick={() => setStaleChoice("igual")}>
                  {isEN ? "Same as in the stub" : "Sigue igual"}
                </Pick>
                <Pick selected={staleChoice === "cambio"} onClick={() => setStaleChoice("cambio")}>
                  {isEN ? "It changed" : "Cambió"}
                </Pick>
              </div>
              {staleChoice === "cambio" && (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={isEN ? "Current monthly amount (numbers only)" : "Monto actual mensual (solo números)"}
                  value={nuevoSalario}
                  onChange={(e) => setNuevoSalario(e.target.value)}
                  className="w-full mt-2 bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso placeholder:text-hueso/30 py-3"
                />
              )}
            </Card>
          )}

          {showVariable && (
            <Card>
              <Label>{isEN ? "Variable / bonus" : "Componente variable"}</Label>
              <p className="font-body text-base text-hueso mb-4">
                {isEN
                  ? "We detected you have a variable component but the amount doesn't appear. What's the amount of your last bonus / variable received?"
                  : "Detectamos que tenés un componente variable pero no aparece el monto. ¿Cuál es el monto de tu último bono o variable cobrado?"}
              </p>
              <input
                type="text"
                placeholder={isEN ? "e.g. USD 5,000 / 2 monthly salaries / 15% of annual" : "ej: USD 5.000 / 2 sueldos / 15% del anual"}
                value={bono}
                onChange={(e) => { setBono(e.target.value); if (e.target.value) setSinVariable(false); }}
                disabled={sinVariable}
                className="w-full bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso placeholder:text-hueso/30 py-3 disabled:opacity-40"
              />
              <label className="mt-4 inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sinVariable}
                  onChange={(e) => { setSinVariable(e.target.checked); if (e.target.checked) setBono(""); }}
                  className="accent-hueso"
                />
                <span className="font-body text-sm text-hueso/80">
                  {isEN ? "I don't have a variable component" : "No tengo componente variable"}
                </span>
              </label>
            </Card>
          )}

          {showFrecuencia && (
            <Card>
              <Label>{isEN ? "Bonus frequency mismatch" : "Frecuencia de bono inconsistente"}</Label>
              <p className="font-body text-base text-hueso mb-4">
                {isEN
                  ? <>We detected inconsistent information about your variable component: in one place it says <em>{frecuenciasUnicas[0]}</em> and in another <em>{frecuenciasUnicas[1]}</em>. Which one is correct?</>
                  : <>Detectamos información inconsistente sobre tu componente variable: en un campo dijiste <em>{frecuenciasUnicas[0]}</em> y en otro <em>{frecuenciasUnicas[1]}</em>. ¿Cuál es la correcta?</>}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {frecuenciasUnicas.map((f) => (
                  <Pick key={f} selected={frecuenciaPick === f} onClick={() => setFrecuenciaPick(f)}>{f}</Pick>
                ))}
                <Pick selected={frecuenciaPick === "otra"} onClick={() => setFrecuenciaPick("otra")}>
                  {isEN ? "Other" : "Otra"}
                </Pick>
              </div>
              {frecuenciaPick === "otra" && (
                <input
                  type="text"
                  placeholder={isEN ? "Clarify the real frequency" : "Aclará la frecuencia real"}
                  value={frecuenciaOtra}
                  onChange={(e) => setFrecuenciaOtra(e.target.value)}
                  className="w-full mt-2 bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso placeholder:text-hueso/30 py-3"
                />
              )}
            </Card>
          )}

          {showTituloMismatch && (
            <Card>
              <Label>{isEN ? "Current job title" : "Puesto actual"}</Label>
              <p className="font-body text-base text-hueso mb-4">
                {mismatchCvRecibo
                  ? (isEN
                      ? <>Your CV says <em>{tituloCv}</em> but your pay stub says <em>{tituloRecibo}</em>. Which one best describes what you do today?</>
                      : <>Tu CV dice <em>{tituloCv}</em> pero tu recibo dice <em>{tituloRecibo}</em>. ¿Cuál describe mejor lo que hacés hoy?</>)
                  : (isEN
                      ? <>We couldn't reliably tell your current job title apart from your academic degree. What is your current job title?</>
                      : <>No pudimos distinguir con seguridad tu puesto actual de tu título académico. ¿Cuál es tu puesto actual?</>)}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {tituloCv && (
                  <Pick selected={tituloPick === "cv"} onClick={() => setTituloPick("cv")}>{tituloCv}</Pick>
                )}
                {tituloRecibo && (
                  <Pick selected={tituloPick === "recibo"} onClick={() => setTituloPick("recibo")}>{tituloRecibo}</Pick>
                )}
                {tituloAcademico && !mismatchCvRecibo && (
                  <Pick selected={tituloPick === "academico"} onClick={() => setTituloPick("academico")}>{tituloAcademico}</Pick>
                )}
                <Pick selected={tituloPick === "otro"} onClick={() => setTituloPick("otro")}>{isEN ? "Other" : "Otro"}</Pick>
              </div>
              {tituloPick === "otro" && (
                <input
                  type="text"
                  placeholder={isEN ? "Describe your real role" : "Describí tu rol real"}
                  value={tituloOtro}
                  onChange={(e) => setTituloOtro(e.target.value)}
                  className="w-full mt-2 bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso placeholder:text-hueso/30 py-3"
                />
              )}
            </Card>
          )}

          {showTenure && (
            <Card>
              <Label>{isEN ? "Tenure in this company" : "Antigüedad en esta empresa"}</Label>
              <p className="font-body text-base text-hueso mb-4">
                {isEN
                  ? "Since when have you been working at this company? (Recent hires and tenured employees negotiate differently)."
                  : "¿Desde cuándo estás en esta empresa? (Los recién ingresados y los empleados con antigüedad negocian distinto)."}
              </p>
              <input
                type="month"
                value={antiguedad}
                onChange={(e) => setAntiguedad(e.target.value)}
                className="bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg text-hueso placeholder:text-hueso/30 py-3"
              />
            </Card>
          )}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className={cn(
              "inline-flex items-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 transition-colors",
              !canContinue && "opacity-40 cursor-not-allowed",
            )}
          >
            {isEN ? "Continue" : "Continuar"} <span aria-hidden>→</span>
          </button>
        </div>
      </StepFade>
    </DiagnosticoShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="border border-hueso/15 p-5 md:p-6 bg-hueso/[0.02]">{children}</section>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-ui text-[10px] text-hueso/50 mb-3 uppercase tracking-wider">{children}</p>;
}
function Pick({ selected, onClick, children }: { selected?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-ui text-[11px] px-4 py-2 border transition-colors",
        selected ? "border-hueso bg-hueso text-tinta" : "border-hueso/30 text-hueso/80 hover:border-hueso",
      )}
    >
      {children}
    </button>
  );
}
