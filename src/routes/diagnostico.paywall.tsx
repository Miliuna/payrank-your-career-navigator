import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useDiagnostico, setPlan } from "@/lib/diagnostico/store";
import { confirmBetaAccess, simulatePayment } from "@/lib/diagnostico/diagnostico.functions";
import type { Plan } from "@/lib/diagnostico/types";

const searchSchema = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/diagnostico/paywall")({
  head: () => ({ meta: [{ title: "Tu PayRank — Paywall" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: PaywallPage,
});

const PLAN_INFO: Record<Plan, { nombre: string; precio: string; sufijo?: string }> = {
  unico: { nombre: "GO", precio: "USD 29" },
  pack3: { nombre: "PLUS", precio: "USD 69" },
  anual: { nombre: "PRO", precio: "USD 99", sufijo: "/año" },
};

const BENEFICIOS = [
  "Tu posición exacta en el mercado",
  "Compensación total valorizada",
  "Detectamos si tu título subestima tu alcance real",
  "Análisis de brecha de género (si lo solicitaste)",
  "Cuánto pedir y cómo fundamentarlo",
  "Script exacto para tu conversación",
  "Habilidades que aumentan tu valor",
  "Hoja de ruta al siguiente nivel",
];

function PaywallPage() {
  const { id } = Route.useSearch();
  const { state } = useDiagnostico();
  const navigate = useNavigate();
  const confirmBeta = useServerFn(confirmBetaAccess);
  const simulate = useServerFn(simulatePayment);

  const [betaToken, setBetaToken] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [referido, setReferido] = React.useState("");
  const [referidoEstado, setReferidoEstado] = React.useState<"idle" | "ok" | "invalid">("idle");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setBetaToken(window.localStorage.getItem("payrank.betaToken"));
    }
  }, []);

  const plan = PLAN_INFO[state.plan] ?? PLAN_INFO.unico;
  const isDev = import.meta.env.DEV;

  const onBetaConfirm = async () => {
    if (!betaToken) return;
    setBusy(true);
    setErr(null);
    try {
      await confirmBeta({ data: { id, token: betaToken } });
      navigate({ to: "/diagnostico/procesando", search: { id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
      setBusy(false);
    }
  };

  const onSimulate = async () => {
    setBusy(true);
    setErr(null);
    try {
      await simulate({ data: { id } });
      navigate({ to: "/diagnostico/procesando", search: { id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error desconocido");
      setBusy(false);
    }
  };

  const aplicarReferido = () => {
    setReferidoEstado(referido.trim().length >= 4 ? "ok" : "invalid");
  };

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="fixed top-0 inset-x-0 z-50 bg-hueso">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-tinta text-xl">PayRank</Link>
          <span className="font-ui text-[10px] text-piedra">Paso 6 de 8</span>
        </div>
        <div className="h-[2px] bg-tinta/10 w-full">
          <div className="h-full bg-tinta transition-all duration-500" style={{ width: "92%" }} />
        </div>
      </header>

      <main className="pt-28 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-[480px]">
          <div className="bg-tinta text-hueso p-8 md:p-10">
            <h1 className="font-display text-2xl md:text-3xl text-hueso mb-3 leading-tight">
              Tu PayRank está listo para <span className="font-display-italic">generar</span>
            </h1>

            <div className="mt-6 mb-2 flex items-baseline gap-2">
              <span className="font-ui text-[10px] text-hueso/60">{plan.nombre}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-5xl md:text-6xl text-hueso">{plan.precio}</span>
              {plan.sufijo && <span className="font-body text-sm text-hueso/70">{plan.sufijo}</span>}
            </div>

            <p className="font-ui text-[10px] text-hueso/60 mb-5">RESULTADO INMEDIATO · REPORTE POR MAIL</p>

            <ul className="space-y-3 mb-8">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-start gap-3 font-body text-sm text-hueso/85">
                  <span aria-hidden style={{ color: "#2E4A6E" }} className="mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {betaToken ? (
              <div className="border border-real/70 p-5 mb-6" style={{ borderColor: "#2E4A6E" }}>
                <p className="font-body text-sm text-hueso/90 leading-relaxed">
                  Estás usando un acceso beta gratuito. Tu PayRank se generará sin costo.
                </p>
                <button
                  type="button"
                  onClick={onBetaConfirm}
                  disabled={busy}
                  className="mt-4 w-full inline-flex items-center justify-between bg-hueso text-tinta px-5 py-3 font-ui text-[11px] hover:bg-hueso/90 disabled:opacity-50 transition-colors"
                >
                  {busy ? "GENERANDO…" : "GENERAR MI PAYRANK"}
                  <span aria-hidden>→</span>
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="font-ui text-[10px] text-hueso/55 block mb-2">
                    ¿TENÉS UN CÓDIGO DE REFERIDO?
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={referido}
                      onChange={(e) => { setReferido(e.target.value); setReferidoEstado("idle"); }}
                      placeholder="Tu código"
                      className="flex-1 bg-hueso/5 border border-hueso/20 px-3 py-2 font-body text-sm text-hueso placeholder:text-hueso/40 focus:outline-none focus:border-hueso/60"
                    />
                    <button
                      type="button"
                      onClick={aplicarReferido}
                      className="px-4 py-2 border border-hueso/30 font-ui text-[10px] text-hueso hover:bg-hueso hover:text-tinta transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                  {referidoEstado === "ok" && (
                    <p className="mt-2 font-body text-xs" style={{ color: "#2E4A6E" }}>
                      15% de descuento aplicado ✓
                    </p>
                  )}
                  {referidoEstado === "invalid" && (
                    <p className="mt-2 font-body text-xs text-hueso/55">
                      Código no válido.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-between bg-hueso/15 text-hueso/60 px-5 py-3 font-ui text-[11px] cursor-not-allowed"
                >
                  PAGAR Y VER MI PAYRANK · {plan.precio}
                  <span aria-hidden>→</span>
                </button>
                <p className="mt-3 font-body text-xs text-hueso/55 text-center">
                  Pagos disponibles próximamente. Usá un código de acceso beta para generar tu PayRank.
                </p>
                <p className="mt-2 font-body text-xs text-hueso/40 text-center">
                  Pago seguro. Podés pagar con cualquier tarjeta internacional.
                </p>
              </>
            )}

            {err && <p className="mt-4 font-body text-xs text-red-300/90">{err}</p>}
          </div>

          {isDev && (
            <div className="mt-6 border border-dashed border-tinta/30 p-5">
              <p className="font-ui text-[10px] text-piedra mb-2">MODO DESARROLLO</p>
              <p className="font-body text-sm text-piedra mb-3">
                Saltá el paywall y generá el PayRank ahora.
              </p>
              <button
                type="button"
                onClick={onSimulate}
                disabled={busy}
                className="inline-flex items-center justify-center bg-tinta text-hueso px-5 py-3 font-ui text-[11px] hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {busy ? "Generando…" : "Simular pago y generar PayRank"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
