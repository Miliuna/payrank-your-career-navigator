import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import { useLang } from "@/lib/lang";
import { TITULOS_MODO, TITULOS_MODO_EN, FUNCIONES, INDUSTRIAS, INDUSTRIAS_EN, NIVELES, NIVELES_EN, PAISES_EN, TIPOS_EMPRESA, TIPOS_EMPRESA_EN, labelOf } from "@/lib/diagnostico/data";
import { createDiagnostico, simulatePayment } from "@/lib/diagnostico/diagnostico.functions";
import type { Respuestas } from "@/lib/diagnostico/types";

function buildBeneficiosStr(r: Respuestas, isEN: boolean): string {
  const parts: string[] = [];
  const t = (es: string, en: string) => (isEN ? en : es);

  // Legacy array
  if (r.beneficios?.length) {
    parts.push(...r.beneficios);
  }
  if (r.beneficiosOtro) {
    parts.push(r.beneficiosOtro);
  }
  if (r.beneficiosAdicionalesTexto) {
    parts.push(r.beneficiosAdicionalesTexto);
  }
  if (r.beneficios_no_declarados?.length) {
    parts.push(...r.beneficios_no_declarados);
  }

  // Health coverage
  if (r.beneficio_salud_tipo) {
    const map: Record<string, string> = isEN
      ? { individual: "Individual health coverage", familiar: "Family health coverage", publica: "Public coverage only", no_tengo: "No health coverage", no_se: "Don't know health coverage" }
      : { individual: "Cobertura médica individual", familiar: "Cobertura médica familiar", publica: "Solo cobertura pública", no_tengo: "Sin cobertura médica", no_se: "No sé cobertura médica" };
    let h = map[r.beneficio_salud_tipo] ?? r.beneficio_salud_tipo;
    if (r.beneficio_salud_monto != null) {
      h += ` — ${t("monto mensual", "monthly amount")}: ${r.beneficio_salud_monto}`;
    }
    if (r.beneficio_salud_prestadora) {
      h += ` (${r.beneficio_salud_prestadora})`;
    }
    parts.push(h);
  }

  // Bonus
  if (r.bono_tipo) {
    const map: Record<string, string> = isEN
      ? { con_monto: "Annual bonus (known amount)", sin_monto: "Annual bonus (amount unknown)", no_tengo: "No annual bonus" }
      : { con_monto: "Bono anual (con monto)", sin_monto: "Bono anual (sin monto)", no_tengo: "Sin bono anual" };
    let b = map[r.bono_tipo] ?? r.bono_tipo;
    if (r.bono_monto != null) {
      b += ` — ${t("monto", "amount")}: ${r.bono_monto}`;
    }
    if (r.bonoFrecuencia) {
      b += ` — ${t("frecuencia", "frequency")}: ${r.bonoFrecuencia}`;
    }
    parts.push(b);
  }

  // Equity
  if (r.equity) {
    parts.push(r.equity === "si" ? t("Equity / RSUs / Stock options", "Equity / RSUs / Stock options") : t("Sin equity", "No equity"));
  }

  // Commissions
  if (r.comisiones_tipo) {
    const map: Record<string, string> = isEN
      ? { con_monto: "Commissions (known amount)", sin_monto: "Commissions (amount unknown)", no_tengo: "No commissions" }
      : { con_monto: "Comisiones (con monto)", sin_monto: "Comisiones (sin monto)", no_tengo: "Sin comisiones" };
    let c = map[r.comisiones_tipo] ?? r.comisiones_tipo;
    if (r.comisiones_monto != null) {
      c += ` — ${t("monto", "amount")}: ${r.comisiones_monto}`;
    }
    parts.push(c);
  }

  // Meal / food benefit
  if (r.beneficio_alimentacion_tipo) {
    const map: Record<string, string> = isEN
      ? { con_monto: "Meal allowance (known amount)", sin_monto: "Meal allowance (amount unknown)", no_tengo: "No meal allowance" }
      : { con_monto: "Ticket alimentario (con monto)", sin_monto: "Ticket alimentario (sin monto)", no_tengo: "Sin ticket alimentario" };
    let a = map[r.beneficio_alimentacion_tipo] ?? r.beneficio_alimentacion_tipo;
    if (r.beneficio_alimentacion_monto != null) {
      a += ` — ${t("monto", "amount")}: ${r.beneficio_alimentacion_monto}`;
    }
    parts.push(a);
  }

  // Corporate car
  if (r.auto_corporativo) {
    parts.push(r.auto_corporativo === "si" ? t("Auto corporativo", "Company car") : t("Sin auto corporativo", "No company car"));
  }

  // Phone
  if (r.beneficio_celular) {
    parts.push(r.beneficio_celular === "si" ? t("Celular corporativo", "Company phone") : t("Sin celular corporativo", "No company phone"));
  }

  // Mobility
  if (r.beneficio_movilidad_tipo) {
    const map: Record<string, string> = isEN
      ? { con_monto: "Mobility allowance (known amount)", sin_monto: "Mobility allowance (amount unknown)", no_tengo: "No mobility allowance" }
      : { con_monto: "Movilidad (con monto)", sin_monto: "Movilidad (sin monto)", no_tengo: "Sin movilidad" };
    let m = map[r.beneficio_movilidad_tipo] ?? r.beneficio_movilidad_tipo;
    if (r.beneficio_movilidad_monto != null) {
      m += ` — ${t("monto", "amount")}: ${r.beneficio_movilidad_monto}`;
    }
    parts.push(m);
  }

  // Life insurance
  if (r.beneficio_seguro_vida) {
    parts.push(r.beneficio_seguro_vida === "si" ? t("Seguro de vida", "Life insurance") : t("Sin seguro de vida", "No life insurance"));
  }

  // Retirement
  if (r.beneficio_retiro) {
    parts.push(r.beneficio_retiro === "si" ? t("Plan de retiro", "Retirement plan") : t("Sin plan de retiro", "No retirement plan"));
  }

  // 401k / match
  if (r.beneficio_401k_match) {
    let k = r.beneficio_401k_match === "si" ? t("401(k) match", "401(k) match") : t("Sin 401(k) match", "No 401(k) match");
    if (r.beneficio_401k_porcentaje) {
      k += ` — ${t("porcentaje", "percentage")}: ${r.beneficio_401k_porcentaje}`;
    }
    parts.push(k);
  }

  // Work modality
  if (r.modalidad_trabajo) {
    let w = isEN ? `Work mode: ${r.modalidad_trabajo}` : `Modalidad: ${r.modalidad_trabajo}`;
    if (r.modalidad_dias_presenciales) {
      w += ` — ${t("días presenciales", "in-office days")}: ${r.modalidad_dias_presenciales}`;
    }
    parts.push(w);
  }

  // Extra vacation
  if (r.beneficio_vacaciones_adicionales && r.beneficio_vacaciones_adicionales !== "no") {
    parts.push(isEN ? `Extra vacation: ${r.beneficio_vacaciones_adicionales}` : `Vacaciones adicionales: ${r.beneficio_vacaciones_adicionales}`);
  }

  // Training
  if (r.beneficio_capacitacion) {
    parts.push(r.beneficio_capacitacion === "si" ? t("Capacitación / desarrollo", "Training / development") : t("Sin capacitación", "No training"));
  }

  return parts.join(" · ");
}

