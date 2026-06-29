import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_B, SYSTEM_PROMPT_B_MODO_C, buildUserPromptPartA, buildUserPromptPartB } from "./prompt";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}


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
  const contractorIncrementoTxt = r.situacion === "contractor" && r.incrementoUltimoAnio === "si"
    ? `\nAumento de tarifa últimos 12 meses: sí, ${r.incrementoUltimoAnioPct ?? "?"}%`
    : r.situacion === "contractor" && r.incrementoUltimoAnio === "no"
      ? `\nAumento de tarifa últimos 12 meses: no`
      : "";
  const contractorPagoAdicionalTxt = r.situacion === "contractor" && r.contractorPagoAdicional === "si"
    ? `\nPago adicional ocasional fuera de tarifa fija (no formalizado en contrato): sí${r.contractorPagoAdicionalMonto ? `, promedio ${r.contractorPagoAdicionalMonto}` : ""}`
    : r.situacion === "contractor" && r.contractorPagoAdicional === "no"
      ? `\nPago adicional ocasional fuera de tarifa fija: no`
      : "";
  const contractorMeta = r.situacion === "contractor"
    ? `\n\n[Contractor]\nHoras semanales: ${r.contractorHoras ?? "n/d"}\nModalidad de pago: ${r.contractorPago ?? "n/d"}${contractorIncrementoTxt}${contractorPagoAdicionalTxt}`
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
    anos_experiencia_total: typeof r.experienciaTotalAnios === "number"
      ? `${r.experienciaTotalAnios} años (calculado desde fechas del CV; confirmado por usuario)`
      : (r.expTotal as string) ?? null,
    anos_experiencia_industria: typeof r.experienciaIndustriaAnios === "number"
      ? `${r.experienciaIndustriaAnios} años (calculado desde fechas del CV; confirmado por usuario)`
      : (r.expIndustria as string) ?? null,
    anos_puesto_actual: null,
    formacion: typeof r.formacion === "string" && r.formacion ? [r.formacion] : null,
    certificaciones: r.sinCertificaciones ? [] : (Array.isArray(r.certificaciones) ? (r.certificaciones as string[]) : null),
    herramientas_ia: Array.isArray(r.herramientasIA) ? r.herramientasIA : null,
    frecuencia_ia: (r.frecuenciaIA as string) ?? null,
    uso_ia: Array.isArray(r.usoIA) ? (r.usoIA as string[]) : null,
    situacion_laboral: (r.situacion as string) ?? null,
    salario_actual: salario,
    moneda_actual: moneda,
    moneda_reporte: (r.monedaReporte as string) ?? null,
    salario_tipo: (r.brutoNeto as string) ?? null,
    incremento_ultimo_anio_pct: r.incrementoUltimoAnio === "si" && typeof r.incrementoUltimoAnioPct === "number"
      ? Math.round(r.incrementoUltimoAnioPct)
      : null,
    beneficio_salud_tipo: (r.beneficio_salud_tipo as string) ?? null,
    beneficio_salud_prestadora: (r.beneficio_salud_prestadora as string) ?? null,
    bono_tipo: (r.bono_tipo as string) ?? null,
    bono_monto: (r.bono_monto as number) ?? null,
    bono_moneda: (r.bono_moneda as string) ?? null,
    equity: (r.equity as string) ?? null,
    comisiones_tipo: (r.comisiones_tipo as string) ?? null,
    comisiones_monto: (r.comisiones_monto as number) ?? null,
    beneficio_alimentacion_tipo: (r.beneficio_alimentacion_tipo as string) ?? null,
    beneficio_alimentacion_monto: (r.beneficio_alimentacion_monto as number) ?? null,
    auto_corporativo: (r.auto_corporativo as string) ?? null,
    beneficio_celular: (r.beneficio_celular as string) ?? null,
    beneficio_movilidad_tipo: (r.beneficio_movilidad_tipo as string) ?? null,
    beneficio_movilidad_monto: (r.beneficio_movilidad_monto as number) ?? null,
    beneficio_seguro_vida: (r.beneficio_seguro_vida as string) ?? null,
    beneficio_retiro: (r.beneficio_retiro as string) ?? null,
    beneficio_401k_match: r.beneficio_401k_match === "con_porcentaje" && r.beneficio_401k_porcentaje
      ? `Sí — ${r.beneficio_401k_porcentaje}%`
      : (r.beneficio_401k_match as string) ?? null,
    modalidad_trabajo: r.modalidad_trabajo === "hibrido" && r.modalidad_dias_presenciales
      ? `Híbrido — ${r.modalidad_dias_presenciales} día(s) presencial(es)`
      : (r.modalidad_trabajo as string) ?? null,
    beneficio_vacaciones_adicionales: (r.beneficio_vacaciones_adicionales as string) ?? null,
    beneficio_capacitacion: (r.beneficio_capacitacion as string) ?? null,
    beneficios_adicionales_texto: (r.beneficiosAdicionalesTexto as string)?.trim() || null,
    beneficios_no_declarados: (() => {
      const noSe: string[] = [];
      if (r.beneficio_salud_tipo === "no_se") noSe.push("Cobertura médica");
      if (r.beneficio_seguro_vida === "no_se") noSe.push("Seguro de vida");
      if (r.beneficio_retiro === "no_se") noSe.push("Plan de retiro complementario");
      if (r.beneficio_401k_match === "no_se") noSe.push("Employer match 401k");
      return noSe.length ? noSe : null;
    })(),
    puesto_descripcion: (baseDesc + contractorMeta + targetDirMeta) || null,
    antiguedad_rol: (r.antiguedadRol as string) ?? null,
    tipo_negociacion: (r.tipoNegociacion as string) ?? null,
    orientacion_carrera: (r.orientacionCarrera as string) ?? null,
    punto_partida_salto: (r.puntoPartidaSalto as string) ?? null,
    oferta_verbal: (r.ofertaVerbal as string) ?? null,
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

