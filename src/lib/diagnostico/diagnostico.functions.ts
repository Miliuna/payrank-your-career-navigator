import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_B, buildUserPromptPartA, buildUserPromptPartB } from "./prompt";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

// ---------- Crear diagnóstico desde el state del cliente ----------

const createDiagnosticoSchema = z.object({
  modo: z.string().optional(),
  plan: z.string().optional(),
  respuestas: z.record(z.string(), z.unknown()).optional(),
  inferencia: z.unknown().optional(),
  inferenciaValidada: z.boolean().optional(),
  documentos: z.record(z.string(), z.unknown()).optional(),
  betaToken: z.string().min(1).max(128).optional(),
  datosExtraidos: z.record(z.string(), z.unknown()).nullable().optional(),
  codigoReferido: z.string().max(64).optional(),
});

function mapStateToRow(input: z.infer<typeof createDiagnosticoSchema>) {
  const r = (input.respuestas ?? {}) as Record<string, unknown>;
  const pais = r.pais === "Otro" ? r.paisOtro : r.pais;
  const industria = r.industria === "Otra" ? r.industriaOtra : r.industria;
  const nivel = r.nivel === "Otro" ? r.nivelOtro : r.nivel;
  const funciones = Array.isArray(r.funciones) ? (r.funciones as string[]) : null;

  const salario = typeof r.salario === "number" ? r.salario
    : typeof r.salarioAnterior === "number" ? r.salarioAnterior
    : null;
  const moneda = (r.moneda as string) ?? (r.monedaAnterior as string) ?? null;

  // Empaquetar metadatos en puesto_descripcion para que el prompt los lea
  const baseDesc = (r.descripcionPuesto as string) ?? (r.funcionesTexto as string) ?? "";
  const contractorMeta = r.situacion === "contractor"
    ? `\n\n[Contractor]\nHoras semanales: ${r.contractorHoras ?? "n/d"}\nModalidad de pago: ${r.contractorPago ?? "n/d"}`
    : "";
  const subCasoC = r.subCasoC as string | undefined;
  const subCasoMeta = subCasoC
    ? `\n\n[Subcaso Modo C: ${subCasoC === "oferta" ? "Ya tengo una oferta concreta" : "Tengo una entrevista / estoy en proceso de selección"}]`
    : "";
  const targetDireccionD = r.targetDireccionD as string | undefined;
  const targetDirMeta = targetDireccionD
    ? `\n\n[Dirección objetivo — Modo D]\n${targetDireccionD}`
    : "";

  return {
    // TEMPORAL: hardcodeado hasta que Stripe esté activo.
    tipo_usuario: "beta_gratuito",
    pago_confirmado: true,
    monto_pagado_usd: 0,
    modo: input.modo ?? null,
    plan_elegido: input.plan ?? null,
    pais_rol: (pais as string) ?? null,
    industria: (industria as string) ?? null,
    tipo_empresa: (r.tipoEmpresa as string) ?? null,
    nivel: (nivel as string) ?? null,
    alcance: (r.alcance as string) ?? null,
    funciones,
    equipo: (r.personasACargo as string) ?? null,
    interaccion_clevel: (r.interaccion as string) ?? null,
    idiomas: r.sinIdiomas ? null : (r.idiomas ?? null),
    anos_experiencia_total: (r.expTotal as string) ?? null,
    anos_experiencia_industria: (r.expIndustria as string) ?? null,
    anos_puesto_actual: null,
    formacion: Array.isArray(r.formacion) ? (r.formacion as string[]) : null,
    certificaciones: r.sinCertificaciones ? [] : (Array.isArray(r.certificaciones) ? (r.certificaciones as string[]) : null),
    herramientas_ia: Array.isArray(r.herramientasIA) ? r.herramientasIA : null,
    frecuencia_ia: (r.frecuenciaIA as string) ?? null,
    uso_ia: Array.isArray(r.usoIA) ? (r.usoIA as string[]) : null,
    situacion_laboral: (r.situacion as string) ?? null,
    salario_actual: salario,
    moneda_actual: moneda,
    salario_tipo: (r.brutoNeto as string) ?? null,
    beneficios: Array.isArray(r.beneficios) ? (r.beneficios as string[]) : null,
    puesto_descripcion: (baseDesc + contractorMeta + subCasoMeta + targetDirMeta) || null,
    linkedin_url: (r.linkedinUrl as string) ?? null,
    genero: (r.genero as string) ?? null,
    mail: (r.email as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    inferencia_valuacion: (input.inferencia as object) ?? null,
    inferencia_validada: input.inferenciaValidada ?? false,
    datos_extraidos_documento: (input.datosExtraidos as object | null) ?? null,
    referido_por: input.codigoReferido ?? null,
  };
}

export const createDiagnostico = createServerFn({ method: "POST" })
  .inputValidator((input) => createDiagnosticoSchema.parse(input))
  .handler(async ({ data }) => {
    const row = mapStateToRow(data) as Record<string, unknown>;

    // Si vino con beta token, validar y marcar como beta_gratuito + pago_confirmado
    if (data.betaToken) {
      const { data: tok, error: tokErr } = await supabaseAdmin
        .from("beta_tokens" as never)
        .select("id, token, usado_count, max_usos, activo")
        .eq("token", data.betaToken)
        .maybeSingle();
      if (tokErr) throw new Error(tokErr.message);
      const t = tok as { id: string; usado_count: number; max_usos: number; activo: boolean } | null;
      if (!t || !t.activo) throw new Error("Token beta inválido");
      if (t.usado_count >= t.max_usos) throw new Error("Token beta agotado");

      row.tipo_usuario = "beta_gratuito";
      row.pago_confirmado = true;
      row.monto_pagado_usd = 0;

      await supabaseAdmin
        .from("beta_tokens" as never)
        .update({ usado_count: t.usado_count + 1 } as never)
        .eq("id", t.id);
    }

    const { data: created, error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .insert(row as never)
      .select("id, link_unico")
      .single();
    if (error) {
      console.error("[createDiagnostico] insert error:", error);
      throw new Error(error.message);
    }
    return created as { id: string; link_unico: string };
  });

// ---------- Simular pago (solo dev) — marca como beta_gratuito ----------

export const simulatePayment = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Simulación de pago deshabilitada en producción");
    }
    const { error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .update({
        pago_confirmado: true,
        monto_pagado_usd: 0,
        tipo_usuario: "beta_gratuito",
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Confirmar acceso beta (consume token) ----------

export const confirmBetaAccess = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), token: z.string().min(1).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: tok, error: tokErr } = await supabaseAdmin
      .from("beta_tokens" as never)
      .select("id, usado_count, max_usos, activo")
      .eq("token", data.token)
      .maybeSingle();
    if (tokErr) throw new Error(tokErr.message);
    const t = tok as { id: string; usado_count: number; max_usos: number; activo: boolean } | null;
    if (!t || !t.activo) throw new Error("Token beta inválido");
    if (t.usado_count >= t.max_usos) throw new Error("Token beta agotado");

    const { error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .update({
        pago_confirmado: true,
        monto_pagado_usd: 0,
        tipo_usuario: "beta_gratuito",
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("beta_tokens" as never)
      .update({ usado_count: t.usado_count + 1 } as never)
      .eq("id", t.id);

    return { ok: true };
  });

// ---------- Llamada a Anthropic ----------

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Llama a Anthropic con reintentos automáticos en caso de 529 (overloaded_error).
 * delays define las esperas entre intentos. La cantidad de intentos es delays.length + 1.
 */
async function fetchAnthropicWithRetry(
  body: Record<string, unknown>,
  delaysMs: number[],
): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada");

  let lastRes: Response | null = null;
  for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.status !== 529) return res;
    lastRes = res;
    const wait = delaysMs[attempt];
    if (wait != null) {
      console.warn(`[anthropic] 529 overloaded, intento ${attempt + 1}, esperando ${wait}ms`);
      await sleep(wait);
    }
  }
  return lastRes!;
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  console.log(`[callAnthropic] model=${MODEL} systemLen=${systemPrompt.length} userLen=${userPrompt.length}`);
  const res = await fetchAnthropicWithRetry(
    {
      model: MODEL,
      max_tokens: 32000,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    },
    [3000, 5000, 8000],
  );

  if (!res.ok) {
    const txt = await res.text();
    console.error(`[callAnthropic] HTTP ${res.status} error:`, txt.slice(0, 1000));
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 500)}`);
  }
  const rawJson = await res.text();
  let json: {
    content?: Array<{ type: string; text?: string }>;
    stop_reason?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  try {
    json = JSON.parse(rawJson);
  } catch (e) {
    console.error(`[callAnthropic] failed to parse response JSON:`, rawJson.slice(0, 500));
    throw new Error(`Anthropic response JSON parse failed: ${String(e)}`);
  }
  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  console.log(`[callAnthropic] stop_reason=${json.stop_reason} output_tokens=${json.usage?.output_tokens} textLen=${text.length}`);
  if (json.stop_reason === "max_tokens") {
    console.error(`[callAnthropic] RESPUESTA TRUNCADA por max_tokens. tail=`, text.slice(-300));
  }
  if (!text) {
    console.error(`[callAnthropic] empty text in response. Full json:`, rawJson.slice(0, 500));
  }
  return text;
}

function tryParseJson(text: string): unknown | null {
  let cleaned = text.trim();
  // 0) Strip leading/trailing markdown fences (most common failure mode)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try { return JSON.parse(cleaned); } catch { /* noop */ }
  // 1) Fence markdown ```json ... ``` anywhere in text
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch { /* noop */ }
  }
  // 2) Extraer primer objeto JSON balanceado, ignorando llaves dentro de strings
  const first = cleaned.indexOf("{");
  if (first !== -1) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = first; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(cleaned.slice(first, i + 1)); } catch { return null; }
        }
      }
    }
    // 3) Último intento: slice ingenuo first..last
    const last = cleaned.lastIndexOf("}");
    if (last > first) {
      try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { /* noop */ }
    }
  }
  return null;
}

// ---------- Tipo de cambio ----------

type TipoCambio = { moneda: string; valor: number; fuente: string; fecha: string };

function detectCurrency(pais: string | null | undefined): { code: string | null; usdOnly: boolean } {
  if (!pais) return { code: null, usdOnly: false };
  const p = pais.toLowerCase();
  if (p.includes("argentin")) return { code: "ARS", usdOnly: false };
  if (p.includes("méxico") || p.includes("mexico")) return { code: "MXN", usdOnly: false };
  if (p.includes("chile")) return { code: "CLP", usdOnly: false };
  if (p.includes("colombia")) return { code: "COP", usdOnly: false };
  if (p.includes("espa") || p.includes("spain")) return { code: "EUR", usdOnly: false };
  if (p.includes("brasil") || p.includes("brazil")) return { code: "BRL", usdOnly: false };
  if (
    p === "usa" || p === "eeuu" || p.includes("estados unidos") ||
    p.includes("united states") || p.includes("ee.uu")
  ) return { code: "USD", usdOnly: true };
  if (p === "uk" || p.includes("united kingdom") || p.includes("reino unido")) return { code: "GBP", usdOnly: true };
  if (p.includes("australia")) return { code: "AUD", usdOnly: true };
  if (p.includes("canad")) return { code: "CAD", usdOnly: true };
  return { code: null, usdOnly: false };
}

const FUENTE_FX: Record<string, string> = {
  ARS: "BCRA (Banco Nación)",
  MXN: "Banxico",
  CLP: "Banco Central de Chile",
  COP: "Banco de la República",
  EUR: "Banco Central Europeo (BCE)",
  BRL: "Banco Central do Brasil",
};

async function fetchFxRate(currency: string): Promise<TipoCambio | null> {
  const now = new Date().toISOString();
  try {
    if (currency === "ARS") {
      const r = await fetch("https://dolarapi.com/v1/dolares/oficial");
      if (r.ok) {
        const j = (await r.json()) as { venta?: number };
        const valor = Number(j.venta);
        if (isFinite(valor) && valor > 0) {
          return { moneda: "ARS", valor, fuente: FUENTE_FX.ARS, fecha: now };
        }
      }
    } else {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      if (r.ok) {
        const j = (await r.json()) as { rates?: Record<string, number> };
        const valor = Number(j?.rates?.[currency]);
        if (isFinite(valor) && valor > 0) {
          return { moneda: currency, valor, fuente: FUENTE_FX[currency] ?? "exchangerate-api.com", fecha: now };
        }
      }
    }
  } catch (e) {
    console.error("[fetchFxRate] error:", e);
  }
  // Fallback: último valor guardado para misma moneda
  try {
    const { data } = await supabaseAdmin
      .from("diagnosticos" as never)
      .select("tipo_cambio_utilizado, created_at")
      .not("tipo_cambio_utilizado", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);
    if (Array.isArray(data)) {
      for (const r of data as Array<{ tipo_cambio_utilizado: Partial<TipoCambio> | null }>) {
        const tc = r.tipo_cambio_utilizado;
        if (tc && tc.moneda === currency && typeof tc.valor === "number") {
          return {
            moneda: currency,
            valor: tc.valor,
            fuente: (tc.fuente ?? FUENTE_FX[currency] ?? "valor anterior") + " (último disponible)",
            fecha: tc.fecha ?? "",
          };
        }
      }
    }
  } catch (e) {
    console.error("[fetchFxRate] fallback error:", e);
  }
  return null;
}


export const generateDiagnostico = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
    const { data: row, error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Diagnóstico no encontrado");

    const record = row as Record<string, unknown>;
    if (!record.pago_confirmado) {
      throw new Error("PAYMENT_REQUIRED");
    }

    // Si ya fue generado, devolverlo tal cual (idempotencia)
    if (record.resultado_json) {
      return { id: record.id as string, link_unico: record.link_unico as string };
    }

    // Tipo de cambio: se consulta UNA vez ANTES de Anthropic y se inyecta en los prompts
    // para que el modelo use exactamente el mismo valor que se muestra en el reporte.
    const { code: currency, usdOnly } = detectCurrency(record.pais_rol as string | null);
    const tipoCambio: TipoCambio | null =
      currency && !usdOnly ? await fetchFxRate(currency) : null;
    console.log("[generateDiagnostico] tipoCambio:", tipoCambio);

    // Generación en 2 llamadas paralelas para evitar timeout upstream (≥60s).
    let promptA: string;
    let promptB: string;
    try {
      promptA = buildUserPromptPartA(record, tipoCambio);
      promptB = buildUserPromptPartB(record, tipoCambio);
    } catch (promptErr) {
      console.error("[generateDiagnostico] error construyendo prompts (modo:", record.modo, "):", promptErr);
      throw promptErr;
    }

    async function genPart(prompt: string, label: string, systemPrompt: string): Promise<Record<string, unknown>> {
      let parsed: unknown | null = null;
      let lastRaw = "";
      for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
        if (attempt > 0) await sleep(2000);
        try {
          console.log(`[generateDiagnostico:${label}] intento ${attempt + 1} — promptLen=${prompt.length}`);
          lastRaw = await callAnthropic(systemPrompt, prompt);
          console.log(`[generateDiagnostico:${label}] rawLen=${lastRaw.length} raw[:300]=`, lastRaw.slice(0, 300));
          parsed = tryParseJson(lastRaw);
          if (!parsed) {
            console.error(`[generateDiagnostico:${label}] tryParseJson devolvió null. rawLen=${lastRaw.length} raw[:500]=`, lastRaw.slice(0, 500));
          }
        } catch (e) {
          console.error(`[generateDiagnostico:${label}] intento ${attempt + 1} excepción:`, e);
          lastRaw = "";
        }
      }
      if (!parsed || typeof parsed !== "object") {
        console.error(`[generateDiagnostico:${label}] FALLO DEFINITIVO. rawLen=${lastRaw.length} raw[:500]=`, lastRaw.slice(0, 500));
        throw new Error("GENERATION_FAILED");
      }
      return parsed as Record<string, unknown>;
    }

    const [partA, partB] = await Promise.all([
      genPart(promptA, "parteA", SYSTEM_PROMPT),
      genPart(promptB, "parteB", SYSTEM_PROMPT_B),
    ]);
    const parsed: Record<string, unknown> = { ...partA, ...partB };

    const nivelConfianza = (parsed.seccion_1 as Record<string, unknown> | undefined)?.nivel_confianza;

    const { error: upErr } = await supabaseAdmin
      .from("diagnosticos" as never)
      .update({
        resultado_json: parsed,
        nivel_confianza: typeof nivelConfianza === "string" ? nivelConfianza : null,
        tipo_cambio_utilizado: tipoCambio,
      } as never)
      .eq("id", data.id);
    if (upErr) {
      console.error("[generateDiagnostico] update error:", upErr);
      throw new Error("GENERATION_FAILED");
    }


    return { id: record.id as string, link_unico: record.link_unico as string };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[generateDiagnostico] error final (msg=" + msg + "):", err);
      if (msg === "PAYMENT_REQUIRED") throw new Error("Pago no confirmado");
      if (msg === "GENERATION_FAILED") throw new Error("No pudimos generar tu diagnóstico. Intentá nuevamente en unos minutos.");
      throw new Error(`No pudimos generar tu diagnóstico (${msg.slice(0, 120)}). Intentá nuevamente en unos minutos.`);
    }
  });

// ---------- Obtener diagnóstico por id ----------

export const getDiagnostico = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Diagnóstico no encontrado");
    // Round-trip via JSON to satisfy serializable return constraint
    // Round-trip via JSON to satisfy serializable return constraint
    const safe = JSON.parse(JSON.stringify(row)) as Json;
    return safe;
  });

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

// ---------- Extracción de datos desde documento subido ----------

const EXTRACT_SYSTEM = `Extraé datos profesionales y de compensación del documento siguiendo las instrucciones al pie de la letra. Respond ONLY with raw JSON. Do not use markdown code blocks, backticks, or any formatting wrappers. Your response must start with { and end with }. No text before or after the JSON object.

