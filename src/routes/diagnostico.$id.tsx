import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDiagnostico } from "@/lib/diagnostico/diagnostico.functions";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/diagnostico/$id")({
  head: () => ({ meta: [{ title: "Tu PayRank — PayRank" }] }),
  component: ResultadoPage,
});

type Rango = { min?: number; max?: number; moneda?: string };

function fmtRango(r: Rango | undefined): string {
  if (!r || r.min == null || r.max == null) return "—";
  const moneda = r.moneda ?? "USD";
  return `${moneda} ${r.min.toLocaleString("en-US")} – ${r.max.toLocaleString("en-US")}`;
}

function ResultadoPage() {
  const { id } = Route.useParams();
  const fetchFn = useServerFn(getDiagnostico);
  const { data, isLoading, error } = useQuery({
    queryKey: ["diagnostico", id],
    queryFn: () => fetchFn({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tinta text-hueso flex items-center justify-center">
        <p className="font-body text-hueso/60">Cargando tu PayRank…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-tinta text-hueso flex items-center justify-center px-6">
        <p className="font-body text-hueso/70 text-center">
          No encontramos este PayRank.
        </p>
      </div>
    );
  }

  const row = data as Record<string, unknown>;
  const resultado = (row.resultado_json as Record<string, unknown>) ?? {};
  const rangoActual = resultado.rango_actual as Rango | undefined;
  const rangoMercado = resultado.rango_mercado as Rango | undefined;
  const posicionamiento = resultado.posicionamiento as string | undefined;
  const nivelConfianza = (resultado.nivel_confianza as string) ?? (row.nivel_confianza as string);
  const justifConfianza = resultado.justificacion_confianza as string | undefined;
  const positivos = (resultado.factores_positivos as string[]) ?? [];
  const negativos = (resultado.factores_negativos as string[]) ?? [];
  const recomendaciones = (resultado.recomendaciones as string[]) ?? [];
  const resumen = resultado.resumen_ejecutivo as string | undefined;

  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <header className="border-b border-hueso/10">
        <div className="mx-auto max-w-4xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Logo />
          <span className="font-ui text-[10px] text-hueso/50">PayRank · resultado</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 md:px-8 py-12 md:py-20 space-y-16">
        <section>
          <p className="font-ui text-[10px] text-hueso/45 mb-3">TU PAYRANK</p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight mb-6">
            Tu rango de mercado
          </h1>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="border border-hueso/15 p-6">
              <p className="font-ui text-[10px] text-hueso/50 mb-2">SALARIO ACTUAL</p>
              <p className="font-display text-2xl">{fmtRango(rangoActual)}</p>
            </div>
            <div className="border border-hueso/15 p-6">
              <p className="font-ui text-[10px] text-hueso/50 mb-2">RANGO DE MERCADO</p>
              <p className="font-display text-2xl">{fmtRango(rangoMercado)}</p>
            </div>
          </div>
          {posicionamiento && (
            <p className="mt-6 font-body text-hueso/75">
              Posicionamiento: <span className="text-hueso">{posicionamiento}</span>
            </p>
          )}
        </section>

        {nivelConfianza && (
          <section className="border border-hueso/15 p-6">
            <p className="font-ui text-[10px] text-hueso/50 mb-2">NIVEL DE CONFIANZA</p>
            <p className="font-display text-2xl mb-2">{nivelConfianza}</p>
            {justifConfianza && (
              <p className="font-body text-hueso/70 text-sm leading-relaxed">{justifConfianza}</p>
            )}
          </section>
        )}

        {resumen && (
          <section>
            <p className="font-ui text-[10px] text-hueso/45 mb-3">RESUMEN EJECUTIVO</p>
            <p className="font-body text-hueso/85 text-lg leading-relaxed whitespace-pre-wrap">{resumen}</p>
          </section>
        )}

        {positivos.length > 0 && (
          <section>
            <p className="font-ui text-[10px] text-hueso/45 mb-3">FACTORES A FAVOR</p>
            <ul className="space-y-2">
              {positivos.map((f, i) => (
                <li key={i} className="font-body text-hueso/80">— {f}</li>
              ))}
            </ul>
          </section>
        )}

        {negativos.length > 0 && (
          <section>
            <p className="font-ui text-[10px] text-hueso/45 mb-3">FACTORES EN CONTRA</p>
            <ul className="space-y-2">
              {negativos.map((f, i) => (
                <li key={i} className="font-body text-hueso/80">— {f}</li>
              ))}
            </ul>
          </section>
        )}

        {recomendaciones.length > 0 && (
          <section>
            <p className="font-ui text-[10px] text-hueso/45 mb-3">RECOMENDACIONES</p>
            <ul className="space-y-2">
              {recomendaciones.map((r, i) => (
                <li key={i} className="font-body text-hueso/80">— {r}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="pt-12 border-t border-hueso/10 text-xs text-hueso/40 font-body">
          PayRank LLC · 30 N Gould St, STE R, Sheridan, Wyoming 82801, USA · hello@payrank.co
        </section>
      </main>
    </div>
  );
}
