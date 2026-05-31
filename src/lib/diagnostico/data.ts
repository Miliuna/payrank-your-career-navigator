import type { Modo } from "./types";

export const TITULOS_MODO: Record<Modo, string> = {
  A: "Quiero saber si me pagan en forma competitiva",
  B: "Quiero pedir un aumento o una revisión salarial",
  C: "Tengo una oferta o entrevista",
  D: "Quiero dar mi próximo salto de carrera",
};

export const TITULOS_MODO_EN: Record<Modo, string> = {
  A: "Am I being paid competitively?",
  B: "I want to ask for a raise or review",
  C: "I have an offer or interview",
  D: "I'm planning my next career move",
};

export const PAISES = [
  "Argentina", "México", "Chile", "Colombia", "España", "Perú",
  "Uruguay", "Brasil", "Ecuador", "Estados Unidos", "Otro",
];

export const INDUSTRIAS = [
  "Tecnología/Software", "Finanzas/Banca", "Consumo masivo/Retail",
  "Industrial/Manufactura", "Consultoría/Servicios profesionales",
  "Salud/Pharma", "Seguros", "Educación", "Medios/Entretenimiento",
  "Energía", "Real Estate", "Gobierno/Sector público", "Otra",
];

export const TIPOS_EMPRESA = [
  "Startup / PyME (1–99 empleados)",
  "Empresa mediana (100–999 empleados)",
  "Empresa grande nacional (1.000–4.999 empleados)",
  "Multinacional / Enterprise (+5.000 empleados)",
];

export const NIVELES = [
  "Junior/Analista", "Semi-senior", "Senior/Especialista",
  "Manager/Líder de equipo", "Senior Manager/Gerente",
  "Director/Head", "C-Level/VP", "Otro",
];

export const ALCANCES = ["Local (un país)", "Regional (varios países)", "Global"];

export const PERSONAS_A_CARGO = [
  "No, trabajo de forma individual",
  "Sí, equipo pequeño (1–5)",
  "Sí, equipo mediano (6–15)",
  "Sí, equipo grande (más de 15)",
];

export const FUNCIONES = [
  "Gestión de personas", "Presupuesto/P&L", "Estrategia", "Operaciones",
  "Ventas/Comercial", "Marketing", "Comunicación y PR", "Tecnología/Producto", "RRHH/Talento",
  "Finanzas/Contabilidad", "Legal/Compliance", "Gestión de proyectos / PMO",
  "Desarrollo de software/Web", "Diseño/UX",
  "Data/Analytics", "Innovación/I+D", "Atención al cliente", "Otra",
];

export const INTERACCIONES = [
  "Sin contacto directo",
  "Interacción ocasional",
  "Interacción frecuente con dirección ejecutiva",
  "Reporto directamente a dirección ejecutiva",
];

export const NIVELES_IDIOMA = ["Básico", "Intermedio", "Avanzado", "Nativo"] as const;

export const EXP_TOTAL = [
  "Menos de 3 años", "3–7 años", "7–12 años", "12–20 años", "Más de 20 años",
];

export const EXP_INDUSTRIA = [
  "Menos de 2 años", "2–5 años", "5–10 años", "Más de 10 años",
];

export const FORMACIONES = [
  "Secundario completo", "Terciario/Tecnicatura", "Universitario incompleto",
  "Universitario completo", "Posgrado/Especialización", "Maestría",
  "Doctorado", "Certificaciones profesionales",
];

export const HERRAMIENTAS_IA = [
  "ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity", "Midjourney",
  "DALL-E", "Runway", "Notion AI", "GitHub Copilot", "Grok", "Otra",
];

export const FRECUENCIAS_IA = [
  "Raramente",
  "Varias veces por semana",
  "Todos los días",
  "Son parte central de cómo trabajo",
];

export const USOS_IA = [
  "Redacción y comunicación", "Análisis e investigación",
  "Imágenes o contenido visual", "Código y automatización",
  "Toma de decisiones", "Aprendizaje", "Otros",
];

export const SITUACIONES = [
  { id: "empleado", label: "Estoy empleado/a actualmente", descripcion: "" },
  { id: "busqueda", label: "Estoy en búsqueda activa", descripcion: "" },
  { id: "freelance", label: "Soy freelance o consultor/a independiente", descripcion: "" },
  {
    id: "contractor",
    label: "Trabajo como contractor o bajo contrato de servicios",
    descripcion: "Tenés un contrato con una empresa (generalmente internacional) con horas fijas semanales, pero sin relación de dependencia formal local.",
  },
] as const;

export const MONEDAS = ["ARS", "USD", "MXN", "CLP", "COP", "EUR", "Otra"];

export const TIEMPOS_SIN_TRABAJO = [
  "Menos de 3 meses", "3–6 meses", "6–12 meses", "Más de 1 año",
];

export const BENEFICIOS = [
  "Bono anual", "Auto corporativo",
  "Celular corporativo", "Home office/Trabajo remoto", "Viáticos",
  "Capacitación paga por la empresa", "Stock options/Equity",
  "Comedor o ticket alimentario", "Días extra de vacaciones",
  "Seguro de vida", "Plan de retiro complementario",
  "Otro", "Ninguno de los anteriores",
];