REGLA CRÍTICA — herramientas_ia_inferidas: incluir EXCLUSIVAMENTE herramientas de IA generativa o machine learning (ChatGPT, Claude, Gemini, Copilot, GitHub Copilot, Midjourney, Perplexity, Notion AI, DALL-E, Cursor, Whisper, ElevenLabs, Runway, Jasper, Synthesia, Stable Diffusion, etc.). NUNCA incluir software de gestión, encuestas, ERP, CRM, BI, HRIS ni productividad: Qualtrics, SuccessFactors, SAP, Workday, Slik, Salesforce, HubSpot, Excel, Power BI, Tableau, Looker, Google Analytics, Jira, Asana, Slack, Office, y similares NO son herramientas de IA. Si no hay herramientas de IA generativa, devolver [].`;

const EXTRACT_USER_INSTRUCTIONS = `El documento puede estar truncado. Extraé toda la información disponible del fragmento recibido.

Extraé estos campos si están presentes:
- nombre_inferido
- titulo_puesto
- nivel_jerarquico_inferido
- industria_inferida
- tipo_empresa_inferida
- anos_experiencia_total_inferidos
- anos_experiencia_industria_inferidos
- formacion (array)
- certificaciones (array)
- idiomas (array con nivel si figura)
- funciones_inferidas (array)
- alcance_inferido
- equipo_inferido
- herramientas_ia_inferidas (array) — IMPORTANTE: incluir SOLO herramientas de IA generativa o machine learning de uso profesional. Ejemplos válidos: ChatGPT, Claude, Gemini, Copilot, GitHub Copilot, Midjourney, Perplexity, Notion AI, DALL-E, Stable Diffusion, Runway, Cursor, Whisper, ElevenLabs, Jasper, Synthesia. NUNCA incluir software de gestión, encuestas, BI, ERP, CRM o productividad aunque aparezcan en el CV (NO incluir: Qualtrics, SuccessFactors/SSFF, SAP, Workday, Slik, Salesforce, HubSpot, Excel, Power BI, Tableau, Looker, Google Analytics, Jira, Asana, Notion sin AI, Office, Slack). Si el CV no menciona ninguna herramienta de IA generativa o ML, devolver array vacío [].
- salario_actual_inferido
- moneda_inferida
- tipo_salario_inferido (bruto/neto)
- beneficios_inferidos (array)
- linkedin_url (si figura)

