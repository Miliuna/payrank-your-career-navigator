
## Plan de 6 ajustes

### 1. Campo URL de LinkedIn en upload
- En `src/routes/diagnostico.upload.tsx`, agregar bajo lista de docs sugeridos:
  - Label "O PEGÁ LA URL DE TU PERFIL DE LINKEDIN" (font-ui)
  - Input con placeholder `https://linkedin.com/in/tu-perfil`
  - Validar que empiece con `linkedin.com` o `https://linkedin.com`
- Al continuar:
  - Guardar URL en `state.respuestas.linkedinUrl` (extender tipo en `types.ts`)
  - Al armar `extractFromDocument`: anteponer `LinkedIn URL: <url>\n\n` al texto
  - En `createDiagnostico` server-fn: persistir `linkedin_url` en Supabase
- URL **+** PDF: ambos se procesan; si solo URL, se procesa solo URL.

### 2. Campo "Especificá acá" en cada "Otra/Otro"
Auditar `diagnostico.preguntas.tsx`. Donde existe opción Otra/Otro y aún no hay subcampo:
- Industria: ya tiene `industriaOtra`. Verificar animación fadeIn.
- País: ya tiene `paisOtro`.
- Funciones: ya tiene `funcionesOtra`.
- Idiomas → "Otro idioma": agregar input.
- Formación, Certificaciones, Beneficios, Herramientas IA: agregar input "Otra" donde aplique.
- Crear pequeño componente `<OtroInput show value onChange />` con `animate-in fade-in duration-300`.

### 3. Contractor como cuarta situación laboral
- `data.ts` / `types.ts`: agregar `'contractor'` a tipo `Situacion` y a opciones de la pregunta.
- `diagnostico.preguntas.tsx`: agregar card con descripción y sub-flujo:
  - Horas semanales: `40h | <40h | por proyecto` → `respuestas.contractorHoras`
  - Modalidad de pago: `USD | local | mixto` → `respuestas.contractorPago`
  - Monto mensual + moneda (reusar campos `salario` / `moneda`)
- `prompt.ts`: en sección de equivalencia salarial, agregar regla:
  - contractor con 40h fijas y un solo cliente → factor × 0.75 (vs freelance default).
- `diagnostico.functions.ts` (createDiagnostico): persistir en `situacion_laboral='contractor'` y mapear sub-campos.

### 4. Teléfono con formato por país
- En `diagnostico.consentimientos.tsx` (donde está WhatsApp): leer `state.respuestas.pais` y derivar placeholder.
- Mapping: AR `+54 9 11 XXXX XXXX` · MX `+52 1 55 XXXX XXXX` · CL `+56 9 XXXX XXXX` · CO `+57 3XX XXX XXXX` · ES `+34 6XX XXX XXX` · US `+1 (XXX) XXX-XXXX` · default `+[código] número`.
- Si ya existe, dejar comentario confirmando.

### 5. Botón landing ya NO va a paywall
- `src/routes/index.tsx`: cambiar destino del CTA principal "HACER MI PAYRANK" a `/modo` (selección de situación). Auditar todos los CTAs de landing.

### 6. Reporte no se genera (CRÍTICO)
Investigar y arreglar la cadena:
- Paywall (`diagnostico.paywall.tsx`): `confirmBetaAccess(id, token)` → navigate `/diagnostico/procesando?id=...`. Verificar que setea `pago_confirmado=true` en Supabase.
- Procesando (`diagnostico.procesando.tsx`): `generateDiagnostico({id})` → en éxito navigate `/diagnostico/$id`.
- `generateDiagnostico` en `diagnostico.functions.ts`: leer fila, llamar Anthropic con prompt v2.0, guardar `resultado_json`, retornar `{id}`.
- Detalle (`diagnostico.$id.tsx`): leer `resultado_json` y renderizar.
- Probar end-to-end con token `beta-001-payrank` vía `stack_modern--invoke-server-function` o creando una fila de prueba.

### Archivos a editar
- `src/lib/diagnostico/types.ts`, `data.ts`, `store.tsx`, `prompt.ts`, `diagnostico.functions.ts`
- `src/routes/diagnostico.upload.tsx`, `diagnostico.preguntas.tsx`, `diagnostico.consentimientos.tsx`, `diagnostico.paywall.tsx`, `diagnostico.procesando.tsx`, `index.tsx`
- (posiblemente) `diagnostico.$id.tsx`
- 1 nueva migración Supabase para columna `linkedin_url` si no existe (verificar primero — ya existe en schema).

### Verificación final
- Test end-to-end con `beta-001-payrank`: crear diagnóstico vía server-fn, simular pago, generar reporte, leer fila resultante para confirmar `resultado_json` poblado.