// ---------- Crear Stripe Checkout Session ----------

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      plan: z.enum(["unico", "pack3", "anual"]),
      priceId: z.string().min(1).max(128),
      planName: z.string().min(1).max(64),
      origin: z.string().url(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const stripe = getStripe();
    const mode: Stripe.Checkout.SessionCreateParams.Mode =
      data.plan === "anual" ? "subscription" : "payment";

    // Get customer email from diagnostic to prefill checkout
    const { data: diag } = await supabaseAdmin
      .from("diagnosticos" as never)
      .select("mail")
      .eq("id", data.id)
      .maybeSingle();
    const customerEmail = (diag as { mail?: string | null } | null)?.mail || undefined;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: data.priceId, quantity: 1 }],
      client_reference_id: data.id,
      customer_email: customerEmail,
      success_url: `${data.origin}/diagnostico/procesando?id=${data.id}`,
      cancel_url: `${data.origin}/diagnostico/paywall?id=${data.id}`,
      metadata: {
        diagnostico_id: data.id,
        plan: data.plan,
        plan_name: data.planName,
      },
    });

    if (!session.url) throw new Error("Stripe no devolvió URL de checkout");
    return { url: session.url, sessionId: session.id };
  });

// ---------- Consultar estado de pago ----------

export const getPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("diagnosticos" as never)
      .select("pago_confirmado")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const r = row as { pago_confirmado: boolean } | null;
    return { pagoConfirmado: !!r?.pago_confirmado };
  });


// ---------- Confirmar acceso beta (consume token) ----------

// Modo E todavía no existe — cuando alguien declara que cobra "por proyecto" (sin
// cadencia mensual estable), Modo A no le aplica con honestidad. En vez de generar
// un reporte de calidad dudosa, capturamos el mail para avisar cuando Modo E esté listo.
function generarCodigoDescuento(): string {
  // Sin caracteres ambiguos (0/O, 1/I/L) para que sea fácil de leer y tipear.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `MODOE-${code}`;
}

