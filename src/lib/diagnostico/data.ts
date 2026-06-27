import type { Modo } from "./types";

export const TITULOS_MODO: Record<Modo, string> = {
  A: "Quiero saber si me pagan en forma competitiva",
  B: "Quiero pedir un aumento o una revisión salarial",
  C: "Tengo una oferta o entrevista",
  D: "Quiero dar mi próximo salto de carrera",
};

export const TITULOS_MODO_EN: Record<Modo, string> = {
  A: "AM I BEING PAID COMPETITIVELY?",
  B: "I WANT TO ASK FOR A RAISE OR REVIEW",
  C: "I HAVE AN OFFER OR INTERVIEW",
  D: "I'M PLANNING MY NEXT CAREER MOVE",
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
  "Doctorado",
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
  {
    id: "contractor",
    label: "Trabajo como contractor o bajo contrato de servicios",
    descripcion: "Trabajás bajo contrato de servicios, sin relación de dependencia formal local. Este caso todavía no está cubierto por este diagnóstico — te va a llevar a la lista de espera de Modo E, el modo que estamos construyendo específicamente para esta situación.",
  },
] as const;

export const MONEDAS = ["ARS", "USD", "MXN", "CLP", "COP", "PEN", "BRL", "EUR", "Otra"];

export const TIEMPOS_SIN_TRABAJO = [
  "Menos de 3 meses", "3–6 meses", "6–12 meses", "Más de 1 año",
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

export const MOTIVACIONES = [
  "Me negaron un aumento, me ignoraron en la última revisión, o llevo más de 12 meses sin ajuste",
  "Mis responsabilidades crecieron pero mi compensación no se actualizó",
  "No tengo un evento puntual, pero quiero un panorama objetivo de mi valor de mercado",
];

export const MOTIVACIONES_B = [
  "Quiero pedir un aumento en mi trabajo actual",
  "No tuve revisión salarial en más de 12 meses",
  "Mis responsabilidades crecieron pero mi sueldo no se movió",
  "Me van a dar una devolución de desempeño y quiero ir preparado/a",
  "Quiero saber cuánto pedir antes de la conversación",
  "Quiero entender si mi empresa me paga por debajo del mercado",
];

export const MOTIVACIONES_B_EN = [
  "I want to ask for a raise at my current job",
  "I haven't had a salary review in over 12 months",
  "My responsibilities grew but my salary didn't",
  "I have a performance review coming and want to be prepared",
  "I want to know how much to ask for before the conversation",
  "I want to understand if my company is paying me below market",
];

export const MOTIVACIONES_C = [
  "Tengo una entrevista y me van a preguntar mis pretensiones",
  "Recibí una oferta y necesito saber si la acepto, negocio o la dejo pasar",
  "Estoy en búsqueda activa y quiero prepararme antes de que empiece el proceso",
];

export const MOTIVACIONES_C_EN = [
  "I have an interview and they're going to ask about my salary expectations",
  "I received an offer and need to know whether to accept, negotiate, or walk away",
  "I'm actively job hunting and want to be ready before the process starts",
];

export const MOTIVACIONES_EN = [
  "I was denied a raise, ignored in the last review, or haven't had an adjustment in 12+ months",
  "My responsibilities grew but my compensation wasn't updated",
  "There's no specific trigger, but I want an objective picture of my market value",
];

export const ANTIGUEDAD_ROL = [
  "Menos de 6 meses",
  "6 meses a 1 año",
  "1 a 3 años",
  "3 a 5 años",
  "Más de 5 años",
];

export const ANTIGUEDAD_ROL_EN = [
  "Less than 6 months",
  "6 months to 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "More than 5 years",
];

export const TIPO_NEGOCIACION = [
  "Aumento por inflación o ajuste de mercado",
  "Reconocimiento de funciones que crecieron",
  "Cambio de nivel formal con incremento",
];

export const TIPO_NEGOCIACION_EN = [
  "Raise for inflation or market adjustment",
  "Recognition of expanded responsibilities",
  "Formal level change with pay increase",
];

export const ORIENTACION_CARRERA = [
  "Quiero liderar personas y equipos",
  "Quiero ser referente técnico / especialista",
  "No lo tengo definido aún",
];

export const ORIENTACION_CARRERA_EN = [
  "I want to lead people and teams",
  "I want to be a technical expert / specialist",
  "I haven't decided yet",
];

export const PUNTO_PARTIDA_SALTO = [
  "Desde mi rol actual — quiero saber qué sigue naturalmente",
  "Desde un rol previo que quiero retomar o fortalecer",
  "Hacia un rol completamente nuevo para mí",
];

export const PUNTO_PARTIDA_SALTO_EN = [
  "From my current role — what comes next naturally",
  "From a previous role I want to return to or strengthen",
  "Toward a completely new role for me",
];

export const MOTIVACIONES_D = [
  "Sé a qué rol quiero llegar — necesito saber qué me falta y cómo posicionarme",
  "Siento que es momento de dar un paso pero no tengo claro cuál es el siguiente",
  "Quiero saber cuánto vale el siguiente nivel antes de decidir si el esfuerzo vale la pena",
  "Estoy actualizando mi CV y quiero saber cómo me posiciona el mercado hoy",
];

export const MOTIVACIONES_D_EN = [
  "I know what role I want — I need to know what's missing and how to position myself",
  "I feel it's time to move but I'm not sure what the next step is",
  "I want to know what the next level pays before deciding if the effort is worth it",
  "I'm updating my CV and want to know how the market sees me today",
];

// v3.1
export const TOTAL_PREGUNTAS = 24;

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
