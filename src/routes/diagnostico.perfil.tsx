import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import { useLang } from "@/lib/lang";
import { TITULOS_MODO, TITULOS_MODO_EN } from "@/lib/diagnostico/data";
import { createDiagnostico, simulatePayment } from "@/lib/diagnostico/diagnostico.functions";

export const Route = createFileRoute("/diagnostico/perfil")({
  head: () => ({ meta: [{ title: "Confirmá tu perfil — PayRank" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const { state } = useDiagnostico();
  const { lang } = useLang();
  const isEN = lang === "EN";
  const r = state.respuestas;
  const create = useServerFn(createDiagnostico);
  const simulate = useServerFn(simulatePayment);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const isDev = import.meta.env.DEV;
  const [betaToken, setBetaToken] = React.useState<string | null>(null);
  const [codigoReferido, setCodigoReferido] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setBetaToken(window.localStorage.getItem("payrank.betaToken"));
      setCodigoReferido(window.localStorage.getItem("payrank.codigoReferido"));
    }
  }, []);

  const back = () => navigate({ to: "/diagnostico/inferencia" });

  // Crea el diagnóstico (sin marcarlo pagado) y lleva a consentimientos
  const next = async () => {
    setBusy(true);
    setErr(null);
    try {
      const created = await create({
        data: {
          modo: state.modo,
          plan: state.plan,
          respuestas: state.respuestas as Record<string, unknown>,
          inferencia: state.inferencia,
          inferenciaValidada: state.inferenciaValidada,
          datosExtraidos: (state.datosExtraidos ?? null) as Record<string, unknown> | null,
          codigoReferido: codigoReferido ?? undefined,
        },
      });
      if (typeof window !== "undefined") window.localStorage.removeItem("payrank.codigoReferido");
      navigate({ to: "/diagnostico/consentimientos", search: { id: created.id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
      setBusy(false);
    }
  };

  // DEV ONLY — crea y simula pago directo
  const simulateAndGenerate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const created = await create({
        data: {
          modo: state.modo,
          plan: state.plan,
          respuestas: state.respuestas as Record<string, unknown>,
          inferencia: state.inferencia,
          inferenciaValidada: state.inferenciaValidada,
          datosExtraidos: (state.datosExtraidos ?? null) as Record<string, unknown> | null,
          codigoReferido: codigoReferido ?? undefined,
        },
      });
      if (typeof window !== "undefined") window.localStorage.removeItem("payrank.codigoReferido");
      await simulate({ data: { id: created.id } });
      navigate({ to: "/diagnostico/procesando", search: { id: created.id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
      setBusy(false);
    }
  };


  const dash = "—";

  const Bloque = ({ titulo, items }: { titulo: string; items: { k: string; v: React.ReactNode }[] }) => (
    <section className="border border-hueso/15 p-5 md:p-6 bg-hueso/[0.02]">
      <p className="font-ui text-[10px] text-hueso/50 mb-4">{titulo.toUpperCase()}</p>
      <dl className="space-y-3">
        {items.map(({ k, v }) => (
          <div key={k} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
            <dt className="font-body text-sm text-hueso/55 md:w-56 shrink-0">{k}</dt>
            <dd className="font-body text-base text-hueso flex-1">{v || dash}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const pais = r.pais === "Otro" ? r.paisOtro : r.pais;
  const industria = r.industria === "Otra" ? r.industriaOtra : r.industria;
  const funciones = [...(r.funciones ?? [])];
  if (funciones.includes("Otra") && r.funcionesOtra) {
    const idx = funciones.indexOf("Otra");
    funciones[idx] = `Otra: ${r.funcionesOtra}`;
  }

  const situacionLabel = isEN
    ? (r.situacion === "empleado" ? "Employed" : r.situacion === "busqueda" ? "Active job search" : r.situacion === "freelance" ? "Freelance / independent consultant" : dash)
    : (r.situacion === "empleado" ? "Empleado/a" : r.situacion === "busqueda" ? "En búsqueda activa" : r.situacion === "freelance" ? "Freelance / consultor/a" : dash);
  const salarioStr = r.salario && r.moneda
    ? `${r.moneda} ${r.salario.toLocaleString("es-AR")}${r.brutoNeto ? ` (${r.brutoNeto})` : ""}`
    : (r.salarioAnterior && r.monedaAnterior
      ? `${r.monedaAnterior} ${r.salarioAnterior.toLocaleString("es-AR")} (${isEN ? "last job" : "último trabajo"})`
      : dash);

  return (
    <DiagnosticoShell step={4} progress={80}>
      <StepFade k="perfil">
        <p className="font-ui text-[10px] text-hueso/45 mb-3">{isEN ? "FINAL REVIEW" : "VALIDACIÓN FINAL"}</p>
        <h1 className="font-display text-3xl md:text-4xl mb-3 text-hueso leading-tight">
          {isEN
            ? <>Before continuing, <span className="font-display-italic">confirm</span> your full profile</>
            : <>Antes de continuar, <span className="font-display-italic">confirmá</span> tu perfil completo</>}
        </h1>
        <p className="font-body text-hueso/60 mb-10">
          {isEN
            ? "Review your data. If something is incorrect, you can go back and correct it."
            : "Revisá los datos. Si algo no es correcto, podés volver y corregirlo."}
        </p>

        <div className="space-y-5">
          <Bloque
            titulo={isEN ? "Block 1 · Your situation" : "Bloque 1 · Tu situación"}
            items={[
              { k: isEN ? "Selected mode" : "Modo elegido", v: isEN ? TITULOS_MODO_EN[state.modo] : TITULOS_MODO[state.modo] },
              { k: isEN ? "Country" : "País", v: pais },
              { k: isEN ? "Industry" : "Industria", v: industria },
              { k: isEN ? "Company type" : "Tipo de empresa", v: r.tipoEmpresa },
              { k: isEN ? "Employment situation" : "Situación laboral", v: situacionLabel },
            ]}
          />
          <Bloque
            titulo={isEN ? "Block 2 · Your role" : "Bloque 2 · Tu rol"}
            items={[
              { k: isEN ? "Level" : "Nivel jerárquico", v: r.nivel },
              { k: isEN ? "Scope" : "Alcance", v: r.alcance },
              { k: isEN ? "Main functions" : "Funciones principales", v: funciones.join(" · ") || (r.funcionesTexto ? (isEN ? "(free description)" : "(descripción libre)") : "") },
              { k: isEN ? "Direct reports" : "Personas a cargo", v: r.personasACargo },
              { k: isEN ? "Interaction with senior management" : "Interacción con dirección", v: r.interaccion },
            ]}
          />
          <Bloque
            titulo={isEN ? "Block 3 · Your profile" : "Bloque 3 · Tu perfil"}
            items={[
              { k: isEN ? "Total experience" : "Experiencia total", v: r.expTotal },
              { k: isEN ? "Industry experience" : "Experiencia en industria", v: r.expIndustria },
              { k: isEN ? "Education" : "Formación", v: (r.formacion ?? []).join(" · ") },
              { k: isEN ? "Certifications" : "Certificaciones", v: r.sinCertificaciones ? (isEN ? "None" : "Ninguna") : (r.certificaciones ?? []).join(" · ") },
              { k: isEN ? "Languages" : "Idiomas", v: r.sinIdiomas ? (isEN ? "English only" : "Solo español") : (r.idiomas ?? []).map((i) => `${i.idioma} (${i.nivel}${i.certificacion ? `, ${i.certificacion}` : ""})`).join(" · ") },
              { k: isEN ? "AI tools" : "Herramientas de IA", v: (r.herramientasIA ?? []).join(" · ") + (r.frecuenciaIA ? ` — ${r.frecuenciaIA}` : "") },
            ]}
          />
          <Bloque
            titulo={isEN ? "Block 4 · Your current compensation" : "Bloque 4 · Tu compensación actual"}
            items={[
              { k: isEN ? "Employment situation" : "Situación laboral", v: situacionLabel },
              { k: isEN ? "Salary" : "Salario", v: salarioStr },
              { k: isEN ? "Benefits" : "Beneficios", v: (r.beneficios ?? []).join(" · ") },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="inline-flex items-center justify-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 disabled:opacity-50 transition-colors"
          >
            {busy
              ? (isEN ? "Saving…" : "Guardando…")
              : isEN
                ? <>Yes, it's correct — continue <span aria-hidden>→</span></>
                : <>Sí, es correcto — continuá <span aria-hidden>→</span></>}
          </button>
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center justify-center font-ui text-[11px] text-hueso/70 px-6 py-3 border border-hueso/30 hover:border-hueso transition-colors"
          >
            {isEN ? "I want to correct something" : "Quiero corregir algo"}
          </button>
        </div>

        {betaToken && (
          <p className="mt-4 font-ui text-[10px] text-hueso/55 tracking-wider uppercase">
            Acceso beta activo · token {betaToken.slice(0, 8)}…
          </p>
        )}

        {err && !isDev && <p className="mt-3 text-xs text-red-300/90 font-body">{err}</p>}

        {isDev && (
          <div className="mt-8 border border-dashed border-hueso/30 p-5">
            <p className="font-ui text-[10px] text-hueso/50 mb-2">MODO DESARROLLO</p>
            <p className="font-body text-sm text-hueso/70 mb-4">
              {isEN ? "Skip paywall: simulate a confirmed payment and generate the PayRank now." : "Saltá el paywall: simulá un pago confirmado y generá el PayRank ahora."}
            </p>
            <button
              type="button"
              onClick={simulateAndGenerate}
              disabled={busy}
              className="inline-flex items-center justify-center bg-hueso text-tinta px-5 py-3 font-ui text-[11px] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {busy ? (isEN ? "Generating…" : "Generando…") : (isEN ? "Simulate payment and generate PayRank" : "Simular pago y generar PayRank")}
            </button>
            {err && <p className="mt-3 text-xs text-red-300/90 font-body">{err}</p>}
          </div>
        )}
      </StepFade>
    </DiagnosticoShell>
  );
}
