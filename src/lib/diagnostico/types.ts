export type Modo = "A" | "B" | "C" | "D";
export type Plan = "unico" | "pack3" | "anual";

export type Idioma = {
  idioma: string;
  nivel: "Básico" | "Intermedio" | "Avanzado" | "Nativo" | "";
  certificacion?: string;
};

export type Inferencia = {
  impactoNegocio: "Alto" | "Medio" | "Bajo";
  impactoJustif: string;
  complejidad: "Alto" | "Medio" | "Bajo";
  complejidadJustif: string;
  interlocucion: "Ejecutivo" | "Senior" | "Medio" | "Operativo";
  interlocucionJustif: string;
  influencia: "Global" | "Regional" | "Local";
  influenciaJustif: string;
  autonomia: "Alta" | "Media-Alta" | "Media" | "Baja";
  autonomiaJustif: string;
};

export type Documentos = {
  cvTexto?: string;
  cvNombre?: string;
  linkedinUrl?: string;
  descriptivoTexto?: string;
  descriptivoNombre?: string;
  reciboTexto?: string;
  reciboNombre?: string;
  avisoTexto?: string;
  avisoNombre?: string;
};

export type Respuestas = {
  pais?: string;
  paisOtro?: string;
  industria?: string;
  industriaOtra?: string;
  tipoEmpresa?: string;
  nivel?: string;
  nivelOtro?: string;
  alcance?: string;
  personasACargo?: string;
  funciones?: string[];
  funcionesOtra?: string;
  funcionesTexto?: string;
  interaccion?: string;
  idiomas?: Idioma[];
  sinIdiomas?: boolean;
  expTotal?: string;
  expIndustria?: string;
  formacion?: string[];
  certificaciones?: string[];
  sinCertificaciones?: boolean;
  certificacionesPending?: string;
  herramientasIA?: string[];
  frecuenciaIA?: string;
  usoIA?: string[];
  situacion?: "empleado" | "busqueda" | "freelance" | "contractor";
  salario?: number;
  moneda?: string;
  brutoNeto?: "bruto" | "neto";
  trabajaActualmente?: "si" | "no";
  salarioAnterior?: number;
  monedaAnterior?: string;
  tiempoSinTrabajo?: string;
  incrementoUltimoAnio?: "si" | "no";
  incrementoUltimoAnioPct?: number;
  // Beneficios granulares v3
  beneficio_salud_tipo?: string;
  beneficio_salud_monto?: number;
  beneficio_salud_prestadora?: string;
  bono_tipo?: string;
  bono_monto?: number;
  equity?: string;
  comisiones_tipo?: string;
  comisiones_monto?: number;
  beneficio_alimentacion_tipo?: string;
  beneficio_alimentacion_monto?: number;
  auto_corporativo?: string;
  beneficio_celular?: string;
  beneficio_movilidad_tipo?: string;
  beneficio_movilidad_monto?: number;
  beneficio_seguro_vida?: string;
  beneficio_retiro?: string;
  beneficio_401k_match?: string;
  beneficio_401k_porcentaje?: string;
  modalidad_trabajo?: string;
  modalidad_dias_presenciales?: string;
  beneficio_vacaciones_adicionales?: string;
  beneficio_capacitacion?: string;
  beneficios?: string[];
  beneficiosOtro?: string;
  beneficiosAdicionalesTexto?: string;
  beneficios_no_declarados?: string[];
  descripcionPuesto?: string;
  genero?: string;
  email?: string;
  whatsapp?: string;
  linkedinUrl?: string;
  herramientasIAOtra?: string;
  // Contractor sub-flow
  contractorHoras?: "40h" | "menos40" | "proyecto";
  contractorPago?: "usd" | "local" | "mixto";
  // Mode C sub-case
  subCasoC?: "oferta" | "entrevista";
  // Mode D target direction
  targetDireccionD?: string;
  // Auditoría de documentos (paso de validación)
  bonoUltimo?: string;
  bonoFrecuencia?: string;
  sinVariable?: boolean;
  tituloElegido?: string;
  antiguedadDesde?: string; // YYYY-MM
  experienciaTotalAnios?: number;
  experienciaIndustriaAnios?: number;
};

export type DatosExtraidos = {
  nombre_inferido?: string | null;
  titulo_puesto?: string | null;
  nivel_jerarquico_inferido?: string | null;
  industria_inferida?: string | null;
  tipo_empresa_inferida?: string | null;
  anos_experiencia_total_inferidos?: string | number | null;
  anos_experiencia_industria_inferidos?: string | number | null;
  experiencia_total_anios?: number | null;
  experiencia_industria_anios?: number | null;
  formacion?: string[] | null;
  certificaciones?: string[] | null;
  idiomas?: Array<{ idioma?: string; nivel?: string; certificacion?: string } | string> | null;
  funciones_inferidas?: string[] | null;
  alcance_inferido?: string | null;
  equipo_inferido?: string | null;
  herramientas_ia_inferidas?: string[] | null;
  salario_actual_inferido?: number | string | null;
  moneda_inferida?: string | null;
  tipo_salario_inferido?: string | null;
  beneficios_inferidos?: string[] | null;
  linkedin_url?: string | null;
  // Auditoría
  recibo_fecha?: string | null;
  recibo_tiene_variable_sin_monto?: boolean | null;
  titulo_cv?: string | null;
  titulo_cv_academico?: string | null;
  titulo_recibo?: string | null;
  bono_frecuencias_detectadas?: string[] | null;
  bono_mencionado_sin_monto?: boolean | null;
  [k: string]: unknown;
};

export type DiagnosticoState = {
  modo: Modo;
  plan: Plan;
  documentos: Documentos;
  respuestas: Respuestas;
  inferencia?: Inferencia;
  inferenciaValidada: boolean;
  datosExtraidos?: DatosExtraidos | null;
  // Set of step indices the user explicitly chose to "Cambiar" (override extracted)
  pasosOverride?: number[];
};
