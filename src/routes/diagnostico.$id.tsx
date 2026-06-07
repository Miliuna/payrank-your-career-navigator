import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDiagnostico } from "@/lib/diagnostico/diagnostico.functions";
import { Logo } from "@/components/Logo";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import { ReportFooterActions } from "@/components/ReportFooterActions";

export const Route = createFileRoute("/diagnostico/$id")({
  head: () => ({ meta: [{ title: "Tu PayRank — PayRank" }] }),
  component: ResultadoPage,
});

// ---------- helpers ----------

type R = Record<string, unknown>;
const get = (o: unknown, k: string): unknown =>
  o && typeof o === "object" ? (o as R)[k] : undefined;
const str = (v: unknown, fb = "—"): string => {
  if (v === null || v === undefined || v === "") return fb;
  return typeof v === "string" ? v : String(v);
};
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const bool = (v: unknown): boolean => v === true;

// ---------- UI primitives ----------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow font-ui text-[10px] tracking-[0.18em] text-hueso/45 mb-3">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-3xl md:text-4xl text-hueso leading-tight">{children}</h2>;
}
function P({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`p-body font-body leading-relaxed text-justify ${muted ? "text-hueso/65" : "text-hueso/85"}`}>
      {children}
    </p>
  );
}
function Card({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`${dark ? "card-alert " : ""}border border-hueso/15 p-5 md:p-6 ${dark ? "bg-hueso/[0.04]" : ""}`}>
      {children}
    </div>
  );
}
function Section({ children }: { children: React.ReactNode }) {
  return <section className="space-y-5">{children}</section>;
}
function Divider() {
  return <div className="border-t border-hueso/10" />;
}
function Band({
  theme,
  children,
}: {
  theme: "dark" | "light" | "hueso";
  children: React.ReactNode;
}) {
  const bg =
    theme === "dark"
      ? "bg-[#0C0C0C]"
      : theme === "hueso"
        ? "bg-[#F5F2ED]"
        : "bg-white";
  const cls = theme === "dark" ? "theme-dark" : "theme-light";
  return (
    <section className={`${bg} ${cls}`}>
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-20 space-y-12">
        {children}
      </div>
    </section>
  );
}
const ThemeStyles = () => (
  <style>{`
    .theme-light { --hueso: oklch(0.15 0 0); --tinta: oklch(1 0 0); color: #0C0C0C; }
    .theme-light h2 { color: #1A2B45 !important; }
    .theme-light .eyebrow { color: #2E4A6E !important; }
    .theme-light .p-body { color: #0C0C0C !important; text-align: left; font-size: 1.0625rem; }
    .theme-light .card-alert { background: #F0EDE8 !important; border: 0 !important; border-left: 3px solid #2E4A6E !important; }
    .theme-light table { border-color: #E5E1DA; }
    .theme-light table thead tr { background: #1A2B45 !important; }
    .theme-light table thead th { color: #F5F2ED !important; }
    .theme-light table tbody tr { background: #FFFFFF; border-color: #E5E1DA !important; }
    .theme-light table tbody tr:nth-child(even) { background: #F7F4F0; }

    /* PDF export: force every band to light palette */
    body.pdf-export .theme-dark,
    body.pdf-export .bg-\\[\\#0C0C0C\\] { background: #FFFFFF !important; color: #0C0C0C !important; }
    body.pdf-export .theme-dark h2, body.pdf-export .theme-dark .font-display { color: #1A2B45 !important; }
    body.pdf-export .theme-dark .eyebrow { color: #2E4A6E !important; }
    body.pdf-export .theme-dark, body.pdf-export .theme-dark * { color: #0C0C0C !important; border-color: #E5E1DA !important; }
    body.pdf-export .theme-dark h2, body.pdf-export .theme-dark .font-display { color: #1A2B45 !important; }
    body.pdf-export .theme-dark .eyebrow { color: #2E4A6E !important; }
    body.pdf-export .theme-dark table thead tr { background: #1A2B45 !important; }
    body.pdf-export .theme-dark table thead th { color: #F5F2ED !important; }
    body.pdf-export .theme-dark .card-alert { background: #F0EDE8 !important; border: 0 !important; border-left: 3px solid #2E4A6E !important; }
    body.pdf-export #payrank-pdf-cta { display: none !important; }

    /* Recuadros de alerta en banda oscura: texto blanco puro para máximo contraste */
    .theme-dark .card-alert .p-body { color: #FFFFFF !important; }
    .theme-dark .card-alert .eyebrow { color: rgba(255,255,255,0.75) !important; }
  `}</style>
);


