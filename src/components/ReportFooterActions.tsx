import * as React from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SocialIconLinks } from "./SocialLinks";

function isEnglishCountry(pais: string): boolean {
  const p = pais.toLowerCase();
  return (
    p === "usa" ||
    p === "eeuu" ||
    p.includes("estados unidos") ||
    p.includes("united states") ||
    p.includes("ee.uu") ||
    p === "uk" ||
    p.includes("united kingdom") ||
    p.includes("reino unido") ||
    p.includes("australia") ||
    p.includes("canad")
  );
}

export function ReportFooterActions({
  diagnosticoId,
  planElegido,
  linkUnico,
  pais,
}: {
  diagnosticoId: string;
  planElegido: string | null;
  linkUnico?: string;
  pais?: string;
}) {
  const [score, setScore] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const refCode = linkUnico ? linkUnico.replace(/-/g, "").slice(0, 8) : null;
  const refLink = refCode
    ? `${typeof window !== "undefined" ? window.location.origin : "https://payrank.app"}/ref/${refCode}`
    : null;

  const copyRefLink = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const plan = (planElegido ?? "").toLowerCase();
  const isGo = plan === "go" || plan === "";
  const newPayrankLabel = isGo
    ? "¿Necesitás otro? Ver planes →"
    : "Obtener otro PayRank →";
  const newPayrankHref = isGo ? "/#precios" : "/diagnostico/upload";

  const submit = async () => {
    if (score === null) return;
    setSending(true);
    setError(null);
    const { error: err } = await supabase.functions.invoke("submit-nps", {
      body: {
        diagnostico_id: diagnosticoId,
      score,
      comentario: feedback.trim() || null,
      },
    });
    setSending(false);
    if (err) {
      setError("No se pudo enviar tu respuesta. Intentá de nuevo.");
      return;
    }
    setSent(true);
  };

  const isEN = pais ? isEnglishCountry(pais) : false;

  return (
    <section className="bg-white" id="payrank-footer-actions">
      <div className="mx-auto max-w-3xl px-5 md:px-8 py-14 space-y-12">
        {/* NPS */}
        <div className="space-y-6">
          <div>
            <p
              className="text-[10px] tracking-[0.18em] uppercase mb-2"
              style={{ color: "#2E4A6E" }}
            >
              Encuesta
            </p>
            <h2
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: "#1A2B45" }}
            >
              ¿Cómo fue tu experiencia?
            </h2>
            <p className="mt-3 text-sm" style={{ color: "#0C0C0C" }}>
              ¿Qué tan probable es que recomiendes PayRank a un colega o amigo?
            </p>
          </div>

          {sent ? (
            <div
              className="p-5"
              style={{
                background: "#F0EDE8",
                borderLeft: "3px solid #2E4A6E",
                color: "#0C0C0C",
              }}
            >
              ¡Gracias! Tu respuesta fue registrada.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 11 }).map((_, i) => {
                  const selected = score === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setScore(i)}
                      className="w-10 h-10 text-sm font-semibold transition"
                      style={{
                        background: selected ? "#1A2B45" : "#FFFFFF",
                        color: selected ? "#F5F2ED" : "#1A2B45",
                        border: `1px solid ${selected ? "#1A2B45" : "#2E4A6E"}`,
                        borderRadius: 4,
                      }}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px]" style={{ color: "#0C0C0C" }}>
                <span>Nada probable</span>
                <span>Muy probable</span>
              </div>

              {score !== null && (
                <div className="space-y-3">
                  <label htmlFor="nps-feedback" className="block text-sm" style={{ color: "#0C0C0C" }}>
                    ¿Qué fue lo más valioso de tu PayRank?
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, 1000))}
                    rows={4}
                    maxLength={1000}
                    className="w-full p-3 text-sm"
                    style={{
                      background: "#FFFFFF",
                      color: "#0C0C0C",
                      border: "1px solid #2E4A6E",
                      borderRadius: 4,
                      fontFamily: "inherit",
                    }}
                    placeholder="Contanos en pocas palabras…"
                  />
                  {error && (
                    <p className="text-xs" style={{ color: "#B91C1C" }}>
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    style={{
                      background: "#1A2B45",
                      color: "#F5F2ED",
                      fontFamily: "Arial, sans-serif",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "12px 24px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "none",
                      cursor: sending ? "wait" : "pointer",
                      opacity: sending ? 0.7 : 1,
                    }}
                  >
                    {sending ? "Enviando…" : "Enviar"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col items-center gap-4 pt-6 border-t" style={{ borderColor: "#E5E1DA" }}>
          <a
            href={newPayrankHref}
            style={{
              background: "#1A2B45",
              color: "#F5F2ED",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "14px 28px",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {newPayrankLabel}
          </a>

          <Link
            to="/"
            className="text-sm underline"
            style={{ color: "#2E4A6E", fontFamily: "Arial, sans-serif" }}
          >
            Volver al inicio
          </Link>
        </div>

        {/* Seguimiento post-reporte */}
        <div className="pt-8 border-t" style={{ borderColor: "#E5E1DA" }}>
          <p className="text-base font-semibold mb-4" style={{ color: "#1A2B45" }}>
            Esto no termina acá.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm" style={{ color: "#0C0C0C" }}>
              <span style={{ color: "#2E4A6E", fontWeight: 600, flexShrink: 0 }}>—</span>
              <span>Nos volvemos a contactar a los 30, 60 y 90 días para saber cómo te fue.</span>
            </li>
            <li className="flex items-start gap-2 text-sm" style={{ color: "#0C0C0C" }}>
              <span style={{ color: "#2E4A6E", fontWeight: 600, flexShrink: 0 }}>—</span>
              <span>Recibís alertas en tu correo cuando el mercado para tu posición se mueva.</span>
            </li>
          </ul>
        </div>

        {/* Referidos */}
        {refLink && (
          <div className="pt-8 border-t" style={{ borderColor: "#E5E1DA" }}>
            <p className="text-base font-semibold mb-2" style={{ color: "#1A2B45" }}>
              Compartí tu PayRank.
            </p>
            <p className="text-sm mb-5" style={{ color: "#0C0C0C" }}>
              Si tres personas hacen su PayRank con tu link, el próximo es tuyo — gratis.
              Cada persona referida obtiene 15% de descuento en su primer PayRank.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-sm font-mono px-3 py-2 select-all"
                style={{
                  background: "#F0EDE8",
                  color: "#1A2B45",
                  border: "1px solid #E5E1DA",
                  borderRadius: 4,
                  wordBreak: "break-all",
                }}
              >
                {refLink}
              </span>
              <button
                type="button"
                onClick={copyRefLink}
                style={{
                  background: copied ? "#2E4A6E" : "#1A2B45",
                  color: "#F5F2ED",
                  fontFamily: "Arial, sans-serif",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "background 200ms",
                  flexShrink: 0,
                }}
              >
                {copied ? "¡Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        )}

        {/* Social */}
        <div className="pt-8 border-t" style={{ borderColor: "#E5E1DA" }}>
          <p className="text-sm mb-3" style={{ color: "#0C0C0C" }}>
            {isEN
              ? "Follow us for market data, salary trends, and negotiation strategies"
              : "Seguinos para datos de mercado, tendencias salariales y estrategias de negociación"}
          </p>
          <SocialIconLinks />
        </div>
      </div>
    </section>
  );
}
