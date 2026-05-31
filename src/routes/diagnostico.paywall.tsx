import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useDiagnostico, setPlan } from "@/lib/diagnostico/store";
import { simulatePayment, applyAccessCode, createCheckoutSession } from "@/lib/diagnostico/diagnostico.functions";
import { useLang } from "@/lib/lang";
import type { Plan } from "@/lib/diagnostico/types";
import { PRICING, useRegion } from "@/lib/pricing";

const searchSchema = z.object({ id: z.string().uuid() });


export const Route = createFileRoute("/diagnostico/paywall")({
  head: () => ({ meta: [{ title: "Tu PayRank — Paywall" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: PaywallPage,
});

const PLAN_INFO: Record<Plan, { nombre: string; precio: string; sufijo?: string }> = {
  unico: { nombre: "GO", precio: "USD 29" },
  pack3: { nombre: "PLUS", precio: "USD 69" },
  anual: { nombre: "PRO", precio: "USD 149", sufijo: "/año" },
};

function getProPrice(pais?: string, paisOtro?: string): { precio: string; sufijo?: string } {
  const highPriceCountries = ["estados unidos", "usa", "united states", "reino unido", "united kingdom", "uk", "gran bretaña", "great britain", "australia", "canadá", "canada"];
  const raw = pais === "Otro" ? paisOtro : pais;
  const normalized = (raw || "").toLowerCase().trim();
  if (highPriceCountries.some((c) => normalized.includes(c))) {
    return { precio: "USD 199", sufijo: "/año" };
  }
  return { precio: "USD 149", sufijo: "/año" };
}

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

const BENEFICIOS_EN = [
  "Your exact position in the market",
  "Total compensation valued",
  "We detect if your title underestimates your real scope",
  "Gender gap analysis (if requested)",
  "How much to ask for and how to justify it",
  "Exact script for your conversation",
  "Skills that increase your value",
  "Roadmap to the next level",
];

function PaywallPage() {
  const { id } = Route.useSearch();
  const { state, setState } = useDiagnostico();
  const navigate = useNavigate();
  const simulate = useServerFn(simulatePayment);
  const applyCode = useServerFn(applyAccessCode);
  const checkout = useServerFn(createCheckoutSession);
  const { region } = useRegion();

  const { lang } = useLang();
  const isEN = lang === "EN";
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [referido, setReferido] = React.useState("");
  const [referidoEstado, setReferidoEstado] = React.useState<"idle" | "ok" | "invalid">("idle");
  const [codigoAcceso, setCodigoAcceso] = React.useState("");
  const [codigoEstado, setCodigoEstado] = React.useState<"idle" | "ok" | "invalid">("idle");
  const [codigoBusy, setCodigoBusy] = React.useState(false);



  const basePlan = PLAN_INFO[state.plan] ?? PLAN_INFO.unico;
  const proPrice = state.plan === "anual" ? getProPrice(state.respuestas?.pais, state.respuestas?.paisOtro) : null;
  const plan = proPrice ? { ...basePlan, ...proPrice } : basePlan;
  const isDev = import.meta.env.DEV;

  const onPrimaryClick = async () => {
    setErr(null);
    setBusy(true);
    try {
      const selected = state.plan;
      const priceId = PRICING[region][selected].stripePriceId;
      const planName = PLAN_INFO[selected].nombre;
      const { url } = await checkout({
        data: { id, plan: selected, priceId, planName, origin: window.location.origin },
      });
      window.location.href = url;
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

  const aplicarCodigoAcceso = async () => {
    const codigo = codigoAcceso.trim();
    if (!codigo) {
      setCodigoEstado("invalid");
      return;
    }
    setCodigoBusy(true);
    setErr(null);
    try {
      await applyCode({ data: { id, codigo } });
      setCodigoEstado("ok");
      // Bypass payment: jump straight to processing
      await navigate({ to: "/diagnostico/procesando", search: { id } });
    } catch (e) {
      setCodigoEstado("invalid");
      // Don't surface the raw error; the inline message handles UX
      console.warn("[applyAccessCode] rejected:", e);
    } finally {
      setCodigoBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="fixed top-0 inset-x-0 z-50 bg-hueso">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-tinta text-xl">PayRank</Link>
          <span className="font-ui text-[10px] text-piedra">{isEN ? "Step 6 of 8" : "Paso 6 de 8"}</span>
        </div>
        <div className="h-[2px] bg-tinta/10 w-full">
          <div className="h-full bg-tinta transition-all duration-500" style={{ width: "92%" }} />
        </div>
      </header>

      <main className="pt-28 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-[480px]">
          <div className="bg-tinta text-hueso p-8 md:p-10">
            <h1 className="font-display text-2xl md:text-3xl text-hueso mb-3 leading-tight">
              {isEN
                ? <>Your PayRank is ready to <span className="font-display-italic">generate</span></>
                : <>Tu PayRank está listo para <span className="font-display-italic">generar</span></>}
            </h1>

            <div className="mt-6 mb-3">
              <p className="font-ui text-[10px] text-hueso/55 mb-2">{isEN ? "CHOOSE YOUR PLAN" : "ELEGÍ TU PLAN"}</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PLAN_INFO) as Plan[]).map((p) => {
                  const active = state.plan === p;
                  const btnPrecio = isEN
                    ? (p === "unico" ? "USD 39" : p === "pack3" ? "USD 99" : "USD 199")
                    : PLAN_INFO[p].precio;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(setState, p)}
                      className={`px-2 py-2 border text-left transition-colors ${
                        active
                          ? "bg-hueso text-tinta border-hueso"
                          : "border-hueso/25 text-hueso hover:border-hueso/60"
                      }`}
                    >
                      <div className="font-ui text-[9px] opacity-70">{PLAN_INFO[p].nombre}</div>
                      <div className="font-display text-base leading-tight">{btnPrecio}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-5xl md:text-6xl text-hueso">{plan.precio}</span>
              {plan.sufijo && <span className="font-body text-sm text-hueso/70">{isEN && plan.sufijo === "/año" ? "/year" : plan.sufijo}</span>}
            </div>

            <p className="font-ui text-[10px] text-hueso/60 mb-5">{isEN ? "INSTANT RESULT · REPORT BY EMAIL" : "RESULTADO INMEDIATO · REPORTE POR MAIL"}</p>

            <ul className="space-y-3 mb-8">
              {(isEN ? BENEFICIOS_EN : BENEFICIOS).map((b) => (
                <li key={b} className="flex items-start gap-3 font-body text-sm text-hueso/85">
                  <span aria-hidden style={{ color: "#2E4A6E" }} className="mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mb-6">
              <label className="font-ui text-[10px] text-hueso/55 block mb-2">
                {isEN ? "DO YOU HAVE A REFERRAL CODE?" : "¿TENÉS UN CÓDIGO DE REFERIDO?"}
              </label>
              <div className="flex gap-2">
                <input
                  value={referido}
                  onChange={(e) => { setReferido(e.target.value); setReferidoEstado("idle"); }}
                  placeholder={isEN ? "Your code" : "Tu código"}
                  className="flex-1 bg-hueso/5 border border-hueso/20 px-3 py-2 font-body text-sm text-hueso placeholder:text-hueso/40 focus:outline-none focus:border-hueso/60"
                />
                <button
                  type="button"
                  onClick={aplicarReferido}
                  className="px-4 py-2 border border-hueso/30 font-ui text-[10px] text-hueso hover:bg-hueso hover:text-tinta transition-colors"
                >
                  {isEN ? "Apply" : "Aplicar"}
                </button>
              </div>
              {referidoEstado === "ok" && (
                <p className="mt-2 font-body text-xs" style={{ color: "#2E4A6E" }}>
                  {isEN ? "15% discount applied ✓" : "15% de descuento aplicado ✓"}
                </p>
              )}
              {referidoEstado === "invalid" && (
                <p className="mt-2 font-body text-xs text-hueso/55">
                  {isEN ? "Invalid code." : "Código no válido."}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="font-ui text-[10px] text-hueso/55 block mb-2">
                {isEN ? "HAVE AN ACCESS CODE?" : "¿TENÉS UN CÓDIGO DE ACCESO?"}
              </label>
              <div className="flex gap-2">
                <input
                  value={codigoAcceso}
                  onChange={(e) => { setCodigoAcceso(e.target.value); setCodigoEstado("idle"); }}
                  placeholder={isEN ? "Access code" : "Código de acceso"}
                  className="flex-1 bg-hueso/5 border border-hueso/20 px-3 py-2 font-body text-sm text-hueso placeholder:text-hueso/40 focus:outline-none focus:border-hueso/60"
                />
                <button
                  type="button"
                  onClick={aplicarCodigoAcceso}
                  disabled={codigoBusy}
                  className="px-4 py-2 border border-hueso/30 font-ui text-[10px] text-hueso hover:bg-hueso hover:text-tinta transition-colors disabled:opacity-50"
                >
                  {codigoBusy ? (isEN ? "…" : "…") : (isEN ? "APPLY" : "APLICAR")}
                </button>
              </div>
              {codigoEstado === "ok" && (
                <p className="mt-2 font-body text-xs" style={{ color: "#2E4A6E" }}>
                  {isEN ? "Code applied · generating your PayRank…" : "Código aplicado · generando tu PayRank…"}
                </p>
              )}
              {codigoEstado === "invalid" && (
                <p className="mt-2 font-body text-xs text-hueso/55">
                  {isEN ? "Invalid code" : "Código no válido"}
                </p>
              )}
            </div>





            <button
              type="button"
              onClick={onPrimaryClick}
              disabled={busy}
              className="w-full inline-flex items-center justify-between bg-hueso text-tinta px-5 py-3 font-ui text-[11px] hover:bg-hueso/90 disabled:opacity-50 transition-colors"
            >
              {busy ? (isEN ? "GENERATING…" : "GENERANDO…") : (isEN ? "GET MY PAYRANK" : "OBTENER MI PAYRANK")}
              <span aria-hidden>→</span>
            </button>



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
