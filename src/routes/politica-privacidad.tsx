import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/politica-privacidad")({
  component: PoliticaPrivacidad,
  head: () => ({
    meta: [
      { title: "Política de Privacidad · PayRank" },
      {
        name: "description",
        content:
          "Política de privacidad de PayRank LLC: qué datos recopilamos, cómo los usamos y tus derechos.",
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

function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />
      <main className="pt-32 pb-24 px-5 md:px-8">
        <article className="mx-auto max-w-[720px]">
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-3">
            Política de Privacidad
          </h1>
          <p className="font-ui text-[11px] text-piedra mb-12">
            PayRank LLC · Vigente desde mayo de 2026
          </p>

          <SectionTitle>1 — Quiénes somos</SectionTitle>
          <P>
            PayRank LLC es una plataforma de inteligencia profesional y
            salarial. Operamos globalmente y nuestro sitio principal es
            payrank.co.
          </P>

          <SectionTitle>2 — Qué información recopilamos</SectionTitle>
          <P>Recopilamos la información que vos nos proporcionás al usar PayRank:</P>
          <List
            items={[
              <><strong className="font-normal text-tinta">Información profesional:</strong> industria, nivel jerárquico, funciones, experiencia, formación y certificaciones.</>,
              <><strong className="font-normal text-tinta">Información de compensación:</strong> salario actual o anterior, beneficios recibidos.</>,
              <><strong className="font-normal text-tinta">Documentos opcionales:</strong> CV, descriptivo de puesto, recibo de sueldo o aviso de empleo. Estos documentos se procesan para extraer datos estructurados y no se almacenan como archivos.</>,
              <><strong className="font-normal text-tinta">Información de contacto:</strong> mail y WhatsApp si lo proporcionás voluntariamente.</>,
              <><strong className="font-normal text-tinta">Información de género:</strong> solo si elegís incluirla para el análisis de brecha salarial. Es completamente opcional.</>,
              <><strong className="font-normal text-tinta">Información de pago:</strong> procesada directamente por Stripe. PayRank no almacena datos de tarjetas de crédito.</>,
            ]}
          />

          <SectionTitle>3 — Para qué usamos tu información</SectionTitle>
          <List
            items={[
              "Para generar tu PayRank con criterio compensológico real.",
              "Para enviarte tu reporte por mail y WhatsApp si lo solicitaste.",
              "Para mejorar la precisión de futuros diagnósticos mediante datos agregados y completamente anonimizados.",
              "Para publicar el PayRank Industry Report trimestral — un informe de mercado construido con datos anonimizados de todos los usuarios que dieron su consentimiento explícito.",
              "Para enviarte alertas de mercado si contrataste el plan PRO.",
            ]}
          />

          <SectionTitle>4 — Qué NO hacemos con tu información</SectionTitle>
          <List
            items={[
              "No vendemos tu información personal a terceros.",
              "No compartimos datos individuales identificables con ninguna empresa.",
              "No usamos tu información para publicidad dirigida.",
              "No almacenamos los documentos que subís (CV, recibos, avisos) — solo los datos estructurados extraídos de ellos.",
            ]}
          />

          <SectionTitle>5 — Cómo protegemos tu información</SectionTitle>
          <P>
            Tu información se almacena en Supabase con encriptación en tránsito
            y en reposo. El acceso está restringido y auditado. Los pagos se
            procesan a través de Stripe, que cumple con el estándar PCI DSS
            (Estándar de Seguridad de Datos para la Industria de Tarjetas de
            Pago).
          </P>

          <SectionTitle>6 — Tus derechos</SectionTitle>
          <P>Tenés derecho a:</P>
          <List
            items={[
              "Acceder a los datos que tenemos sobre vos.",
              "Corregir información incorrecta.",
              "Solicitar la eliminación de tus datos.",
              "Retirar tu consentimiento para el uso anonimizado de tus datos en cualquier momento.",
            ]}
          />
          <P>
            Para ejercer cualquiera de estos derechos, escribinos a:{" "}
            <a href="mailto:hello@payrank.co" className="underline">hello@payrank.co</a>
          </P>

          <SectionTitle>7 — Usuarios en la Unión Europea</SectionTitle>
          <P>
            Si estás en la Unión Europea, tus datos se tratan conforme al
            Reglamento General de Protección de Datos (RGPD/GDPR). Tenés
            derecho a presentar una reclamación ante la autoridad de protección
            de datos de tu país.
          </P>

          <SectionTitle>8 — Cookies</SectionTitle>
          <P>
            PayRank usa cookies técnicas necesarias para el funcionamiento de
            la plataforma. No usamos cookies de rastreo ni publicidad de
            terceros.
          </P>

          <SectionTitle>9 — Cambios a esta política</SectionTitle>
          <P>
            Podemos actualizar esta política ocasionalmente. Te notificaremos
            por mail si los cambios son significativos.
          </P>

          <SectionTitle>10 — Contacto</SectionTitle>
          <P>Para cualquier consulta sobre privacidad:</P>
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