Para cada campo que NO puedas inferir con certeza del documento, devolvé null.
No inventes datos que no están explícitamente en el documento.
Respond ONLY with raw JSON. Do not use markdown code blocks, backticks, or any formatting wrappers. Your response must start with { and end with }. No text before or after the JSON object.`;

const extractInputSchema = z.union([
  z.object({
    kind: z.literal("text"),
    text: z.string().min(1).max(100_000),
  }),
  z.object({
    kind: z.literal("pdf"),
    base64: z.string().min(1).max(4_000_000),
  }),
]);

// Per-IP in-memory rate limiter (best-effort; resets when the worker restarts).
const extractRateLimit = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 10; // 10 extractions per IP per hour

function checkExtractRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = extractRateLimit.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    extractRateLimit.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

export const extractFromDocument = createServerFn({ method: "POST" })
  .inputValidator((input) => extractInputSchema.parse(input))
  .handler(async ({ data }) => {
    // Rate limit por IP para evitar abuso del endpoint (consumo de créditos Anthropic).
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      const ip =
        getRequestHeader("cf-connecting-ip") ||
        getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
        getRequestHeader("x-real-ip") ||
        "unknown";
      if (!checkExtractRateLimit(ip)) {
        throw new Error("Demasiadas solicitudes. Esperá unos minutos antes de volver a intentar.");
      }
    } catch (e) {
      // Si no podemos leer la IP por algún motivo de runtime, no bloqueamos —
      // pero los límites de tamaño + validación siguen aplicando.
      if (e instanceof Error && e.message.startsWith("Demasiadas")) throw e;
    }

    // Límite temporal por rate limit de Anthropic Tier 1 (30k tpm).
    const TEXT_MAX_CHARS = 6_000;
    const PDF_MAX_TOKENS = 800;
    const TEXT_MAX_TOKENS = 1000;

    let userContent;
    let maxTokens: number;
    if (data.kind === "text") {
      const truncated =
        data.text.length > TEXT_MAX_CHARS
          ? data.text.slice(0, TEXT_MAX_CHARS) + "\n\n[documento truncado por longitud]"
          : data.text;
      userContent = [
        { type: "text", text: `Documento:\n\n${truncated}\n\n${EXTRACT_USER_INSTRUCTIONS}` },
      ];
      maxTokens = TEXT_MAX_TOKENS;
    } else {
      userContent = [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: data.base64 },
        },
        { type: "text", text: EXTRACT_USER_INSTRUCTIONS },
      ];
      maxTokens = PDF_MAX_TOKENS;
    }

    const res = await fetchAnthropicWithRetry(
      {
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0,
        system: EXTRACT_SYSTEM,
        messages: [{ role: "user", content: userContent }],
      },
      [3000, 5000],
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error("[extractFromDocument] Anthropic error:", res.status, txt.slice(0, 500));
      throw new Error("No pudimos procesar el documento. Intentá nuevamente o pegá el texto manualmente.");
    }
    const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = json.content?.find((c) => c.type === "text")?.text ?? "";

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* noop */ }
      }
    }
    if (!parsed) {
      console.error("[extractFromDocument] JSON parse failed. Raw:", text.slice(0, 500));
      throw new Error("No pudimos procesar el documento. Intentá nuevamente o pegá el texto manualmente.");
    }
    return JSON.parse(JSON.stringify(parsed)) as Json;
  });