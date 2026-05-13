// System prompt v2.0 — PayRank
// IMPORTANTE: este es un placeholder. El system prompt definitivo
// debe pegarse exactamente como lo entrega el equipo de producto.
// Reemplazar TODO el contenido del template literal de abajo
// por el texto definitivo del prompt maestro v2.0.
export const SYSTEM_PROMPT = `[PLACEHOLDER — pegar acá el system prompt v2.0 definitivo de PayRank]

Mientras tanto, comportate como un compensólogo senior y devolvé EXCLUSIVAMENTE un JSON válido con la siguiente estructura mínima:

{
  "rango_actual": { "min": number, "max": number, "moneda": "USD" },
  "rango_mercado": { "min": number, "max": number, "moneda": "USD" },
  "posicionamiento": "por_debajo" | "en_rango" | "por_encima",
  "nivel_confianza": "Alto" | "Medio" | "Bajo",
  "justificacion_confianza": string,
  "factores_positivos": string[],
  "factores_negativos": string[],
  "recomendaciones": string[],
  "resumen_ejecutivo": string
}

No incluyas texto fuera del JSON.`;

type AnyRecord = Record<string, unknown>;

const MODO_DESCRIPCION: Record<string, string> = {
  A: "A — Quiero saber cuánto valgo en el mercado",
  B: "B — Estoy en una negociación salarial",
  C: "C — Estoy preparando una entrevista para un puesto específico",
  D: "D — Estoy evaluando una oferta concreta",
};

function v(value: unknown, fallback = "no declarado"): string {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  const str = String(value).trim();
  return str.length ? str : fallback;
}

export function buildUserPrompt(d: AnyRecord): string {
  const modo = typeof d.modo === "string" ? d.modo : "";
  const modoDesc = MODO_DESCRIPCION[modo] ?? v(d.modo);

  const salario = d.salario_actual != null
    ? `${v(d.salario_actual)} ${v(d.moneda_actual, "")} ${v(d.salario_tipo, "")}`.trim()
    : "no declarado";

  return `Situación de consulta: ${modoDesc}

PERFIL:
País donde opera el rol: ${v(d.pais_rol)}
Industria: ${v(d.industria)}
Tipo de empresa: ${v(d.tipo_empresa)}
Nivel jerárquico declarado: ${v(d.nivel)}
Alcance del rol: ${v(d.alcance)}
Funciones reales: ${v(d.funciones)}
Personas a cargo: ${v(d.equipo)}
Interacción con alta dirección: ${v(d.interaccion_clevel)}
Idiomas: ${v(d.idiomas)}
Años de experiencia total: ${v(d.anos_experiencia_total)}
Años de experiencia en la industria: ${v(d.anos_experiencia_industria)}
Años en el puesto actual: ${v(d.anos_puesto_actual)}
Formación: ${v(d.formacion)}
Certificaciones: ${v(d.certificaciones)}
Herramientas de IA: ${v(d.herramientas_ia)}
Frecuencia de uso de IA: ${v(d.frecuencia_ia)}
Uso de IA para: ${v(d.uso_ia)}
Situación laboral: ${v(d.situacion_laboral)}
Salario bruto mensual actual: ${salario}
Última revisión salarial: no declarada
Beneficios actuales: ${v(d.beneficios)}
Descripción del puesto: ${v(d.puesto_descripcion)}
Género: ${v(d.genero, "no solicitado")}

Inferencia de valuación validada: ${v(d.inferencia_valuacion)}

Generá el PayRank completo aplicando todos los ajustes compensológicos del system prompt.

Respondé ÚNICAMENTE con JSON válido sin texto adicional.`;
}
