import * as React from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function ReportFooterActions({
  diagnosticoId,
  planElegido,
}: {
  diagnosticoId: string;
  planElegido: string | null;
}) {
  const [score, setScore] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    const { error: err } = await supabase.from("nps_responses").insert({
      diagnostico_id: diagnosticoId || null,
      score,
      feedback: feedback.trim() || null,
    });
    setSending(false);
    if (err) {
      setError("No se pudo enviar tu respuesta. Intentá de nuevo.");
      return;
    }
    setSent(true);
  };

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
                  <label className="block text-sm" style={{ color: "#0C0C0C" }}>
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
      </div>
    </section>
  );
}