async function sendWaitlistConfirmationEmail(args: { email: string; codigo: string; isEN: boolean }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[sendWaitlistConfirmationEmail] RESEND_API_KEY no configurada, skip");
    return;
  }
  const { email, codigo, isEN } = args;
  const subject = isEN ? "You're on the list" : "Ya estás en la lista";
  const heading = isEN ? "You're on the list" : "Ya estás en la lista";
  const body = isEN
    ? "Your data is already part of the first real rate landscape for independent professionals. We'll write to you as soon as it's ready to use — here's your single-use 20% launch discount code, reserved for you:"
    : "Tu dato ya forma parte del primer panorama real de tarifas para profesionales independientes. Te vamos a escribir en cuanto esté listo para usar — este es tu código de un solo uso con 20% de descuento de lanzamiento, reservado para vos:";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr><td style="text-align:center;padding-bottom:24px;">
          <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;color:#111;">PayRank</div>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:16px;">
          <h1 style="font-size:22px;font-weight:600;margin:0;color:#111;">${heading}</h1>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:28px;">
          <p style="font-size:16px;line-height:1.5;color:#444;margin:0;">${body}</p>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:8px;">
          <div style="display:inline-block;background:#f5f5f7;color:#111;font-weight:700;font-size:20px;letter-spacing:1px;padding:14px 28px;border-radius:10px;">${codigo}</div>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#888;margin:24px 0 0;text-align:center;">
        PayRank LLC · <a href="https://payrank.co" style="color:#888;text-decoration:none;">payrank.co</a> · <a href="mailto:hello@payrank.co" style="color:#888;text-decoration:none;">hello@payrank.co</a>
      </p>
    </td></tr>
  </table>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PayRank <hello@payrank.co>",
      to: [email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt.slice(0, 300)}`);
  }
}

export const registrarWaitlistModoE = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("modo_e_waitlist" as never)
      .insert({ email: data.email } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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

// ---------- Aplicar código de acceso (beta/promo/press) — bypassea el pago ----------

export const applyAccessCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      codigo: z.string().min(1).max(128),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const codigo = data.codigo.trim().toUpperCase();

    const { data: row, error: selErr } = await supabaseAdmin
      .from("codigos_acceso" as never)
      .select("id, codigo, tipo, usos_maximos, usos_actuales, activo, expires_at")
      .eq("codigo", codigo)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    const c = row as {
      id: string;
      codigo: string;
      tipo: string;
      usos_maximos: number;
      usos_actuales: number;
      activo: boolean;
      expires_at: string | null;
    } | null;

    if (!c || !c.activo) throw new Error("INVALID_CODE");
    if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
      throw new Error("INVALID_CODE");
    }
    if (c.usos_actuales >= c.usos_maximos) throw new Error("INVALID_CODE");

    // Marcar diagnóstico como pagado (gratis vía código) y guardar referencia al código
    const { error: updDiagErr } = await supabaseAdmin
      .from("diagnosticos" as never)
      .update({
        pago_confirmado: true,
        monto_pagado_usd: 0,
        tipo_usuario: c.tipo === "beta" ? "beta_gratuito" : `acceso_${c.tipo}`,
        codigo_acceso_usado: c.codigo,
        plan_elegido: "codigo_acceso",
      } as never)
      .eq("id", data.id);
    if (updDiagErr) throw new Error(updDiagErr.message);

    // Incrementar contador de usos del código
    const { error: updCodeErr } = await supabaseAdmin
      .from("codigos_acceso" as never)
      .update({ usos_actuales: c.usos_actuales + 1 } as never)
      .eq("id", c.id);
    if (updCodeErr) console.error("[applyAccessCode] usos increment error:", updCodeErr);

    return { ok: true, tipo: c.tipo };
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


// ---------- Conversión local → USD (única fuente de verdad) ----------

function parseLocalAmount(s: unknown): number | null {
  if (typeof s !== "string") return null;
  // Si es un rango ("USD 2.800 – 3.200 mensuales"), tomar SOLO el primer número.
  // Nunca concatenar ambos extremos — un guion largo/medio que el regex de abajo
  // no reconoce como separador puede pegar "2.800" y "3.200" en "28003200".
  const primeraParte = s.split(/[-–—]/)[0];
  const cleaned = primeraParte.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return null;
  const digits = cleaned.replace(/[.,]/g, "");
  const n = Number(digits);
  return isFinite(n) ? n : null;
}

function formatUsd(n: number): string {
  return `USD ${Math.round(n).toLocaleString("en-US")}`;
}

function formatLocal(n: number): string {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

// PC-09/PC-08 — el modelo nunca debe adivinar el monto declarado por el usuario.
// Si la moneda que declaró (record.moneda_actual) difiere de la moneda estándar
// del país (currency), recalculamos salario_actual_local/usd desde el dato crudo
// (record.salario_actual) en vez de confiar en lo que generó el modelo para ese
// campo puntual. El resto del reporte (rango de mercado, P25-P90) no se toca acá.
function corregirSalarioDeclarado(
  parsed: Record<string, unknown>,
  record: { salario_actual?: unknown; moneda_actual?: unknown },
  currency: string | null,
  usdOnly: boolean,
  tc: TipoCambio | null,
): void {
  const monedaDeclarada = typeof record.moneda_actual === "string" ? record.moneda_actual.toUpperCase() : null;
  const monto = typeof record.salario_actual === "number" && record.salario_actual > 0 ? record.salario_actual : null;
  if (!monedaDeclarada || monto === null) return;

  const monedaPais = usdOnly ? "USD" : currency;
  if (!monedaPais || monedaDeclarada === monedaPais) return; // sin mismatch: no tocar nada, ya está bien

  const s2 = parsed.seccion_2 as Record<string, unknown> | undefined;
  if (!s2) return;

  if (monedaDeclarada === "USD") {
    s2.salario_actual_usd = formatUsd(monto);
    if (tc && tc.valor > 0) s2.salario_actual_local = formatLocal(monto * tc.valor);
    // Si no hay tipoCambio disponible, dejamos salario_actual_local como vino del modelo
    // (mejor un valor de origen incierto que inventar uno sin tasa real).
  }
  // Otras monedas declaradas (EUR, GBP, etc. distintas a la del país) quedan fuera de este
  // fix por ahora — no tenemos fuente oficial de conversión para esos pares todavía.
}


function applyUsdConversion(
  parsed: Record<string, unknown>,
  tc: TipoCambio | null,
  usdOnly: boolean,
  primaryIsUsd: boolean = false,
): void {
  // País USD-only: el modelo ya está en USD; copiar local→usd para consistencia visual.
  if (usdOnly) {
    const s2 = parsed.seccion_2 as Record<string, unknown> | undefined;
    if (s2) {
      for (const k of ["p25", "p50", "p75", "p90", "salario_actual"]) {
        const v = s2[`${k}_local`];
        if (typeof v === "string" && !s2[`${k}_usd`]) s2[`${k}_usd`] = v;
      }
    }
    const s5 = parsed.seccion_5 as Record<string, unknown> | undefined;
    if (s5 && typeof s5.pretension_recomendada_local === "string" && !s5.pretension_recomendada_usd) {
      s5.pretension_recomendada_usd = s5.pretension_recomendada_local;
    }
    return;
  }
  if (!tc || !tc.valor || tc.valor <= 0) return;
  const fx = tc.valor;

  // PC-09 — si el usuario declaró cobrar en USD (mismatch con la moneda del país),
  // el modelo trabajó en USD (ver fxBlock) y acá calculamos el equivalente en moneda
  // local, en vez de al revés. El resto de la lógica (qué campos, qué fórmula) es la
  // misma, solo se invierte el campo de origen y destino.
  const s2 = parsed.seccion_2 as Record<string, unknown> | undefined;
  if (s2) {
    for (const k of ["p25", "p50", "p75", "p90", "salario_actual"]) {
      if (primaryIsUsd) {
        const usd = parseLocalAmount(s2[`${k}_usd`]);
        if (usd != null) s2[`${k}_local`] = formatLocal(usd * fx);
      } else {
        const local = parseLocalAmount(s2[`${k}_local`]);
        if (local != null) s2[`${k}_usd`] = formatUsd(local / fx);
      }
    }
  }
  const s5 = parsed.seccion_5 as Record<string, unknown> | undefined;
  if (s5) {
    if (primaryIsUsd) {
      const usd = parseLocalAmount(s5.pretension_recomendada_usd);
      if (usd != null) s5.pretension_recomendada_local = formatLocal(usd * fx);
    } else {
      const local = parseLocalAmount(s5.pretension_recomendada_local);
      if (local != null) s5.pretension_recomendada_usd = formatUsd(local / fx);
    }
  }

  // Sección 3 — tabla de compensación total. Mismo patrón: convertir en la dirección
  // que corresponda según primaryIsUsd, fila por fila más los 2 totales.
  const s3 = parsed.seccion_3 as Record<string, unknown> | undefined;
  if (s3) {
    const filas = Array.isArray(s3.tabla_compensacion) ? s3.tabla_compensacion as Record<string, unknown>[] : [];
    for (const fila of filas) {
      if (primaryIsUsd) {
        const valorUsd = parseLocalAmount(fila.valor_mensual_usd);
        if (valorUsd != null) fila.valor_mensual_local = formatLocal(valorUsd * fx);
        const mercadoUsd = parseLocalAmount(fila.mercado_tipico_usd);
        if (mercadoUsd != null) fila.mercado_tipico_local = formatLocal(mercadoUsd * fx);
      } else {
        const valorLocal = parseLocalAmount(fila.valor_mensual_local);
        if (valorLocal != null) fila.valor_mensual_usd = formatUsd(valorLocal / fx);
        const mercadoLocal = parseLocalAmount(fila.mercado_tipico_local);
        if (mercadoLocal != null) fila.mercado_tipico_usd = formatUsd(mercadoLocal / fx);
      }
    }
    if (primaryIsUsd) {
      const totalUsd = parseLocalAmount(s3.total_compensacion_usd);
      if (totalUsd != null) s3.total_compensacion_local = formatLocal(totalUsd * fx);
      const totalMercadoUsd = parseLocalAmount(s3.total_mercado_tipico_usd);
      if (totalMercadoUsd != null) s3.total_mercado_tipico_local = formatLocal(totalMercadoUsd * fx);
    } else {
      const totalLocal = parseLocalAmount(s3.total_compensacion_local);
      if (totalLocal != null) s3.total_compensacion_usd = formatUsd(totalLocal / fx);
      const totalMercadoLocal = parseLocalAmount(s3.total_mercado_tipico_local);
      if (totalMercadoLocal != null) s3.total_mercado_tipico_usd = formatUsd(totalMercadoLocal / fx);
    }
  }
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

    // PC-09 — si el usuario declaró cobrar en USD pero la moneda estándar de su país
    // es otra, el modelo trabaja en USD (ver fxBlock) y el backend invierte la dirección
    // de la conversión: de USD hacia la moneda local, no al revés.
    const monedaDeclarada = typeof record.moneda_actual === "string" ? record.moneda_actual.toUpperCase() : null;
    const primaryIsUsd = !usdOnly && !!currency && monedaDeclarada === "USD" && currency !== "USD";

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

    const systemPromptB = record.modo === "C" ? SYSTEM_PROMPT_B_MODO_C : SYSTEM_PROMPT_B;
    const [partA, partB] = await Promise.all([
      genPart(promptA, "parteA", SYSTEM_PROMPT),
      genPart(promptB, "parteB", systemPromptB),
    ]);
    const parsed: Record<string, unknown> = { ...partA, ...partB };

    // Conversión local→USD en backend (única fuente de verdad sobre tipo de cambio).
    // El modelo solo trabaja en moneda local; acá rellenamos los campos *_usd.
    applyUsdConversion(parsed, tipoCambio, usdOnly, primaryIsUsd);
    corregirSalarioDeclarado(parsed, record, currency, usdOnly, tipoCambio);

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

    // Enviar email con el reporte (no bloqueante)
    try {
      await sendReportEmail({
        id: record.id as string,
        email: (record.mail as string | null) ?? null,
        pais: (record.pais_rol as string | null) ?? null,
      });
    } catch (emailErr) {
      console.error("[generateDiagnostico] email send error (non-blocking):", emailErr);
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

El documento puede comenzar con una etiqueta [TIPO: cv], [TIPO: recibo] o [TIPO: descriptivo]. Usá esa etiqueta para priorizar qué campos extraer:
- [TIPO: cv]: priorizar nivel_jerarquico_inferido, industria_inferida, experiencia_total_anios, experiencia_industria_anios, formacion, certificaciones, idiomas, herramientas_ia_inferidas, funciones_inferidas, alcance_inferido, equipo_inferido, titulo_cv, titulo_cv_academico
- [TIPO: recibo]: el documento puede ser (a) un recibo de sueldo de relación de dependencia, o (b) un contrato de servicios / contractor agreement / Statement of Work (Deel, Contractor Agreement, Independent Contractor Agreement, factura de honorarios, etc.) — el usuario sube esto en la misma zona si declaró ser contractor. Identificá cuál de los dos es ANTES de extraer:
  - Señales de RECIBO DE SUELDO (relación de dependencia): aparecen conceptos como "sueldo básico", "aportes", "jubilación", "obra social", "SAC", "ART", "NETO A PAGAR", retenciones de ley, o el documento se autodenomina "recibo de sueldo" / "liquidación de haberes" / "payslip" / "pay stub".
  - Señales de CONTRATO DE SERVICIOS / CONTRACTOR: aparecen términos como "Independent Contractor", "Statement of Work", "Client" / "Cliente" (en vez de "Employer" / "Empleador"), "Deel", "monotributo", "factura de honorarios", "Contractor Agreement", cláusulas que dicen explícitamente que NO es relación de empleo y que el contractor es responsable de sus propios impuestos/beneficios.
  - Si es RECIBO: priorizar salario_actual_inferido, moneda_inferida, tipo_salario_inferido, empresa_actual, titulo_recibo, fecha_ingreso_empresa_actual, nombre_prestadora_salud, recibo_fecha, recibo_tiene_variable_sin_monto, bono_frecuencias_detectadas, bono_mencionado_sin_monto, pais_inferido, tipo_empresa_inferida.
  - Si es CONTRATO DE SERVICIOS: priorizar situacion_laboral_inferida (devolver "contractor"), tarifa_mensual_contrato_inferida, moneda_inferida, horas_semanales_pactadas_inferidas, empresa_contratante_inferida, bono_explicito_no, beneficios_explicito_ninguno, pais_inferido.
- [TIPO: descriptivo]: priorizar industria_inferida, tipo_empresa_inferida, funciones_inferidas, alcance_inferido, equipo_inferido, nivel_jerarquico_inferido

REGLA CRÍTICA — moneda en contratos: si el documento es un contrato de servicios y la tarifa está denominada en una moneda extranjera (ej. USD), devolvé esa moneda en moneda_inferida TAL COMO FIGURA en el contrato — nunca la convirtás ni asumas la moneda local del país inferido. La moneda de facturación de un contractor puede ser distinta a la moneda del país donde reside. Muchos contratos (especialmente Statement of Work / SOW) usan formato de tabla con campos separados — por ejemplo una fila "Payment Currency: USD - US Dollar" y, en otra fila distinta, "Payment Rate / Amount: $1,500.00 per month". En ese caso la fila "Payment Currency" (o equivalente: "Moneda de pago", "Currency") es la fuente de verdad para moneda_inferida — no asumas la moneda solo por el símbolo "$" que pueda acompañar al monto, ese símbolo es genérico y no especifica la moneda real.

REGLA CRÍTICA — herramientas_ia_inferidas: incluir EXCLUSIVAMENTE herramientas de IA generativa o machine learning (ChatGPT, Claude, Gemini, Copilot, GitHub Copilot, Midjourney, Perplexity, Notion AI, DALL-E, Cursor, Whisper, ElevenLabs, Runway, Jasper, Synthesia, Stable Diffusion, etc.). NUNCA incluir software de gestión, encuestas, ERP, CRM, BI, HRIS ni productividad: Qualtrics, SuccessFactors, SAP, Workday, Slik, Salesforce, HubSpot, Excel, Power BI, Tableau, Looker, Google Analytics, Jira, Asana, Slack, Office, y similares NO son herramientas de IA. Si no hay herramientas de IA generativa, devolver [].`;

