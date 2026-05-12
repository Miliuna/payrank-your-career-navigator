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
  autonomia: "Alta" | "Media" | "Baja";
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
  herramientasIA?: string[];
  frecuenciaIA?: string;
  usoIA?: string[];
  situacion?: "empleado" | "busqueda" | "freelance";
  salario?: number;
  moneda?: string;
  brutoNeto?: "bruto" | "neto";
  trabajaActualmente?: "si" | "no";
  salarioAnterior?: number;
  monedaAnterior?: string;
  tiempoSinTrabajo?: string;
  beneficios?: string[];
  descripcionPuesto?: string;
  genero?: string;
  email?: string;
  whatsapp?: string;
};

export type DiagnosticoState = {
  modo: Modo;
  plan: Plan;
  documentos: Documentos;
  respuestas: Respuestas;
  inferencia?: Inferencia;
  inferenciaValidada: boolean;
};