function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-hueso/10 last:border-0">
      <span className="font-ui text-[11px] text-hueso/55 uppercase tracking-wider">{k}</span>
      <span className="font-body text-sm text-hueso text-right">{v}</span>
    </div>
  );
}
function Badge({ kind, children }: { kind: "bajo" | "en" | "sobre" | "neutral"; children: React.ReactNode }) {
  const cls =
    kind === "sobre"
      ? "bg-hueso text-tinta"
      : kind === "en"
      ? "border border-hueso/40 text-hueso"
      : kind === "bajo"
      ? "border border-red-300/60 text-red-200"
      : "border border-hueso/30 text-hueso/80";
  return (
    <span className={`inline-flex items-center px-3 py-1 font-ui text-[10px] tracking-widest uppercase ${cls}`}>
      {children}
    </span>
  );
}

function posKind(p: string | undefined): "bajo" | "en" | "sobre" | "neutral" {
  if (!p) return "neutral";
  const x = p.toLowerCase();
  if (x.includes("bajo")) return "bajo";
  if (x.includes("sobre") || x.includes("encima")) return "sobre";
  if (x.includes("en mercado") || x.includes("en rango")) return "en";
  return "neutral";
}

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && isFinite(v)) return v;
  const s = String(v).replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}
function fmtUSD(n: number): string {
  return "USD " + Math.round(n).toLocaleString("en-US");
}

