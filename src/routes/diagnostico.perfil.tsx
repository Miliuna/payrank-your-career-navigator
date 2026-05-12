import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DiagnosticoShell, StepFade } from "@/components/diagnostico/Shell";
import { useDiagnostico } from "@/lib/diagnostico/store";
import { TITULOS_MODO } from "@/lib/diagnostico/data";

export const Route = createFileRoute("/diagnostico/perfil")({
  head: () => ({ meta: [{ title: "Confirmá tu perfil — PayRank" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const { state } = useDiagnostico();
  const r = state.respuestas;

  const back = () => navigate({ to: "/diagnostico/inferencia" });
  const next = () => {
    // PR2 mounts the legal/payment/processing flow on these routes.
    // For now, point users at the inference page so they don't dead-end.
    alert("Próximo paso: consentimientos legales y pago. Se habilita en la próxima entrega.");
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

  const situacionLabel = r.situacion === "empleado" ? "Empleado/a" : r.situacion === "busqueda" ? "En búsqueda activa" : r.situacion === "freelance" ? "Freelance / consultor/a" : dash;
  const salarioStr = r.salario && r.moneda ? `${r.moneda} ${r.salario.toLocaleString("es-AR")}${r.brutoNeto ? ` (${r.brutoNeto})` : ""}` : (r.salarioAnterior && r.monedaAnterior ? `${r.monedaAnterior} ${r.salarioAnterior.toLocaleString("es-AR")} (último trabajo)` : dash);

  return (
    <DiagnosticoShell step={4} progress={80}>
      <StepFade k="perfil">
        <p className="font-ui text-[10px] text-hueso/45 mb-3">VALIDACIÓN FINAL</p>
        <h1 className="font-display text-3xl md:text-4xl mb-3 text-hueso leading-tight">
          Antes de continuar, <span className="font-display-italic">confirmá</span> tu perfil completo
        </h1>
        <p className="font-body text-hueso/60 mb-10">
          Revisá los datos. Si algo no es correcto, podés volver y corregirlo.
        </p>

        <div className="space-y-5">
          <Bloque
            titulo="Bloque 1 · Tu situación"
            items={[
              { k: "Modo elegido", v: TITULOS_MODO[state.modo] },
              { k: "País", v: pais },
              { k: "Industria", v: industria },
              { k: "Tipo de empresa", v: r.tipoEmpresa },
              { k: "Situación laboral", v: situacionLabel },
            ]}
          />
          <Bloque
            titulo="Bloque 2 · Tu rol"
            items={[
              { k: "Nivel jerárquico", v: r.nivel },
              { k: "Alcance", v: r.alcance },
              { k: "Funciones principales", v: funciones.join(" · ") || (r.funcionesTexto ? "(descripción libre)" : "") },
              { k: "Personas a cargo", v: r.personasACargo },
              { k: "Interacción con dirección", v: r.interaccion },
            ]}
          />
          <Bloque
            titulo="Bloque 3 · Tu perfil"
            items={[
              { k: "Experiencia total", v: r.expTotal },
              { k: "Experiencia en industria", v: r.expIndustria },
              { k: "Formación", v: (r.formacion ?? []).join(" · ") },
              { k: "Certificaciones", v: r.sinCertificaciones ? "Ninguna" : (r.certificaciones ?? []).join(" · ") },
              { k: "Idiomas", v: r.sinIdiomas ? "Solo español" : (r.idiomas ?? []).map((i) => `${i.idioma} (${i.nivel}${i.certificacion ? `, ${i.certificacion}` : ""})`).join(" · ") },
              { k: "Herramientas de IA", v: (r.herramientasIA ?? []).join(" · ") + (r.frecuenciaIA ? ` — ${r.frecuenciaIA}` : "") },
            ]}
          />
          <Bloque
            titulo="Bloque 4 · Tu compensación actual"
            items={[
              { k: "Situación laboral", v: situacionLabel },
              { k: "Salario", v: salarioStr },
              { k: "Beneficios", v: (r.beneficios ?? []).join(" · ") },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center justify-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 transition-colors"
          >
            Sí, es correcto — continuá <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center justify-center font-ui text-[11px] text-hueso/70 px-6 py-3 border border-hueso/30 hover:border-hueso transition-colors"
          >
            Quiero corregir algo
          </button>
        </div>
      </StepFade>
    </DiagnosticoShell>
  );
}