// Tipo de cobertura médica por país (clave = valor en PAISES; "default" = fallback)
export const COBERTURA_MEDICA_POR_PAIS: Record<string, { es: string[]; en: string[] }> = {
  Argentina: {
    es: [
      "Solo obra social sindical (la obligatoria)",
      "Prepaga pagada por el empleador (OSDE, Swiss Medical, Galeno, etc.)",
      "Prepaga con copago (el empleador paga una parte, vos el resto)",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "Mandatory union health coverage only (obra social)",
      "Private health plan fully paid by employer (OSDE, Swiss Medical, Galeno, etc.)",
      "Private health plan with copay (employer pays part, you pay the rest)",
      "No employer health coverage",
    ],
  },
  México: {
    es: [
      "Solo IMSS (obligatorio)",
      "Seguro de Gastos Médicos Mayores pagado por el empleador",
      "SGMM con copago",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "IMSS only (mandatory)",
      "Major Medical Expenses Insurance (SGMM) fully paid by employer",
      "SGMM with copay",
      "No employer health coverage",
    ],
  },
  Chile: {
    es: [
      "FONASA",
      "ISAPRE pagada por el empleador",
      "ISAPRE con copago",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "FONASA",
      "ISAPRE fully paid by employer",
      "ISAPRE with copay",
      "No employer health coverage",
    ],
  },
  Colombia: {
    es: [
      "Solo EPS (obligatorio)",
      "Medicina Prepagada pagada por el empleador",
      "Prepagada con copago",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "EPS only (mandatory)",
      "Private prepaid medicine fully paid by employer",
      "Private prepaid with copay",
      "No employer health coverage",
    ],
  },
  España: {
    es: [
      "Solo Seguridad Social",
      "Seguro médico privado pagado por el empleador",
      "Seguro privado con copago",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "Social Security only",
      "Private health insurance fully paid by employer",
      "Private insurance with copay",
      "No employer health coverage",
    ],
  },
  "Estados Unidos": {
    es: [
      "Seguro de salud pagado por el empleador (HMO/PPO/HDHP)",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "Employer-sponsored health insurance (HMO/PPO/HDHP)",
      "No employer health coverage",
    ],
  },
  default: {
    es: [
      "Cobertura pública/obligatoria solamente",
      "Seguro médico privado pagado por el empleador",
      "Seguro privado con copago",
      "Sin cobertura médica del empleador",
    ],
    en: [
      "Public/mandatory coverage only",
      "Private health insurance fully paid by employer",
      "Private insurance with copay",
      "No employer health coverage",
    ],
  },
};

// Devuelve true si el tipo seleccionado implica cobertura pagada (total o parcial) por el empleador.
export function esCoberturaEmpleador(tipo?: string): boolean {
  if (!tipo) return false;
  const t = tipo.toLowerCase();
  if (t.includes("sin cobertura") || t.includes("no employer")) return false;
  // Solo obligatoria / pública
  if (
    t.startsWith("solo ") ||
    t.startsWith("fonasa") ||
    t.includes("imss only") ||
    t.includes("eps only") ||
    t.includes("social security only") ||
    t.includes("public/mandatory")
  ) return false;
  return true;
}

export const COBERTURA_ALCANCE_ES = [
  "Solo yo",
  "Yo + pareja",
  "Yo + familia completa (pareja + hijos)",
];

export const COBERTURA_ALCANCE_EN = [
  "Only me",
  "Me + partner",
  "Me + full family (partner + kids)",
];

export const GENEROS = [
  "Sí, soy mujer", "Sí, soy hombre", "Sí, soy no binario/a",
  "Prefiero no incluir este análisis",
];

export const TOTAL_PREGUNTAS = 19;

// ============= EN label maps (display only — canonical value stays Spanish) =============

export const PAISES_EN: Record<string, string> = {
  Argentina: "Argentina",
  México: "Mexico",
  Chile: "Chile",
  Colombia: "Colombia",
  España: "Spain",
  Perú: "Peru",
  Uruguay: "Uruguay",
  Brasil: "Brazil",
  Ecuador: "Ecuador",
  "Estados Unidos": "United States",
  Otro: "Other",
};

export const INDUSTRIAS_EN: Record<string, string> = {
  "Tecnología/Software": "Technology/Software",
  "Finanzas/Banca": "Finance/Banking",
  "Consumo masivo/Retail": "Consumer goods/Retail",
  "Industrial/Manufactura": "Industrial/Manufacturing",
  "Consultoría/Servicios profesionales": "Consulting/Professional services",
  "Salud/Pharma": "Healthcare/Pharma",
  Seguros: "Insurance",
  Educación: "Education",
  "Medios/Entretenimiento": "Media/Entertainment",
  Energía: "Energy",
  "Real Estate": "Real Estate",
  "Gobierno/Sector público": "Government/Public sector",
  Otra: "Other",
};

export const TIPOS_EMPRESA_EN: Record<string, string> = {
  "Startup / PyME (1–99 empleados)": "Startup / SMB (1–99 employees)",
  "Empresa mediana (100–999 empleados)": "Mid-size company (100–999 employees)",
  "Empresa grande nacional (1.000–4.999 empleados)": "Large national company (1,000–4,999 employees)",
  "Multinacional / Enterprise (+5.000 empleados)": "Multinational / Enterprise (5,000+ employees)",
};

export const NIVELES_EN: Record<string, string> = {
  "Junior/Analista": "Junior/Analyst",
  "Semi-senior": "Semi-senior",
  "Senior/Especialista": "Senior/Specialist",
  "Manager/Líder de equipo": "Manager/Team lead",
  "Senior Manager/Gerente": "Senior Manager",
  "Director/Head": "Director/Head",
  "C-Level/VP": "C-Level/VP",
  Otro: "Other",
};

export const NIVELES_IDIOMA_EN: Record<string, string> = {
  Básico: "Basic",
  Intermedio: "Intermediate",
  Avanzado: "Advanced",
  Nativo: "Native",
};

export function labelOf(value: string | undefined | null, map: Record<string, string>, isEN: boolean): string {
  if (!value) return "";
  if (!isEN) return value;
  return map[value] ?? value;
}
