# Análisis de documentos + validación de perfil antes de generar el reporte

Aplica a los 4 modos (A, B, C, D). Bloquea la generación hasta que el usuario confirme.

## Cambios principales

### 1. Análisis exhaustivo de documentos (servidor)
Extender `extractFromDocument` en `src/lib/diagnostico/diagnostico.functions.ts` para que, además de los datos actuales, devuelva metadata de auditoría:

- `recibo_fecha` (ISO, si se detectó en el recibo)
- `recibo_tiene_variable_sin_monto` (boolean — menciona bono/variable sin valor)
- `titulo_cv` y `titulo_recibo` (cuando existan ambos y difieran)

Ajustar el prompt del extractor para devolver estos campos. Guardar todo en `state.datosExtraidos`.

### 2. Nueva ruta `src/routes/diagnostico.validacion.tsx`
Pantalla intermedia entre `inferencia` y `perfil` (o antes de `paywall` si ya hay inferencia validada). Muestra solo los warnings detectados; si no hay ninguno, navega automáticamente al siguiente paso.

Warnings posibles:

- **A. Recibo viejo** (>3 meses): "Tu recibo es de [fecha]. ¿Tu salario actual sigue siendo el mismo o cambió?"
  - Opciones: `Sigue igual` / `Cambió` → si cambió, input numérico para monto actual. Persiste en `respuestas.salario`.
- **B. Variable sin monto**: "Detectamos componente variable sin monto. ¿Cuál es el último bono cobrado?"
  - Input texto libre + checkbox "No tengo componente variable". Persiste en `respuestas.bonoUltimo` (nuevo campo) o `sinVariable`.
- **C. Inconsistencia de título** CV vs recibo: "Tu CV dice X pero tu recibo dice Y. ¿Cuál describe mejor lo que hacés hoy?"
  - 3 botones: CV / recibo / "Otro" con free text. Persiste en `respuestas.tituloElegido` (nuevo).
- **D. Antigüedad**: "¿Desde cuándo estás en esta empresa?" — `<input type="month">`. Persiste en `respuestas.antiguedadDesde` (nuevo, string `YYYY-MM`).

Tipos a extender en `src/lib/diagnostico/types.ts`: agregar `bonoUltimo`, `sinVariable`, `tituloElegido`, `antiguedadDesde` a `Respuestas`; agregar los 3 campos de auditoría a `DatosExtraidos`.

### 3. Pantalla de validación de perfil
Extender `src/routes/diagnostico.perfil.tsx` (ya existe como "validación final") agregando al tope una sección editable con dropdowns para:

- **Rol / función principal** (dropdown desde `FUNCIONES` + free text "Otro")
- **Industria / sector** (dropdown desde `INDUSTRIAS`)
- **Nivel de seniority** (dropdown desde `NIVELES`)
- **Tipo de empresa** (las 4 categorías exactas pedidas: Startup/PyME 1-99, Mediana 100-999, Grande nacional 1000-4999, Multinacional/Enterprise 5000+)

Título: "Esto es lo que entendimos de tu perfil. Confirmá o corregí antes de generar tu PayRank."

Cualquier cambio sobreescribe `state.respuestas` (que es lo que `createDiagnostico` ya mapea al row y de ahí al prompt). El botón "Confirmar y generar mi PayRank →" reemplaza al CTA actual y mantiene el flujo (crear diagnóstico → consentimientos → paywall → procesando).

### 4. Bloqueo de generación
La generación ya requiere confirmación humana (botón en `perfil` → `consentimientos` → `paywall` → `procesando`). Este plan mantiene esa propiedad: ninguna ruta llama `generateDiagnostico` automáticamente, solo `procesando` después del paywall.

Si hay warnings pendientes en `validacion`, no se permite avanzar hasta responderlos todos (botón "Continuar" disabled).

### 5. Wiring de ruta
Cambiar la navegación de `diagnostico.inferencia.tsx` (`confirm()`) para que vaya a `/diagnostico/validacion` en lugar de `/diagnostico/perfil`. Desde `validacion` se navega a `/diagnostico/perfil`. Si no hay warnings, `validacion` redirige solo (sin render) para no agregar fricción.

## Archivos a editar/crear

- **Crear**: `src/routes/diagnostico.validacion.tsx`
- **Editar**: `src/lib/diagnostico/types.ts` (nuevos campos), `src/lib/diagnostico/diagnostico.functions.ts` (prompt extractor + nuevos campos en DatosExtraidos), `src/routes/diagnostico.inferencia.tsx` (navegación), `src/routes/diagnostico.perfil.tsx` (sección de validación de perfil editable + cambio de wording del CTA)

## Fuera de scope
- No tocar el prompt principal de generación (los valores corregidos llegan vía `respuestas` → row de Supabase → prompt como hoy).
- No cambiar el flujo de pago/beta token.
- No tocar tipos de cambio (ya quedó resuelto).
