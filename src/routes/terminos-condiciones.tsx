import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terminos-condiciones")({
  component: TerminosCondiciones,
  head: () => ({
    meta: [
      { title: "Términos y Condiciones · PayRank" },
      {
        name: "description",
        content:
          "Términos y condiciones de uso de PayRank LLC: servicio, pagos, reembolsos, referidos y limitaciones.",
      },
    ],
  }),
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-ui text-[12px] text-tinta mt-12 mb-4">{children}</h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-base leading-relaxed text-tinta/85 mb-4">
      {children}
    </p>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3 mb-4">
      {items.map((it, i) => (
        <li
          key={i}
          className="font-body text-base leading-relaxed text-tinta/85 pl-5 relative before:content-['·'] before:absolute before:left-0 before:text-tinta"
        >
          {it}
        </li>
      ))}
    </ul>
  );
}

function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />
      <main className="pt-32 pb-24 px-5 md:px-8">
        <article className="mx-auto max-w-[720px]">
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-3">
            Términos y Condiciones
          </h1>
          <p className="font-ui text-[11px] text-piedra mb-12">
            PayRank LLC · Vigente desde mayo de 2026
          </p>

          <SectionTitle>1 — Aceptación</SectionTitle>
          <P>
            Al usar PayRank, aceptás estos términos. Si no estás de acuerdo, no
            uses el servicio.
          </P>

          <SectionTitle>2 — Qué es PayRank</SectionTitle>
          <P>
            PayRank es una plataforma de inteligencia profesional y salarial
            que genera reportes personalizados basados en la información que el
            usuario provee y en criterio compensológico de mercado.
          </P>

          <SectionTitle>3 — El servicio y sus limitaciones</SectionTitle>
          <P>
            PayRank genera estimaciones de mercado basadas en datos de
            referencia y metodología compensológica profesional. Los
            resultados:
          </P>
          <List
            items={[
              "Son estimaciones informadas, no valores exactos ni garantizados.",
              "Incluyen un nivel de confianza declarado explícitamente (Alto, Medio o Bajo) según la disponibilidad de datos para el perfil consultado.",
              "No constituyen asesoramiento legal, laboral ni financiero.",
              "Pueden variar según el movimiento del mercado después de la generación.",
            ]}
          />
          <P>
            La precisión del reporte depende directamente de la calidad y
            completitud de la información que el usuario proporciona.
          </P>

          <SectionTitle>4 — Pagos y reembolsos</SectionTitle>
          <P>
            Los pagos se procesan a través de Stripe. Los precios se expresan
            en dólares estadounidenses (USD).
          </P>
          <List
            items={[
              <><strong className="font-normal text-tinta">Plan GO (un PayRank):</strong> pago único, sin vencimiento.</>,
              <><strong className="font-normal text-tinta">Plan PLUS (tres PayRank):</strong> pago único, sin vencimiento.</>,
              <><strong className="font-normal text-tinta">Plan PRO (anual):</strong> renovación automática anual. Podés cancelar antes de la fecha de renovación.</>,
            ]}
          />
          <P>
            <strong className="font-normal text-tinta">
              Política de reembolso:
            </strong>{" "}
            dado que el servicio se entrega de forma inmediata y digital, no
            ofrecemos reembolsos una vez generado el PayRank. Si el servicio
            presenta fallas técnicas que impidan la entrega del reporte,
            contactanos y lo resolvemos.
          </P>

          <SectionTitle>5 — Programa de referidos</SectionTitle>
          <P>
            El programa de referidos permite obtener un PayRank gratuito cuando
            tres personas completan un PayRank usando tu link único. Los
            referidos reciben un 15% de descuento en su primer PayRank. PayRank
            se reserva el derecho de modificar o discontinuar el programa en
            cualquier momento con aviso previo.
          </P>

          <SectionTitle>6 — Uso aceptable</SectionTitle>
          <P>Al usar PayRank aceptás:</P>
          <List
            items={[
              "Proveer información veraz sobre tu perfil profesional.",
              "No usar el servicio para fines fraudulentos o ilegales.",
              "No intentar acceder a datos de otros usuarios.",
              "No reproducir ni comercializar los reportes generados sin autorización expresa.",
            ]}
          />

          <SectionTitle>7 — Propiedad intelectual</SectionTitle>
          <P>
            El reporte generado es para uso personal del usuario. PayRank LLC
            retiene todos los derechos sobre la metodología, el sistema y los
            datos agregados anonimizados.
          </P>

          <SectionTitle>8 — Limitación de responsabilidad</SectionTitle>
          <P>
            PayRank no es responsable por decisiones laborales, salariales o de
            carrera tomadas en base al reporte generado. El usuario es el único
            responsable de las decisiones que tome con la información recibida.
          </P>

          <SectionTitle>9 — Ley aplicable</SectionTitle>
          <P>
            Estos términos se rigen por las leyes del Estado de Wyoming,
            Estados Unidos, donde está constituida PayRank LLC.
            <br />
            30 N Gould St, STE R, Sheridan, Wyoming 82801, USA
          </P>

          <SectionTitle>10 — Contacto</SectionTitle>
          <P>Para consultas sobre estos términos:</P>
          <P>
            <a href="mailto:hello@payrank.co" className="underline">hello@payrank.co</a>
            <br />
            PayRank LLC
            <br />
            30 N Gould St, STE R
            <br />
            Sheridan, Wyoming 82801, USA
          </P>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