export const Route = createFileRoute("/diagnostico/perfil")({
  head: () => ({ meta: [{ title: "Confirmá tu perfil — PayRank" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const { state, setState } = useDiagnostico();
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

  const paisRaw = r.pais === "Otro" ? r.paisOtro : r.pais;
  const pais = isEN && paisRaw && r.pais !== "Otro" ? (PAISES_EN[paisRaw] ?? paisRaw) : paisRaw;
  const industriaRaw = r.industria === "Otra" ? r.industriaOtra : r.industria;
  const industria = isEN && industriaRaw && r.industria !== "Otra" ? (INDUSTRIAS_EN[industriaRaw] ?? industriaRaw) : industriaRaw;
  const nivelDisplay = isEN && r.nivel ? (NIVELES_EN[r.nivel] ?? r.nivel) : r.nivel;
  const funciones = [...(r.funciones ?? [])];
  if (funciones.includes("Otra") && r.funcionesOtra) {
    const idx = funciones.indexOf("Otra");
    funciones[idx] = `${isEN ? "Other" : "Otra"}: ${r.funcionesOtra}`;
  }

  const situacionLabel = isEN
    ? (r.situacion === "empleado" ? "Employed" : r.situacion === "busqueda" ? "Active job search" : r.situacion === "freelance" ? "Freelance / independent consultant" : r.situacion === "contractor" ? "Contractor" : dash)
    : (r.situacion === "empleado" ? "Empleado/a" : r.situacion === "busqueda" ? "En búsqueda activa" : r.situacion === "freelance" ? "Freelance / consultor/a" : r.situacion === "contractor" ? "Contractor" : dash);
  const salarioStr = r.salario && r.moneda
    ? `${r.moneda} ${r.salario.toLocaleString("es-AR")}${r.brutoNeto ? ` (${r.brutoNeto})` : ""}`
    : (r.salarioAnterior && r.monedaAnterior
      ? `${r.monedaAnterior} ${r.salarioAnterior.toLocaleString("es-AR")} (${isEN ? "last job" : "último trabajo"})`
      : dash);

  const beneficiosStr = buildBeneficiosStr(r, isEN);

  // Handlers de validación de perfil editable
  const updateRespuesta = <K extends keyof typeof r>(key: K, value: (typeof r)[K]) => {
    setState((s) => ({ ...s, respuestas: { ...s.respuestas, [key]: value } }));
  };
  const rolActual = r.tituloElegido || (r.funciones && r.funciones[0]) || "";
  const updateRol = (val: string) => {
    if (val === "__otro__") {
      setState((s) => ({ ...s, respuestas: { ...s.respuestas, tituloElegido: "" } }));
    } else {
      setState((s) => {
        const fns = [...(s.respuestas.funciones ?? [])];
        if (fns.length === 0) fns.push(val);
        else fns[0] = val;
        return { ...s, respuestas: { ...s.respuestas, funciones: fns, tituloElegido: val } };
      });
    }
  };

  return (
    <DiagnosticoShell step={4} progress={80}>
      <StepFade k="perfil">
        <p className="font-ui text-[10px] text-hueso/45 mb-3">{isEN ? "PROFILE CONFIRMATION" : "CONFIRMACIÓN DE PERFIL"}</p>
        <h1 className="font-display text-3xl md:text-4xl mb-3 text-hueso leading-tight">
          {isEN
            ? <>This is what we <span className="font-display-italic">understood</span> about your profile. Confirm or correct before generating your PayRank.</>
            : <>Esto es lo que <span className="font-display-italic">entendimos</span> de tu perfil. Confirmá o corregí antes de generar tu PayRank.</>}
        </h1>
        <p className="font-body text-hueso/60 mb-10">
          {isEN
            ? "If you change any of these fields, the updated values are used to generate your report."
            : "Si cambiás alguno de estos campos, los valores actualizados se usan para generar tu reporte."}
        </p>

        {/* Sección editable de validación de perfil */}
        <section className="border border-hueso/20 p-5 md:p-6 bg-hueso/[0.04] mb-8">
          <p className="font-ui text-[10px] text-hueso/55 mb-5 uppercase tracking-wider">
            {isEN ? "Profile core (editable)" : "Núcleo de perfil (editable)"}
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <EditField label={isEN ? "Main role / function" : "Rol / función principal"}>
              <select
                value={FUNCIONES.includes(rolActual) ? rolActual : (rolActual ? "__otro__" : "")}
                onChange={(e) => updateRol(e.target.value)}
                className="w-full bg-tinta border border-hueso/30 focus:border-hueso outline-none font-body text-base text-hueso py-2.5 px-3"
              >
                <option value="" disabled>{isEN ? "Select…" : "Seleccionar…"}</option>
                {FUNCIONES.map((f) => <option key={f} value={f}>{f}</option>)}
                <option value="__otro__">{isEN ? "Other (specify)" : "Otra (especificar)"}</option>
              </select>
              {(!FUNCIONES.includes(rolActual) || r.tituloElegido === "") && (
                <input
                  type="text"
                  placeholder={isEN ? "Describe your role" : "Describí tu rol"}
                  value={r.tituloElegido && !FUNCIONES.includes(r.tituloElegido) ? r.tituloElegido : ""}
                  onChange={(e) => updateRespuesta("tituloElegido", e.target.value)}
                  className="w-full mt-2 bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-base text-hueso py-2"
                />
              )}
            </EditField>

            <EditField label={isEN ? "Industry / sector" : "Industria / sector"}>
              <select
                value={r.industria ?? ""}
                onChange={(e) => updateRespuesta("industria", e.target.value)}
                className="w-full bg-tinta border border-hueso/30 focus:border-hueso outline-none font-body text-base text-hueso py-2.5 px-3"
              >
                <option value="" disabled>{isEN ? "Select…" : "Seleccionar…"}</option>
                {INDUSTRIAS.map((i) => <option key={i} value={i}>{labelOf(i, INDUSTRIAS_EN, isEN)}</option>)}
              </select>
            </EditField>

            <EditField label={isEN ? "Seniority level" : "Nivel de seniority"}>
              <select
                value={r.nivel ?? ""}
                onChange={(e) => updateRespuesta("nivel", e.target.value)}
                className="w-full bg-tinta border border-hueso/30 focus:border-hueso outline-none font-body text-base text-hueso py-2.5 px-3"
              >
                <option value="" disabled>{isEN ? "Select…" : "Seleccionar…"}</option>
                {NIVELES.map((n) => <option key={n} value={n}>{labelOf(n, NIVELES_EN, isEN)}</option>)}
              </select>
            </EditField>

            <EditField label={isEN ? "Company type" : "Tipo de empresa"}>
              <select
                value={r.tipoEmpresa ?? ""}
                onChange={(e) => updateRespuesta("tipoEmpresa", e.target.value)}
                className="w-full bg-tinta border border-hueso/30 focus:border-hueso outline-none font-body text-base text-hueso py-2.5 px-3"
              >
                <option value="" disabled>{isEN ? "Select…" : "Seleccionar…"}</option>
                {TIPOS_EMPRESA.map((t) => <option key={t} value={t}>{labelOf(t, TIPOS_EMPRESA_EN, isEN)}</option>)}
              </select>
            </EditField>
          </div>
        </section>


        <div className="space-y-5">
          <Bloque
            titulo={isEN ? "Block 1 · Your situation" : "Bloque 1 · Tu situación"}
            items={[
              { k: isEN ? "Selected mode" : "Modo elegido", v: isEN ? TITULOS_MODO_EN[state.modo] : TITULOS_MODO[state.modo] },
              { k: isEN ? "Country" : "País", v: pais },
              { k: isEN ? "Industry" : "Industria", v: industria },
              { k: isEN ? "Company type" : "Tipo de empresa", v: labelOf(r.tipoEmpresa, TIPOS_EMPRESA_EN, isEN) },
              { k: isEN ? "Employment situation" : "Situación laboral", v: situacionLabel },
            ]}
          />
          <Bloque
            titulo={isEN ? "Block 2 · Your role" : "Bloque 2 · Tu rol"}
            items={[
              { k: isEN ? "Level" : "Nivel jerárquico", v: nivelDisplay },
              { k: isEN ? "Scope" : "Alcance", v: r.alcance },
              { k: isEN ? "Main functions" : "Funciones principales", v: funciones.join(" · ") || (r.funcionesTexto ? (isEN ? "(free description)" : "(descripción libre)") : "") },
              { k: isEN ? "Direct reports" : "Personas a cargo", v: r.personasACargo },
              { k: isEN ? "Interaction with senior management" : "Interacción con dirección", v: r.interaccion },
            ]}
          />
          <Bloque
            titulo={isEN ? "Block 3 · Your profile" : "Bloque 3 · Tu perfil"}
            items={[
              { k: isEN ? "Total experience" : "Experiencia total", v: r.experienciaTotalAnios != null ? `${r.experienciaTotalAnios} ${isEN ? "years" : "años"}` : r.expTotal },
              { k: isEN ? "Industry experience" : "Experiencia en industria", v: r.experienciaIndustriaAnios != null ? `${r.experienciaIndustriaAnios} ${isEN ? "years" : "años"}` : r.expIndustria },
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
              { k: isEN ? "Benefits" : "Beneficios", v: beneficiosStr },
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
                ? <>Confirm and generate my PayRank <span aria-hidden>→</span></>
                : <>Confirmar y generar mi PayRank <span aria-hidden>→</span></>}
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

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-ui text-[10px] text-hueso/55 mb-2 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

