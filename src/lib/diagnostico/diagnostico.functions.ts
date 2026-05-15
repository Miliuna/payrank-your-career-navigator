import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5";

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

  return {
    tipo_usuario: "pago",
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
    puesto_descripcion: (r.descripcionPuesto as string) ?? (r.funcionesTexto as string) ?? null,
    linkedin_url: null,
    genero: (r.genero as string) ?? null,
    mail: (r.email as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    inferencia_valuacion: (input.inferencia as object) ?? null,
    inferencia_validada: input.inferenciaValidada ?? false,
    datos_extraidos_documento: (input.datosExtraidos as object | null) ?? null,
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

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 500)}`);
  }
  const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  return text;
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    // intentar extraer un bloque JSON
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* noop */ }
    }
    return null;
  }
}

// ---------- Generar diagnóstico ----------

export const generateDiagnostico = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Diagnóstico no encontrado");

    const record = row as Record<string, unknown>;
    if (!record.pago_confirmado) {
      throw new Error("El pago no está confirmado para este diagnóstico");
    }

    // Si ya fue generado, devolverlo tal cual (idempotencia)
    if (record.resultado_json) {
      return { id: record.id as string, link_unico: record.link_unico as string };
    }

    const userPrompt = buildUserPrompt(record);

    let parsed: unknown | null = null;
    let lastRaw = "";
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        lastRaw = await callAnthropic(SYSTEM_PROMPT, userPrompt);
        parsed = tryParseJson(lastRaw);
      } catch (e) {
        console.error(`[generateDiagnostico] intento ${attempt + 1} falló:`, e);
      }
    }

    if (!parsed) {
      throw new Error(`Anthropic no devolvió JSON válido. Raw: ${lastRaw.slice(0, 300)}`);
    }

    const nivelConfianza = (parsed as Record<string, unknown>).nivel_confianza;

    const { error: upErr } = await supabaseAdmin
      .from("diagnosticos" as never)
      .update({
        resultado_json: parsed,
        nivel_confianza: typeof nivelConfianza === "string" ? nivelConfianza : null,
      } as never)
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);

    return { id: record.id as string, link_unico: record.link_unico as string };
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

const EXTRACT_SYSTEM = `Extraé todos los datos profesionales y de compensación que encuentres en este documento. Respondé ÚNICAMENTE con JSON válido sin texto adicional.`;

const EXTRACT_USER_INSTRUCTIONS = `Extraé estos campos si están presentes:
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
- herramientas_ia_inferidas (array)
- salario_actual_inferido
- moneda_inferida
- tipo_salario_inferido (bruto/neto)
- beneficios_inferidos (array)
- linkedin_url (si figura)

Para cada campo que NO puedas inferir con certeza del documento, devolvé null.
No inventes datos que no están explícitamente en el documento.
Respondé un único objeto JSON, sin markdown ni explicaciones.`;

const extractInputSchema = z.union([
  z.object({
    kind: z.literal("text"),
    text: z.string().min(1).max(200_000),
  }),
  z.object({
    kind: z.literal("pdf"),
    base64: z.string().min(1).max(20_000_000),
  }),
]);

export const extractFromDocument = createServerFn({ method: "POST" })
  .inputValidator((input) => extractInputSchema.parse(input))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    if (!lovableKey) throw new Error("LOVABLE_API_KEY no configurada");

    const userContent =
      data.kind === "text"
        ? [
            { type: "text", text: `Documento:\n\n${data.text.slice(0, 100_000)}\n\n${EXTRACT_USER_INSTRUCTIONS}` },
          ]
        : [
            {
              type: "image_url",
              image_url: { url: `data:application/pdf;base64,${data.base64}` },
            },
            { type: "text", text: EXTRACT_USER_INSTRUCTIONS },
          ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EXTRACT_SYSTEM },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Lovable AI ${res.status}: ${txt.slice(0, 500)}`);
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content ?? "";

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* noop */ }
      }
    }
    if (!parsed) throw new Error("La extracción no devolvió JSON válido");
    return JSON.parse(JSON.stringify(parsed)) as Json;
  });