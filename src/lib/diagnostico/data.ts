import type { Modo } from "./types";

export const TITULOS_MODO: Record<Modo, string> = {
  A: "Quiero saber si me pagan en forma competitiva",
  B: "Quiero pedir un aumento o una revisión salarial",
  C: "Tengo una oferta o entrevista",
  D: "Quiero dar mi próximo salto de carrera",
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
  "Multinacional global (+5.000 empleados)",
  "Empresa regional mediana (500–5.000 empleados)",
  "Empresa local grande (100–500 empleados)",
  "PyME/Startup (menos de 100 empleados)",
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
  "Ventas/Comercial", "Marketing", "Tecnología/Producto", "RRHH/Talento",
  "Finanzas/Contabilidad", "Legal/Compliance", "Proyectos/PMO",
  "Project Management", "Desarrollo de software/Web", "Diseño/UX",
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
  "Obra social/Seguro médico", "Bono anual", "Auto corporativo",
  "Celular corporativo", "Home office/Trabajo remoto", "Viáticos",
  "Capacitación paga por la empresa", "Stock options/Equity",
  "Comedor o ticket alimentario", "Días extra de vacaciones",
  "Seguro de vida", "Plan de retiro complementario",
  "Otro", "Ninguno de los anteriores",
];

export const GENEROS = [
  "Sí, soy mujer", "Sí, soy hombre", "Sí, soy no binario/a",
  "Prefiero no incluir este análisis",
];

export const TOTAL_PREGUNTAS = 19;