const EXTRACT_USER_INSTRUCTIONS = `El documento puede estar truncado. Extraé toda la información disponible del fragmento recibido.

Extraé estos campos si están presentes:
- nombre_inferido
- titulo_puesto
- nivel_jerarquico_inferido: devolvé EXACTAMENTE uno de estos strings (copiado textual): "Junior/Analista", "Semi-senior", "Senior/Especialista", "Manager/Líder de equipo", "Senior Manager/Gerente", "Director/Head", "C-Level/VP", "Otro". Ejemplos: "Senior" → "Senior/Especialista"; "Gerente" → "Senior Manager/Gerente"; "Jefe" → "Manager/Líder de equipo"; "Coordinador" → "Semi-senior"; "Manager" → "Manager/Líder de equipo"; "Senior Manager" → "Senior Manager/Gerente"; "Director" → "Director/Head"; "VP" → "C-Level/VP"; "Associate" → "Semi-senior"; "Lead" → "Senior/Especialista"; "Head of" → "Director/Head"; "Principal" → "Senior/Especialista"; "Analyst" → "Junior/Analista"; "Specialist" → "Senior/Especialista". Si no podés inferir, null.
- industria_inferida: devolvé EXACTAMENTE uno de estos strings (copiado textual): "Tecnología/Software", "Finanzas/Banca", "Consumo masivo/Retail", "Industrial/Manufactura", "Consultoría/Servicios profesionales", "Salud/Pharma", "Seguros", "Educación", "Medios/Entretenimiento", "Energía", "Real Estate", "Gobierno/Sector público", "Otra". Ejemplos de mapeo: "Infraestructura / Energía / Gas" → "Energía"; "Oil & Gas" → "Energía"; "Banca" → "Finanzas/Banca"; "Minería" → "Industrial/Manufactura". Empresas conocidas: TGS, YPF, Pampa Energía, Shell Argentina → "Energía"; Techint, Ternium, Tenaris → "Industrial/Manufactura"; MercadoLibre, Globant, Mercado Pago → "Tecnología/Software"; Banco Galicia, HSBC, Santander, BBVA → "Finanzas/Banca"; Google, Microsoft, Apple, Meta, Amazon, Salesforce, Oracle, Adobe → "Tecnología/Software"; JPMorgan, Goldman Sachs, Citibank, Wells Fargo, Bank of America → "Finanzas/Banca"; Mondelez, Unilever, P&G, Nestlé, PepsiCo, Kraft → "Consumo masivo/Retail"; Johnson & Johnson, Pfizer, Merck, AbbVie → "Salud/Pharma"; Deloitte, McKinsey, Accenture, PwC, EY, KPMG, BCG → "Consultoría/Servicios profesionales"; Shell, ExxonMobil, BP, Chevron → "Energía". Also map English terms: "Banking" → "Finanzas/Banca"; "Healthcare" → "Salud/Pharma"; "Consumer goods" or "FMCG" → "Consumo masivo/Retail"; "Manufacturing" → "Industrial/Manufactura"; "Media" or "Entertainment" → "Medios/Entretenimiento"; "Insurance" → "Seguros"; "Government" or "Public sector" → "Gobierno/Sector público". Si no podés inferir, null.
- tipo_empresa_inferida
- anos_experiencia_total_inferidos (string/bucket si lo usás para mostrar; opcional)
- anos_experiencia_industria_inferidos (string/bucket si lo usás para mostrar; opcional)
- experiencia_total_anios (NÚMERO entero): calculá los AÑOS TOTALES DE EXPERIENCIA LABORAL desde la fecha más temprana que aparezca en la sección de experiencia laboral del CV hasta HOY (${new Date().getFullYear()}). Identificá TODAS las fechas de inicio de cada empleo (formatos comunes: "2010-2015", "ene 2018 - actualidad", "2005 – Presente", "Jul 2012 - Dic 2017", "Jan 2018 - Present", "January 2018 – Present", "01/2018 – Present", "2018 – Present", "Mar 2015 – Jun 2019", "March 2015 to June 2019"). Tomá la fecha de INICIO MÁS ANTIGUA y calculá la diferencia en años hasta hoy. Si un empleo dice "presente"/"actualidad"/"current"/"Present"/"Now"/"Today", usá la fecha de hoy. Formatos de fecha en inglés: "Jan 2018 - Present", "January 2018 – Present", "01/2018 – Present", "2018 – Present", "Mar 2015 – Jun 2019", "March 2015 to June 2019" — extraé el año y mes de inicio y fin de cada empleo. NO sumes solapamientos de empleos paralelos: usá el lapso total (most recent end - earliest start). Devolvé un número entero. Si no hay CV o no hay fechas claras, null.
- experiencia_industria_anios (NÚMERO entero): identificá la INDUSTRIA del puesto más reciente del CV (o del aviso/descripción si está en Modo C). Luego sumá los años de TODOS los empleos del CV cuya industria sea la misma o muy cercana (ej: banca y fintech; retail y e-commerce; consultoría estratégica y consultoría management). IMPORTANTE: no limitarse al empleo actual — incluir todos los empleos previos en la misma industria. Si hay un recibo con fecha_ingreso_empresa_actual, usala como fecha de inicio del empleo actual solo si es más precisa que la del CV, pero seguí sumando los empleos anteriores en la misma industria. Reconocé fechas en inglés: "Jan 2018 - Present", "January 2018 – Present", "Mar 2015 – Jun 2019", "March 2015 to June 2019", "Present"/"Now"/"Today" como fecha actual. Devolvé un número entero. Si no hay CV o no se puede inferir, null.
- formacion (array): clasificá la formación académica del documento en una o más de estas categorías exactas (usar exactamente estos strings, sin traducir ni modificar): "Secundario completo", "Terciario/Tecnicatura", "Universitario incompleto", "Universitario completo", "Posgrado/Especialización", "Maestría", "Doctorado". Ejemplos: "Licenciado en Administración" → ["Universitario completo"]; "MBA" → ["Maestría"]; "Ingeniero Industrial + MBA" → ["Universitario completo", "Maestría"]; "PMP" → [] (se ignora, se captura en el campo certificaciones separado). Solo incluir categorías que estén explícitamente respaldadas por el documento.
- certificaciones (array)
- idiomas (array con nivel si figura)
- funciones_inferidas (array)
- alcance_inferido
- equipo_inferido
- herramientas_ia_inferidas (array) — IMPORTANTE: incluir SOLO herramientas de IA generativa o machine learning de uso profesional. Ejemplos válidos: ChatGPT, Claude, Gemini, Copilot, GitHub Copilot, Midjourney, Perplexity, Notion AI, DALL-E, Stable Diffusion, Runway, Cursor, Whisper, ElevenLabs, Jasper, Synthesia. NUNCA incluir software de gestión, encuestas, BI, ERP, CRM o productividad aunque aparezcan en el CV (NO incluir: Qualtrics, SuccessFactors/SSFF, SAP, Workday, Slik, Salesforce, HubSpot, Excel, Power BI, Tableau, Looker, Google Analytics, Jira, Asana, Notion sin AI, Office, Slack). Si el CV no menciona ninguna herramienta de IA generativa o ML, devolver array vacío [].
- salario_actual_inferido
- moneda_inferida
- tipo_salario_inferido: "bruto" o "neto". IMPORTANTE para recibos argentinos: el valor BRUTO es la suma de todos los conceptos remunerativos (sueldo básico + adicionales + horas extra, etc.) ANTES de descuentos. El valor NETO es lo que figura como "NETO A PAGAR" o "TOTAL NETO". Si el documento es un recibo de sueldo argentino con descuentos de obra social, jubilación, etc., el salario declarado en el formulario es casi siempre BRUTO. Devolvé "bruto" salvo que el documento indique explícitamente que el monto es neto.
- beneficios_inferidos (array)
- linkedin_url (si figura)
- recibo_fecha: si el documento es un recibo/liquidación, devolvé la fecha de emisión o período en formato ISO YYYY-MM-DD (o YYYY-MM si solo hay mes). Si no es un recibo o no aparece, null.
- recibo_tiene_variable_sin_monto: true SOLO si el recibo menciona un componente variable / bono / comisión pero NO aparece el monto numérico. false si aparece el monto. null si no aplica.
- titulo_cv: PUESTO LABORAL MÁS RECIENTE del CV. Buscá específicamente en la sección "Experiencia laboral", "Work experience", "Experience", "Trayectoria profesional" o equivalente, y devolvé el título del PRIMER puesto listado (el más reciente, típicamente acompañado de nombre de empresa y fechas). NUNCA devuelvas un título académico, grado universitario, maestría, doctorado, diplomatura ni certificación en este campo. Si no hay CV o no podés identificar un puesto laboral claro, null.
- titulo_cv_academico: máximo grado académico que figura en el CV (ej: "Licenciado en Administración", "MBA", "Ingeniero Industrial", "Magíster en Finanzas"). Devolvé esto SOLO si aparece en una sección de educación / formación. null si no hay CV o no hay grado académico.

CRÍTICO — Distinción formación vs. rol laboral: Los títulos universitarios, posgrados, maestrías, doctorados, licenciaturas, tecnicaturas y equivalentes (Ingeniero Industrial, Licenciado en Administración, MBA, etc.) son FORMACIÓN ACADÉMICA — van en titulo_cv_academico, NUNCA en titulo_cv. El campo titulo_cv contiene exclusivamente el último cargo laboral desempeñado en una organización empleadora (Project Manager, Analista Senior, Gerente de RRHH, etc.). Si el documento menciona tanto un título académico como un cargo laboral, el cargo laboral va en titulo_cv y el título académico va en titulo_cv_academico. Las opciones de confirmación de puesto que se muestran al usuario deben contener únicamente roles laborales — nunca títulos académicos.
- titulo_recibo: título o puesto que figura en el recibo de sueldo. null si no hay recibo.
- bono_frecuencias_detectadas: array de strings con TODAS las frecuencias distintas de pago de bono/variable/comisión que aparezcan mencionadas en cualquier documento (recibo, CV, descriptivo, aviso). Valores posibles: "mensual", "trimestral", "cuatrimestral", "semestral", "anual", "por proyecto", "puntual". Si en distintos documentos aparecen frecuencias distintas, incluí todas. Si no se menciona ninguna, devolvé [].
- bono_mencionado_sin_monto: true si CUALQUIER documento menciona la existencia de un bono / componente variable / comisión sin especificar el monto numérico. false si se menciona con monto. null si no se menciona en ningún lado.
- pais_inferido: país donde opera la empresa del puesto más reciente. Si la empresa es conocida (TGS, YPF, Techint, MercadoLibre, Globant, Banco Galicia, HSBC Argentina, etc.), inferí "Argentina" directamente. Si no se puede inferir, null.
- tipo_empresa_inferida: devolvé EXACTAMENTE uno de estos strings (copiado textual): "Startup / PyME (1–99 empleados)", "Empresa mediana (100–999 empleados)", "Empresa grande nacional (1.000–4.999 empleados)", "Multinacional / Enterprise (+5.000 empleados)". Devolvé exactamente UNA categoría. Ejemplos: TGS, YPF, Techint, Banco Galicia → "Empresa grande nacional (1.000–4.999 empleados)"; MercadoLibre, Globant, Accenture, Google → "Multinacional / Enterprise (+5.000 empleados)". Si no podés inferir, null.
- empresa_actual: nombre exacto de la empresa del puesto más reciente tal como figura en el documento. null si no figura.
- fecha_ingreso_empresa_actual: fecha de ingreso a la empresa más reciente en formato YYYY-MM-DD o YYYY-MM. Si dice "julio 2025" devolvé "2025-07". Si no figura, null.
- nombre_prestadora_salud: nombre de la obra social o prepaga tal como figura en el recibo (Swiss Medical, OSDE, Medicus, etc.). null si no figura o no hay recibo.
- situacion_laboral_inferida: devolvé EXACTAMENTE uno de estos strings: "empleado", "contractor", "freelance". Inferí esto SOLO si el documento lo deja claro: un recibo de sueldo de relación de dependencia → "empleado". Un contrato de servicios / Independent Contractor Agreement / Statement of Work / Deel / factura de honorarios con un solo cliente fijo → "contractor". Facturas a múltiples clientes distintos o mención explícita de "freelance"/"independiente" sin contrato de un solo cliente → "freelance". Si no hay evidencia clara en el documento, null. NUNCA inferir esto de un CV genérico sin contrato/recibo adjunto.
- horas_semanales_pactadas_inferidas (NÚMERO): horas semanales EXPLÍCITAMENTE pactadas en el contrato o descriptivo (ej. "40 hours per week", "20 horas semanales", "part-time, 20hs"). Devolvé null si el documento NO menciona una carga horaria explícita — NO asumas ni calcules un valor por defecto. Es preferible null a un valor inventado.
- tarifa_mensual_contrato_inferida: monto de la tarifa/fee mensual fija que figura en un contrato de servicios. Puede aparecer como frase corrida (ej. "USD 1,500.00 per month") O en un contrato con formato de tabla/campos estructurados, donde el monto y la moneda están en FILAS O CELDAS SEPARADAS (ej. una fila "Payment Currency: USD - US Dollar" y, en otra fila distinta, "Payment Rate / Amount: $1,500.00 per month"). En ese caso, COMBINÁ ambas filas: el monto numérico es 1500, tomado de la fila de monto/tarifa. Este campo es informativo para contraste — NO se usa para sobreescribir lo que el usuario declare manualmente en el formulario, que siempre tiene prioridad si difiere (contratos pueden quedar desactualizados). null si no hay contrato o no figura monto.
- empresa_contratante_inferida: nombre del Cliente/Company que contrata al contractor según el contrato (campo "Client"/"Cliente" en el documento), distinto de un empleador en relación de dependencia. null si no aplica.
- bono_explicito_no: true SOLO si el documento declara EXPLÍCITAMENTE la ausencia de bono/variable/comisión (ej. "No overtime, bonus, commission, or variable compensation applies"). false si se menciona un bono con o sin monto. null si el documento no se refiere al tema en absoluto.
- beneficios_explicito_ninguno: true SOLO si un contrato de servicios declara EXPLÍCITAMENTE que el contractor no recibe beneficios laborales del cliente (cobertura médica, PTO, retiro, etc. — ej. "Client shall not provide health coverage, paid time off, retirement contributions, or any other employee benefit"). false si se menciona algún beneficio provisto. null si no aplica o el documento es un recibo de empleado (ahí beneficios_inferidos ya cubre esto).

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
    const PDF_MAX_TOKENS = 2000;
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
    const json = (await res.json()) as { content?: Array<{ type: string; text?: string }>; stop_reason?: string };
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

// ---------- Envío de email con el reporte (Resend) ----------

const SPANISH_COUNTRIES = [
  "argentin", "españa", "spain", "méxico", "mexico", "chile", "colombia",
  "perú", "peru", "uruguay", "paraguay", "bolivia", "ecuador", "venezuela",
  "costa rica", "panamá", "panama", "guatemala", "honduras", "nicaragua",
  "salvador", "república dominicana", "republica dominicana", "puerto rico", "cuba",
];

function isSpanish(pais: string | null): boolean {
  if (!pais) return true;
  const p = pais.toLowerCase();
  return SPANISH_COUNTRIES.some((c) => p.includes(c));
}

async function sendReportEmail(args: { id: string; email: string | null; pais: string | null }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[sendReportEmail] RESEND_API_KEY no configurada, skip");
    return;
  }
  if (!args.email) {
    console.warn("[sendReportEmail] sin email destinatario, skip");
    return;
  }

  const es = isSpanish(args.pais);
  const subject = es ? "Tu PayRank está listo" : "Your PayRank is ready";
  const heading = es ? "Tu PayRank está listo" : "Your PayRank is ready";
  const body = es
    ? "Tu diagnóstico salarial está listo. Hacé clic para verlo."
    : "Your salary diagnostic is ready. Click to view it.";
  const cta = es ? "Ver mi diagnóstico" : "View my diagnostic";
  const url = `https://payrank.co/diagnostico/${args.id}`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr><td style="text-align:center;padding-bottom:24px;">
          <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;color:#111;">PayRank</div>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:16px;">
          <h1 style="font-size:22px;font-weight:600;margin:0;color:#111;">${heading}</h1>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:32px;">
          <p style="font-size:16px;line-height:1.5;color:#444;margin:0;">${body}</p>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:8px;">
          <a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:10px;">${cta}</a>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#888;margin:24px 0 0;text-align:center;">
        PayRank LLC · <a href="https://payrank.co" style="color:#888;text-decoration:none;">payrank.co</a> · <a href="mailto:hello@payrank.co" style="color:#888;text-decoration:none;">hello@payrank.co</a>
      </p>
    </td></tr>
  </table>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PayRank <hello@payrank.co>",
      to: [args.email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt.slice(0, 300)}`);
  }

  const { error: upErr } = await supabaseAdmin
    .from("diagnosticos" as never)
    .update({ email_sent: true, email_sent_at: new Date().toISOString() } as never)
    .eq("id", args.id);
  if (upErr) console.error("[sendReportEmail] flag update error:", upErr);
}