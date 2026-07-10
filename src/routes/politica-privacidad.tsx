import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLang } from "@/lib/lang";

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
  const { lang } = useLang();
  const isEN = lang === "EN";
  if (isEN) return <PrivacyPolicyEN />;
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
              <><strong className="font-normal text-tinta">Información de contacto:</strong> mail.</>,
              <><strong className="font-normal text-tinta">Información de género:</strong> solo si elegís incluirla para el análisis de brecha salarial. Es completamente opcional.</>,
              <><strong className="font-normal text-tinta">Información de pago:</strong> procesada directamente por Stripe. PayRank no almacena datos de tarjetas de crédito.</>,
            ]}
          />

          <SectionTitle>3 — Para qué usamos tu información</SectionTitle>
          <List
            items={[
              "Para generar tu PayRank con criterio compensológico real.",
              "Para enviarte tu reporte por mail.",
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

function PrivacyPolicyEN() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />
      <main className="pt-32 pb-24 px-5 md:px-8">
        <article className="mx-auto max-w-[720px]">
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="font-ui text-[11px] text-piedra mb-12">
            PayRank LLC · Effective May 2026
          </p>

          <SectionTitle>1 — Who we are</SectionTitle>
          <P>
            PayRank LLC is a professional salary intelligence platform. We operate globally and our main site is payrank.co.
          </P>

          <SectionTitle>2 — What information we collect</SectionTitle>
          <P>We collect information you provide when using PayRank:</P>
          <List
            items={[
              <><strong className="font-normal text-tinta">Professional information:</strong> industry, hierarchical level, functions, experience, education, and certifications.</>,
              <><strong className="font-normal text-tinta">Compensation information:</strong> current or previous salary, benefits received.</>,
              <><strong className="font-normal text-tinta">Optional documents:</strong> CV, job description, pay stub, or job posting. These documents are processed to extract structured data and are not stored as files.</>,
              <><strong className="font-normal text-tinta">Contact information:</strong> email.</>,
              <><strong className="font-normal text-tinta">Gender information:</strong> only if you choose to include it for the gender pay gap analysis. Completely optional.</>,
              <><strong className="font-normal text-tinta">Payment information:</strong> processed directly by Stripe. PayRank does not store credit card data.</>,
            ]}
          />

          <SectionTitle>3 — How we use your information</SectionTitle>
          <List
            items={[
              "To generate your PayRank using real compensation criteria.",
              "To send you your report by email.",
              "To improve the accuracy of future diagnostics using fully anonymized and aggregated data.",
              "To publish the quarterly PayRank Industry Report — a market report built with anonymized data from users who gave explicit consent.",
              "To send market alerts if you subscribed to the PRO plan.",
            ]}
          />

          <SectionTitle>4 — What we do NOT do with your information</SectionTitle>
          <List
            items={[
              "We do not sell your personal information to third parties.",
              "We do not share individually identifiable data with any company.",
              "We do not use your information for targeted advertising.",
              "We do not store the documents you upload (CVs, pay stubs, job postings) — only the structured data extracted from them.",
            ]}
          />

          <SectionTitle>5 — How we protect your information</SectionTitle>
          <P>
            Your information is stored in Supabase with encryption in transit and at rest. Access is restricted and audited. Payments are processed through Stripe, which complies with the PCI DSS standard (Payment Card Industry Data Security Standard).
          </P>

          <SectionTitle>6 — Your rights</SectionTitle>
          <P>You have the right to:</P>
          <List
            items={[
              "Access the data we hold about you.",
              "Correct inaccurate information.",
              "Request deletion of your data.",
              "Withdraw your consent for anonymized use of your data at any time.",
            ]}
          />
          <P>
            To exercise any of these rights, write to us at:{" "}
            <a href="mailto:hello@payrank.co" className="underline">hello@payrank.co</a>
          </P>

          <SectionTitle>7 — Users in the European Union</SectionTitle>
          <P>
            If you are in the European Union, your data is processed in accordance with the General Data Protection Regulation (GDPR). You have the right to file a complaint with your country's data protection authority.
          </P>

          <SectionTitle>8 — Cookies</SectionTitle>
          <P>
            PayRank uses technical cookies necessary for the platform to function. We do not use tracking cookies or third-party advertising.
          </P>

          <SectionTitle>9 — Changes to this policy</SectionTitle>
          <P>
            We may update this policy occasionally. We will notify you by email if the changes are significant.
          </P>

          <SectionTitle>10 — Contact</SectionTitle>
          <P>For any privacy-related inquiries:</P>
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