function PercentilesChart({
  p25, p50, p75, p90, salario,
}: { p25: number; p50: number; p75: number; p90: number; salario: number | null }) {
  const bars = [
    { label: "P25", value: p25 },
    { label: "P50", value: p50 },
    { label: "P75", value: p75 },
    { label: "P90", value: p90 },
  ];
  const maxRef = Math.max(p90, salario ?? 0) * 1.1;
  const chartH = 240;
  return (
    <div className="border border-hueso/15 p-5 md:p-6 bg-hueso/[0.04]">
      <p className="font-ui text-[10px] tracking-[0.18em] text-hueso/45 mb-5">
        TU UBICACIÓN EN LA DISTRIBUCIÓN · USD
      </p>
      <div className="relative" style={{ height: chartH + 60 }}>
        {/* bars */}
        <div className="absolute inset-x-0 top-0 flex items-end justify-between gap-3 px-2" style={{ height: chartH }}>
          {bars.map((b) => {
            const h = (b.value / maxRef) * chartH;
            const isP50 = b.label === "P50";
            return (
              <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full transition-all"
                  style={{
                    height: `${h}px`,
                    backgroundColor: isP50 ? "#2E4A6E" : "rgba(46,74,110,0.35)",
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* salario line */}
        {salario !== null && salario > 0 && (() => {
          const top = chartH - (salario / maxRef) * chartH;
          return (
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: `${top}px` }}
            >
              <div
                className="w-full"
                style={{
                  borderTop: "2px dashed #E5484D",
                  height: 0,
                }}
              />
              <div
                className="absolute right-0 -translate-y-full px-2 py-1 font-ui text-[10px] uppercase tracking-widest"
                style={{ backgroundColor: "#E5484D", color: "#F5F2ED" }}
              >
                Tu salario actual: {fmtUSD(salario)}
              </div>
            </div>
          );
        })()}
        {/* labels */}
        <div className="absolute inset-x-0 flex justify-between gap-3 px-2" style={{ top: chartH + 8 }}>
          {bars.map((b) => (
            <div key={b.label} className="flex-1 text-center">
              <div className="font-display text-base md:text-lg text-hueso">{fmtUSD(b.value)}</div>
              <div className="font-ui text-[10px] tracking-widest text-hueso/55 mt-1">{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type LeerVariant = "es-vos" | "es-tu" | "en";
function leerVariant(pais: string): LeerVariant {
  const p = pais.toLowerCase();
  if (
    p === "usa" || p === "eeuu" || p.includes("estados unidos") ||
    p.includes("united states") || p.includes("ee.uu") ||
    p === "uk" || p.includes("united kingdom") || p.includes("reino unido") ||
    p.includes("australia") || p.includes("canad")
  ) return "en";
  if (p.includes("argentin") || p.includes("uruguay")) return "es-vos";
  return "es-tu";
}

function HowToReadBox({ pais }: { pais: string }) {
  const v = leerVariant(pais);
  const isEN = v === "en";
  const isPdf =
    typeof document !== "undefined" && document.body.classList.contains("pdf-export");
  const [open, setOpen] = React.useState(isPdf);

  React.useEffect(() => {
    const obs = new MutationObserver(() => {
      if (document.body.classList.contains("pdf-export")) setOpen(true);
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const title = isEN ? "How to read this data" : "¿Cómo leer estos datos?";

  const contentEN = (
    <>
      <p>Percentiles show where your salary falls relative to the market for your specific profile:</p>
      <p><strong>P25</strong> — The floor. If you're here, the market is paying 75% of comparable professionals more than you. This is urgent correction territory.</p>
      <p><strong>P50</strong> — The market median. Half earn more, half earn less. If your profile has no strong differentiators, this is your negotiation benchmark.</p>
      <p><strong>P75</strong> — The upper range. If your profile has concrete differentiators — valued certifications, measurable impact, scarce skills — this is your target. Asking for it requires backing it up.</p>
      <p><strong>P90</strong> — The top 10%. Only reached with exceptional combinations of seniority, specialization, and demonstrable impact. Not a typical negotiation target — it's context.</p>
      <p><strong>Compa-ratio</strong> — Compares your current salary to the adjusted P50 for your profile. At 1.00, you earn exactly the median. Below 0.90, any compensation manager recognizes it as a gap to correct — you're not asking for a raise, you're asking for a correction.</p>
    </>
  );

  const contentVos = (
    <>
      <p>Los percentiles muestran dónde se ubica tu salario en relación al mercado para tu perfil específico:</p>
      <p><strong>P25</strong> — El piso del rango. Si estás acá, el mercado te está pagando menos que al 75% de los profesionales comparables. Es zona de corrección urgente.</p>
      <p><strong>P50</strong> — La mediana del mercado. La mitad gana más, la mitad gana menos. Si tu perfil no tiene diferenciadores fuertes, este es tu número de referencia para negociar.</p>
      <p><strong>P75</strong> — El rango superior. Si tu perfil tiene diferenciadores concretos — certificaciones valoradas, impacto medible en resultados, skills escasos — este es tu rango objetivo. Pedirlo requiere poder fundamentarlo.</p>
      <p><strong>P90</strong> — El top 10% del mercado. Solo se alcanza con combinaciones excepcionales de seniority, especialización e impacto demostrable. No es un objetivo de negociación habitual — es un dato de contexto.</p>
      <p><strong>Compa-ratio</strong> — Compara tu salario actual contra el P50 ajustado a tu perfil. Si es 1.00, ganás exactamente la mediana. Si es menor a 0.90, cualquier gerente de compensaciones lo reconoce como una brecha a corregir — no estás pidiendo un aumento, estás pidiendo una corrección.</p>
    </>
  );

  const contentTu = (
    <>
      <p>Los percentiles muestran dónde se ubica tu salario en relación al mercado para tu perfil específico:</p>
      <p><strong>P25</strong> — El piso del rango. Si estás aquí, el mercado te está pagando menos que al 75% de los profesionales comparables. Es zona de corrección urgente.</p>
      <p><strong>P50</strong> — La mediana del mercado. La mitad gana más, la mitad gana menos. Si tu perfil no tiene diferenciadores fuertes, este es tu número de referencia para negociar.</p>
      <p><strong>P75</strong> — El rango superior. Si tu perfil tiene diferenciadores concretos — certificaciones valoradas, impacto medible en resultados, skills escasos — este es tu rango objetivo. Pedirlo requiere poder fundamentarlo.</p>
      <p><strong>P90</strong> — El top 10% del mercado. Solo se alcanza con combinaciones excepcionales de seniority, especialización e impacto demostrable. No es un objetivo de negociación habitual — es un dato de contexto.</p>
      <p><strong>Compa-ratio</strong> — Compara tu salario actual contra el P50 ajustado a tu perfil. Si es 1.00, ganas exactamente la mediana. Si es menor a 0.90, cualquier gerente de compensaciones lo reconoce como una brecha a corregir — no estás pidiendo un aumento, estás pidiendo una corrección.</p>
    </>
  );

  const content = v === "en" ? contentEN : v === "es-vos" ? contentVos : contentTu;

  return (
    <div
      style={{
        backgroundColor: "#F0EDE8",
        color: "#0C0C0C",
        borderLeft: "4px solid #2E4A6E",
        padding: "14px 18px",
      }}
      className="text-[13px] leading-relaxed"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left font-ui uppercase tracking-[0.18em] text-[11px]"
        style={{ color: "#0C0C0C" }}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span aria-hidden className="pdf-hide">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2 font-body text-justify">
          {content}
        </div>
      )}
    </div>
  );
}


// ---------- Page ----------

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
        <p className="font-body text-hueso/70 text-center">No encontramos este PayRank.</p>
      </div>
    );
  }

  const row = data as R;
  const res = (row.resultado_json as R) ?? {};

  const s1 = (res.seccion_1 as R) ?? {};
  const s2 = (res.seccion_2 as R) ?? {};
  const s3 = (res.seccion_3 as R) ?? {};
  const s4 = (res.seccion_4 as R) ?? {};
  const s5 = (res.seccion_5 as R) ?? {};
  const s6 = (res.seccion_6 as R) ?? {};
  const s7 = (res.seccion_7 as R) ?? {};
  const s8 = (res.seccion_8 as R) ?? {};
  const fl = (res.freelance as R) ?? {};

  return (
    <div className="min-h-screen bg-white">
      <ThemeStyles />
      <header className="theme-dark bg-[#0C0C0C] border-b border-hueso/10">
        <div className="mx-auto max-w-4xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Logo />
          <span className="font-ui text-[10px] text-hueso/50">PayRank · resultado</span>
        </div>
      </header>

      <main id="payrank-report">
        <Band theme="light">

        {/* SECCIÓN 1 */}
        <Section>
          <Eyebrow>01 · TU PERFIL</Eyebrow>
          <H2>Quién sos en el mercado</H2>
          <P>{str(s1.descripcion_perfil)}</P>

          {bool(s1.discrepancia_detectada) && (
            <Card dark>
              <Eyebrow>DISCREPANCIA TÍTULO / FUNCIONES</Eyebrow>
              <P>{str(s1.descripcion_discrepancia)}</P>
              {!!s1.nivel_real_inferido && (
                <p className="mt-3 font-body text-sm text-hueso/70">
                  Nivel real inferido: <span className="text-hueso">{str(s1.nivel_real_inferido)}</span>
                </p>
              )}
            </Card>
          )}

        </Section>
        </Band>

        <Band theme="dark">
        {/* SECCIÓN 2 */}

        <Section>
          <Eyebrow>02 · EL NÚMERO</Eyebrow>
          <H2>Cuánto valés hoy en el mercado</H2>

          <p className="font-display text-3xl md:text-4xl text-hueso">{str(s2.rango_texto)}</p>

          <HowToReadBox pais={String(row.pais_rol ?? "")} />

          {(() => {
            const p25 = parseNum(s2.p25_usd);
            const p50 = parseNum(s2.p50_usd);
            const p75 = parseNum(s2.p75_usd);
            const p90 = parseNum(s2.p90_usd);
            const sal = parseNum(s2.salario_actual_usd);
            if (p25 && p50 && p75 && p90) {
              return <PercentilesChart p25={p25} p50={p50} p75={p75} p90={p90} salario={sal} />;
            }
            return null;
          })()}

          <P>{str(s2.porcentaje_gana_mas)}</P>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge kind={posKind(s2.posicionamiento as string)}>{str(s2.posicionamiento)}</Badge>
            <span className="font-ui text-[10px] text-hueso/50 uppercase tracking-widest">
              Compa-ratio · {str(s2.compa_ratio)}
            </span>
          </div>
          <P muted>{str(s2.interpretacion_compa_ratio)}</P>

          {bool(s2.erosion_salarial_detectada) && (
            <Card dark>
              <p className="font-ui text-[10px] tracking-[0.18em] text-hueso mb-3">EROSIÓN SALARIAL</p>
              <p className="font-body leading-relaxed text-justify text-hueso">{str(s2.descripcion_erosion)}</p>
            </Card>
          )}

          <P>{str(s2.diagnostico_especifico)}</P>

          {(() => {
            const pais = String(row.pais_rol ?? "").toLowerCase();
            const usdOnly =
              pais === "usa" || pais === "eeuu" ||
              pais.includes("estados unidos") || pais.includes("united states") || pais.includes("ee.uu") ||
              pais === "uk" || pais.includes("united kingdom") || pais.includes("reino unido") ||
              pais.includes("australia") || pais.includes("canad");
            const euroOnly = pais.includes("espa") || pais.includes("spain");
            const tc = (row.tipo_cambio_utilizado ?? null) as
              | { moneda?: string; valor?: number; fuente?: string; fecha?: string }
              | null;
            const createdAt = row.created_at
              ? new Date(String(row.created_at)).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })
              : "—";
            const fxFecha = tc?.fecha
              ? new Date(String(tc.fecha)).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })
              : createdAt;
            const fuenteFull: Record<string, string> = {
              ARS: "Dólar oficial (BNA — Banco Nación) · Fuente: BCRA",
              MXN: "Peso mexicano oficial · Fuente: Banxico",
              CLP: "Peso chileno oficial · Fuente: Banco Central de Chile",
              COP: "Peso colombiano oficial · Fuente: Banco de la República",
              EUR: "Euro oficial · Fuente: Banco Central Europeo (BCE)",
              BRL: "Real brasileño oficial · Fuente: Banco Central do Brasil",
            };
            const monedaLocal = tc?.moneda ?? (typeof s2.moneda_local === "string" ? s2.moneda_local : "");
            const fxLabel = fuenteFull[monedaLocal] ?? (tc?.fuente ?? "");

            if (usdOnly) {
              return (
                <Card>
                  <Eyebrow>RANGO USD</Eyebrow>
                  <KV k="P25" v={str(s2.p25_usd)} />
                  <KV k="P50" v={str(s2.p50_usd)} />
                  <KV k="P75" v={str(s2.p75_usd)} />
                  <KV k="P90" v={str(s2.p90_usd)} />
                  <KV k="Tu salario" v={<span className="font-display">{str(s2.salario_actual_usd)}</span>} />
                </Card>
              );
            }

            if (euroOnly) {
              return (
                <Card>
                  <Eyebrow>RANGO EN EUR</Eyebrow>
                  <KV k="P25" v={str(s2.p25_local)} />
                  <KV k="P50" v={str(s2.p50_local)} />
                  <KV k="P75" v={str(s2.p75_local)} />
                  <KV k="P90" v={str(s2.p90_local)} />
                  <KV k="Tu salario" v={<span className="font-display">{str(s2.salario_actual_local)}</span>} />
                </Card>
              );
            }

            return (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <Eyebrow>RANGO EN MONEDA LOCAL · {str(s2.moneda_local)}</Eyebrow>
                    <KV k="P25" v={str(s2.p25_local)} />
                    <KV k="P50" v={str(s2.p50_local)} />
                    <KV k="P75" v={str(s2.p75_local)} />
                    <KV k="P90" v={str(s2.p90_local)} />
                    <KV k="Tu salario" v={<span className="font-display">{str(s2.salario_actual_local)}</span>} />
                  </Card>
                  <Card>
                    <Eyebrow>RANGO EN USD</Eyebrow>
                    <KV k="P25" v={str(s2.p25_usd)} />
                    <KV k="P50" v={str(s2.p50_usd)} />
                    <KV k="P75" v={str(s2.p75_usd)} />
                    <KV k="P90" v={str(s2.p90_usd)} />
                    <KV k="Tu salario" v={<span className="font-display">{str(s2.salario_actual_usd)}</span>} />
                  </Card>
                </div>
                <p className="font-body text-xs text-hueso/55 leading-relaxed text-justify">
                  Tipo de cambio utilizado: {fxLabel}
                  {tc?.valor ? ` · 1 USD = ${tc.valor.toLocaleString("es-AR")} ${monedaLocal}` : ""}
                  {" · Al: "}{fxFecha}
                </p>
                {monedaLocal === "ARS" && (
                  <p className="font-body text-xs text-hueso/55 leading-relaxed mt-2 text-justify">
                    En Argentina existen múltiples tipos de cambio (oficial, MEP, CCL, informal).
                    Este reporte usa el tipo de cambio oficial BNA porque los salarios formales en
                    relación de dependencia se liquidan en pesos a ese tipo. Si tu empresa liquida
                    a otro tipo, ajustá el valor de referencia proporcionalmente.
                  </p>
                )}
              </>
            );
          })()}


          <Card>
            <KV k="SBTA usuario" v={str(s2.sbta_usuario)} />
            <KV k="SBTA P50 mercado" v={str(s2.sbta_p50_mercado)} />
            <KV k="Bono target" v={`${str(s2.bono_target_porcentaje)} · ${str(s2.bono_target_mensual_local)}/mes`} />
            <KV k="Benchmark usado" v={str(s2.benchmark_referencia_usado)} />
          </Card>

          {arr<string>(s2.ajustes_aplicados).length > 0 && (
            <div>
              <Eyebrow>AJUSTES APLICADOS</Eyebrow>
              <ul className="space-y-1">
                {arr<string>(s2.ajustes_aplicados).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-hueso/80">
                    <span style={{ color: "#2E4A6E", fontWeight: 600, flexShrink: 0 }}>—</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
        </Band>

        <Band theme="light">
        {/* SECCIÓN 3 */}

        <Section>
          <Eyebrow>03 · COMPENSACIÓN TOTAL</Eyebrow>
          <H2>Tu paquete completo, valorizado</H2>

          <div className="overflow-x-auto border border-hueso/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-hueso/[0.04] text-left">
                  <th className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/55">Componente</th>
                  <th className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/55">Tuyo</th>
                  <th className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/55">Mercado</th>
                </tr>
              </thead>
              <tbody>
                {arr<R>(s3.tabla_compensacion).map((c, i) => (
                  <tr key={i} className="border-t border-hueso/10 align-top">
                    <td className="px-4 py-3">
                      <div className="font-body text-hueso">{str(c.componente)}</div>
                      <div className="font-body text-xs text-hueso/55 mt-1">{str(c.descripcion, "")}</div>
                    </td>
                    <td className="px-4 py-3 font-body text-hueso/85">{str(c.valor_mensual_local)}</td>
                    <td className="px-4 py-3 font-body text-hueso/65">{str(c.mercado_tipico_local)}</td>
                  </tr>
                ))}
                <tr className="border-t border-hueso/30 bg-hueso/[0.03]">
                  <td className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/70">Total</td>
                  <td className="px-4 py-3 font-display text-hueso">{str(s3.total_compensacion_local)}</td>
                  <td className="px-4 py-3 font-display text-hueso/80">{str(s3.total_mercado_tipico_local)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Badge kind={posKind(s3.posicionamiento_compensacion_total as string)}>
            {str(s3.posicionamiento_compensacion_total)}
          </Badge>

          <P>{str(s3.analisis_compensacion)}</P>

          {!!s3.alerta_compensacion_variable && (
            <Card dark>
              <Eyebrow>ALERTA · COMPENSACIÓN VARIABLE</Eyebrow>
              <P>{str(s3.alerta_compensacion_variable)}</P>
            </Card>
          )}

          {arr<string>(s3.beneficios_faltantes).length > 0 && (
            <div>
              <Eyebrow>BENEFICIOS QUE TE FALTAN</Eyebrow>
              <ul className="space-y-1">
                {arr<string>(s3.beneficios_faltantes).map((b, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-hueso/80">
                    <span style={{ color: "#2E4A6E", fontWeight: 600, flexShrink: 0 }}>—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* SECCIÓN 4 — solo si incluir */}
        {bool(s4.incluir) && (
          <>
            <Divider />
            <Section>
              <Eyebrow>04 · BRECHA DE GÉNERO</Eyebrow>
              <H2>Lo que el mercado te debe</H2>

              <Card dark>
                <KV k="Brecha %" v={str(s4.brecha_porcentaje)} />
                <KV k="Brecha mensual" v={<span className="font-display">{str(s4.brecha_mensual_local)}</span>} />
                <KV k="Brecha anual" v={<span className="font-display">{str(s4.brecha_anual_local)}</span>} />
                <KV k="Nivel" v={str(s4.nivel_jerarquico_brecha)} />
              </Card>

              {arr<string>(s4.factores_amplificadores).length > 0 && (
                <div>
                  <Eyebrow>FACTORES QUE AMPLÍAN LA BRECHA</Eyebrow>
                  <ul className="space-y-1">
                    {arr<string>(s4.factores_amplificadores).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 font-body text-sm text-hueso/80">
                        <span style={{ color: "#2E4A6E", fontWeight: 600, flexShrink: 0 }}>—</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!s4.contexto_especifico && <P>{str(s4.contexto_especifico)}</P>}

              {!!s4.argumento_negociacion && (
                <Card>
                  <Eyebrow>ARGUMENTO DE NEGOCIACIÓN</Eyebrow>
                  <P>{str(s4.argumento_negociacion)}</P>
                </Card>
              )}
            </Section>
          </>
        )}

        {/* mensaje_si_hombre — sección alternativa cuando el usuario es hombre */}
        {!bool(s4.incluir) && !!s4.mensaje_si_hombre && (
          <>
            <Divider />
            <Section>
              <Eyebrow>04 · BRECHA DE GÉNERO</Eyebrow>
              <H2>Lo que el mercado te muestra como hombre</H2>
              <Card dark>
                <P>{str(s4.mensaje_si_hombre)}</P>
              </Card>
            </Section>
          </>
        )}
        </Band>

        <Band theme="dark">
        {/* SECCIÓN 5 */}

        <Section>
          <Eyebrow>05 · CUÁNTO PEDIR</Eyebrow>
          <H2>Tu pretensión salarial</H2>

          <div className="text-center py-6">
            <p className="font-display text-5xl md:text-6xl text-hueso">{str(s5.pretension_recomendada_local)}</p>
            <p className="font-body text-hueso/55 mt-2">{str(s5.pretension_recomendada_usd)}</p>
          </div>

          <Card>
            <KV k="Floor (mínimo aceptable)" v={str(s5.floor_local)} />
            <KV k="Ceiling (techo)" v={str(s5.ceiling_local)} />
          </Card>

          <P muted>{str(s5.explicacion_floor_ceiling)}</P>

          {!!s5.respuesta_antes_de_conocer_rol && (
            <Card dark>
              <Eyebrow>SI TE PREGUNTAN ANTES DE CONOCER EL ROL</Eyebrow>
              <P>{str(s5.respuesta_antes_de_conocer_rol)}</P>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <Eyebrow>ARGUMENTO 1 · MERCADO</Eyebrow>
              <P>{str(s5.argumento_1_mercado)}</P>
            </div>
            <div>
              <Eyebrow>ARGUMENTO 2 · ALCANCE REAL</Eyebrow>
              <P>{str(s5.argumento_2_alcance_real)}</P>
            </div>
            <div>
              <Eyebrow>ARGUMENTO 3 · CONTEXTO</Eyebrow>
              <P>{str(s5.argumento_3_contexto)}</P>
            </div>
          </div>
        </Section>
        </Band>

        <Band theme="light">
        {/* SECCIÓN 6 */}

        <Section>
          <Eyebrow>06 · SCRIPTS DE NEGOCIACIÓN</Eyebrow>
          <H2>Las palabras exactas</H2>

          <Card dark>
            <Eyebrow>HABLAR CON TU JEFE</Eyebrow>
            <p className="font-body text-hueso/90 whitespace-pre-wrap leading-relaxed text-justify">{str(s6.script_jefe)}</p>
          </Card>

          {str(s6.script_recruiter) !== "—" && (
            <Card dark>
              <Eyebrow>HABLAR CON UN RECRUITER</Eyebrow>
              <p className="font-body text-hueso/90 whitespace-pre-wrap leading-relaxed text-justify">{str(s6.script_recruiter)}</p>
            </Card>
          )}

          <Eyebrow>OBJECIONES Y RESPUESTAS</Eyebrow>
          {[s6.objecion_1, s6.objecion_2, s6.objecion_3].filter(Boolean).map((o, i) => {
            const obj = o as R;
            return (
              <Card key={i}>
                <p className="font-ui text-[10px] uppercase tracking-widest text-hueso/45 mb-2">Objeción {i + 1}</p>
                <p className="font-body text-hueso italic mb-3 text-justify">"{str(obj.objecion)}"</p>
                <p className="font-body text-hueso/80 text-justify">{str(obj.respuesta)}</p>
              </Card>
            );
          })}
        </Section>

        <Divider />

        {/* SECCIÓN 7 */}
        <Section>
          <Eyebrow>07 · SKILLS E IA</Eyebrow>
          <H2>Lo que mueve la aguja</H2>

          <div className="overflow-x-auto border border-hueso/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-hueso/[0.04] text-left">
                  <th className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/55">Skill</th>
                  <th className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/55">Estado</th>
                  <th className="px-4 py-3 font-ui text-[10px] uppercase tracking-wider text-hueso/55">Impacto</th>
                </tr>
              </thead>
              <tbody>
                {arr<R>(s7.skills_impacto).map((s, i) => (
                  <tr key={i} className="border-t border-hueso/10 align-top">
                    <td className="px-4 py-3">
                      <div className="font-body text-hueso">{str(s.skill)}</div>
                      <div className="font-body text-xs text-hueso/55 mt-1">{str(s.razon_de_mercado, "")}</div>
                    </td>
                    <td className="px-4 py-3">
                      {str(s.estado) === "tiene" ? (
                        <Badge kind="sobre">Tenés</Badge>
                      ) : (
                        <Badge kind="bajo">Falta</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 font-display text-hueso">{str(s.impacto_porcentaje)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <Eyebrow>IMPACTO DE IA EN TU PERFIL</Eyebrow>
            <P>{str(s7.impacto_ia_especifico)}</P>
          </div>

          {arr<string>(s7.herramientas_ia_recomendadas).length > 0 && (
            <div>
              <Eyebrow>HERRAMIENTAS RECOMENDADAS</Eyebrow>
              <ul className="space-y-1">
                {arr<string>(s7.herramientas_ia_recomendadas).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-hueso/80">
                    <span style={{ color: "#2E4A6E", fontWeight: 600, flexShrink: 0 }}>—</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <Divider />

        {/* SECCIÓN 8 */}
        <Section>
          <Eyebrow>08 · HOJA DE RUTA</Eyebrow>
          <H2>Tu próximo nivel</H2>

          <P>{str(s8.lectura_progresion)}</P>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <Eyebrow>HOY</Eyebrow>
              <p className="font-display text-2xl text-hueso">{str(s8.nivel_actual)}</p>
            </Card>
            <Card dark>
              <Eyebrow>SIGUIENTE</Eyebrow>
              <p className="font-display text-2xl text-hueso">{str(s8.nivel_siguiente)}</p>
              <p className="font-body text-sm text-hueso/70 mt-2">{str(s8.rango_nivel_siguiente_local)}</p>
              <p className="font-body text-xs text-hueso/55 mt-1">Salto: {str(s8.diferencia_porcentual_salto)}</p>
            </Card>
          </div>

          <div>
            <Eyebrow>CRITERIOS PARA EL SALTO</Eyebrow>
            <div className="space-y-3">
              {arr<R>(s8.criterios_para_el_salto).map((c, i) => (
                <Card key={i}>
                  <p className="font-body text-hueso mb-2 text-justify">{str(c.criterio)}</p>
                  <p className="font-body text-sm text-hueso/65 text-justify">{str(c.estrategia_concreta)}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <KV k="Tiempo realista" v={<span className="font-display">{str(s8.tiempo_realista)}</span>} />
          </Card>

          {!!s8.analisis_cv && (
            <Card dark>
              <Eyebrow>ANÁLISIS DE TU CV</Eyebrow>
              <P>{str(s8.analisis_cv)}</P>
            </Card>
          )}

          {arr<R>(s8.ajustes_cv).length > 0 && (
            <div>
              <Eyebrow>AJUSTES SUGERIDOS</Eyebrow>
              <div className="space-y-3">
                {arr<R>(s8.ajustes_cv).map((a, i) => (
                  <Card key={i}>
                    <p className="font-ui text-[10px] uppercase tracking-widest text-hueso/45 mb-1">Antes</p>
                    <p className="font-body text-hueso/65 italic mb-3">{str(a.antes, "—")}</p>
                    <p className="font-ui text-[10px] uppercase tracking-widest text-hueso/45 mb-1">Después</p>
                    <p className="font-body text-hueso mb-3">{str(a.despues, "—")}</p>
                    {!!a.impacto_estimado && (
                      <p className="font-body text-xs text-hueso/55">Impacto: {str(a.impacto_estimado)}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* FREELANCE */}
        {bool(fl.aplica) && (
          <>
            <Divider />
            <Section>
              <Eyebrow>FREELANCE / INDEPENDIENTE</Eyebrow>
              <H2>Tu valor por hora</H2>

              <Card>
                <KV k="Factor de equivalencia" v={str(fl.factor_equivalencia_usado)} />
                <KV k="Equivalente en relación de dependencia" v={str(fl.equivalente_relacion_dependencia)} />
                <KV k="Valor hora recomendado" v={<span className="font-display">{str(fl.valor_hora_recomendado)}</span>} />
                <KV k="Horas facturables/mes" v={str(fl.horas_facturables_estimadas)} />
                <KV k="Facturación objetivo P50" v={str(fl.facturacion_objetivo_p50)} />
                <KV k="Facturación objetivo P75" v={str(fl.facturacion_objetivo_p75)} />
              </Card>

              {!!fl.alerta_monotributo && (
                <Card dark>
                  <Eyebrow>ALERTA · MONOTRIBUTO</Eyebrow>
                  <P>{str(fl.alerta_monotributo)}</P>
                </Card>
              )}
            </Section>
          </>
        )}

        </Band>

        <section className="bg-[#F5F2ED]">
          <div className="mx-auto max-w-4xl px-5 md:px-8 py-10 text-xs text-[#0C0C0C]/60 font-body text-center">
            PayRank LLC · 30 N Gould St, STE R, Sheridan, Wyoming 82801, USA · hello@payrank.co
          </div>
        </section>
      </main>

      <div id="payrank-pdf-cta">
        <DownloadPdfButton targetId="payrank-report" diagId={String(row.id ?? "")} />
      </div>

      <ReportFooterActions
        diagnosticoId={String(row.id ?? "")}
        planElegido={(row.plan_elegido as string | null) ?? null}
        linkUnico={String(row.link_unico ?? "")}
        pais={String(row.pais_rol ?? "")}
      />

    </div>
  );
}
