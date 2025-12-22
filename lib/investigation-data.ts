export type EvidenceType =
  | "documento"
  | "foto"
  | "audio"
  | "objeto"
  | "recorte"
  | "mapa"
  | "otro";

export interface CaseFile {
  title: string;
  briefing: string;
  objective: string;
  version: string;
  status?: string;
}

export interface InvestigativeEvent {
  id: string;
  title: string;
  description: string;
  order?: number;
  unlocked?: boolean;
}

export interface CharacterProfile {
  id: string;
  name: string;
  family?: string;
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  summary: string;
  type: EvidenceType;
  eventId?: string;
  locationId?: string;
  characterId?: string;
  mediaUrl?: string;
  previewUrl?: string;
  restrictionReason?: string | null;
  unlocked?: boolean;
  transcript?: string;
}

export interface LocationPin {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  notes?: string;
  unlocked?: boolean;
  evidenceIds?: string[];
}

export type QuestionKind = "multiple_choice" | "association" | "chronology";

export interface InvestigationQuestion {
  id: string;
  prompt: string;
  type: QuestionKind;
  options?: string[];
  answer: string | string[];
  hints?: string[];
  unlocks?: {
    evidenceIds?: string[];
    eventIds?: string[];
    locationIds?: string[];
  };
  helperText?: string;
}

export interface InvestigationContent {
  caseFile: CaseFile;
  events: InvestigativeEvent[];
  evidences: EvidenceItem[];
  locations: LocationPin[];
  questions: InvestigationQuestion[];
  characters: CharacterProfile[];
  source: "strapi" | "fallback";
}

const FALLBACK_CASE: CaseFile = {
  title: "Los Hijos del Acantilado",
  version: "v1",
  briefing:
    "La inspectora Arrieta recuperó un archivador incompleto sobre la desaparición de tres jóvenes en la costa. Las notas mencionan un grupo que se autodenomina 'Los Hijos del Acantilado', rituales nocturnos y un baile improvisado en la plaza del pueblo la noche anterior a la tormenta.",
  objective:
    "Reconstruir los movimientos de la noche del martes, identificar el patrón común entre las desapariciones y localizar el escondite usado para ocultar a la última víctima.",
  status: "Investigación activa",
};

const FALLBACK_EVENTS: InvestigativeEvent[] = [
  {
    id: "amelia",
    title: "Informe Amelia",
    description: "Desaparición inicial y denuncias cruzadas entre la familia y el orfanato.",
    order: 1,
    unlocked: true,
  },
  {
    id: "acantilado",
    title: "Vigilia en el acantilado",
    description: "Rumores sobre cánticos en las rocas durante la marea viva.",
    order: 2,
    unlocked: true,
  },
  {
    id: "gorka",
    title: "Testimonio de Gorka",
    description: "El pescador afirma haber visto linternas hacia la cueva.",
    order: 3,
    unlocked: false,
  },
  {
    id: "cueva",
    title: "Entrada a la cueva",
    description: "Acceso estrecho protegido por tablones con símbolos.",
    order: 4,
    unlocked: false,
  },
  {
    id: "baile",
    title: "Baile en la plaza",
    description: "Registro de música improvisada antes de la tormenta.",
    order: 5,
    unlocked: true,
  },
  {
    id: "patron",
    title: "Patrón de desapariciones",
    description: "Fechas que coinciden con mareas vivas y lunas nuevas.",
    order: 6,
    unlocked: false,
  },
  {
    id: "iratxe",
    title: "Entrevista a Iratxe",
    description: "Exintegrante del grupo relata dinámicas internas.",
    order: 7,
    unlocked: false,
  },
  {
    id: "archivo",
    title: "Archivo municipal",
    description: "Recortes antiguos sobre desapariciones similares.",
    order: 8,
    unlocked: false,
  },
  {
    id: "bunkers",
    title: "Búnkers de la costa",
    description: "Refugios de posguerra usados como lugar de reunión.",
    order: 9,
    unlocked: false,
  },
  {
    id: "revelacion",
    title: "Revelación",
    description: "Conclusión provisional sobre la ubicación final.",
    order: 10,
    unlocked: false,
  },
];

const FALLBACK_LOCATIONS: LocationPin[] = [
  {
    id: "plaza",
    name: "Plaza",
    description: "Centro del pueblo. Se organizó un baile improvisado antes de la tormenta.",
    coordinates: { x: 16, y: 34 },
    notes: "La música tapó cualquier movimiento hacia el acantilado.",
    unlocked: true,
    evidenceIds: ["baile_registro"],
  },
  {
    id: "iglesia",
    name: "Iglesia",
    description: "Sacristía con libros sobre rituales locales.",
    coordinates: { x: 48, y: 28 },
    notes: "El párroco custodió recortes sobre juramentos frente al mar.",
    unlocked: false,
    evidenceIds: ["recorte_iglesia"],
  },
  {
    id: "acantilado",
    name: "Acantilado",
    description: "Zona de vigilia nocturna. Señales de velas y cánticos.",
    coordinates: { x: 78, y: 24 },
    notes: "Huellas recientes descienden hacia la cueva.",
    unlocked: true,
    evidenceIds: ["foto_acantilado"],
  },
  {
    id: "cueva",
    name: "Cueva",
    description: "Entrada estrecha con tablones y símbolos pintados.",
    coordinates: { x: 72, y: 52 },
    notes: "El eco altera el sonido: ideal para ocultar voces.",
    unlocked: false,
    evidenceIds: ["audio_cueva"],
  },
  {
    id: "orfanato",
    name: "Orfanato",
    description: "Edificio abandonado con expedientes sin catalogar.",
    coordinates: { x: 38, y: 62 },
    notes: "Los Hijos del Acantilado se reunían aquí de adolescentes.",
    unlocked: true,
    evidenceIds: ["expediente_amelia"],
  },
  {
    id: "bunkers",
    name: "Búnkers",
    description: "Refugios de posguerra con grafitis recientes.",
    coordinates: { x: 12, y: 68 },
    notes: "Puede servir como escondite final si logran mover a la víctima.",
    unlocked: false,
    evidenceIds: ["croquis_bunker"],
  },
];

const FALLBACK_EVIDENCES: EvidenceItem[] = [
  {
    id: "expediente_amelia",
    title: "Informe de desaparición - Amelia",
    summary: "Declaraciones contradictorias entre la tutora y el párroco.",
    type: "documento",
    eventId: "amelia",
    locationId: "orfanato",
    characterId: "amelia",
    mediaUrl: "",
    restrictionReason: null,
    unlocked: true,
  },
  {
    id: "foto_acantilado",
    title: "Fotografía del acantilado",
    summary: "Luces en fila, alineadas con la entrada a la cueva.",
    type: "foto",
    eventId: "acantilado",
    locationId: "acantilado",
    mediaUrl: "",
    restrictionReason: null,
    unlocked: true,
  },
  {
    id: "baile_registro",
    title: "Registro de música en la plaza",
    summary: "Lista de canciones pinchadas por Gorka. Duración total 43 minutos.",
    type: "recorte",
    eventId: "baile",
    locationId: "plaza",
    mediaUrl: "",
    restrictionReason: null,
    unlocked: true,
  },
  {
    id: "recorte_iglesia",
    title: "Recorte sobre juramento",
    summary: "Artículo antiguo sobre promesas frente al mar tras la guerra.",
    type: "recorte",
    eventId: "archivo",
    locationId: "iglesia",
    restrictionReason: "Pendiente de vincular con el patrón de desapariciones.",
    unlocked: false,
  },
  {
    id: "audio_cueva",
    title: "Grabación en la cueva",
    summary: "Cánticos distorsionados por el eco. Se oyen dos voces adultas.",
    type: "audio",
    eventId: "cueva",
    locationId: "cueva",
    restrictionReason: "Acceso restringido hasta establecer conexión con vigilia en el acantilado.",
    unlocked: false,
  },
  {
    id: "croquis_bunker",
    title: "Croquis de búnker",
    summary: "Mapa dibujado a mano con flechas hacia la costa.",
    type: "mapa",
    eventId: "bunkers",
    locationId: "bunkers",
    restrictionReason: "Necesita hipótesis que relacione búnkers con traslado de víctimas.",
    unlocked: false,
  },
];

const FALLBACK_QUESTIONS: InvestigationQuestion[] = [
  {
    id: "q_marea",
    prompt: "¿Qué patrón une las tres desapariciones?",
    type: "multiple_choice",
    options: [
      "Coinciden con mareas vivas",
      "Ocurren solo en invierno",
      "Relacionadas con festivales locales",
    ],
    answer: "Coinciden con mareas vivas",
    hints: [
      "Revisa el informe de Amelia y el recorte del archivo municipal.",
      "Las fechas se alinean con fases lunares extremas.",
    ],
    unlocks: {
      evidenceIds: ["recorte_iglesia"],
      eventIds: ["patron"],
      locationIds: ["iglesia"],
    },
    helperText: "Esta deducción abre documentación retenida por el archivo parroquial.",
  },
  {
    id: "q_cantos",
    prompt: "¿Dónde se amplifican los cánticos escuchados por Gorka?",
    type: "multiple_choice",
    options: ["En la cueva", "En la plaza", "En los búnkers"],
    answer: "En la cueva",
    hints: [
      "Gorka menciona eco y humedad.",
      "La grabación pendiente corresponde a un espacio cerrado cercano al mar.",
    ],
    unlocks: {
      evidenceIds: ["audio_cueva"],
      eventIds: ["cueva"],
      locationIds: ["cueva"],
    },
    helperText: "Permite acceder a la grabación para confirmar voces y ritmos.",
  },
  {
    id: "q_ruta",
    prompt: "¿Qué ruta usarían para mover a la víctima sin ser vistos?",
    type: "chronology",
    options: ["Plaza", "Acantilado", "Cueva", "Búnkers"],
    answer: ["Plaza", "Acantilado", "Cueva", "Búnkers"],
    hints: [
      "Empieza donde el ruido era mayor.",
      "Termina en el lugar más apartado y cubierto.",
    ],
    unlocks: {
      evidenceIds: ["croquis_bunker"],
      eventIds: ["bunkers", "revelacion"],
      locationIds: ["bunkers"],
    },
    helperText: "Esta secuencia habilita el croquis y los búnkers para inspección.",
  },
];

const FALLBACK_CHARACTERS: CharacterProfile[] = [
  {
    id: "amelia",
    name: "Amelia",
    family: "Orfanato",
    notes: "Desaparecida. Última vez vista cerca de la plaza.",
  },
  {
    id: "gorka",
    name: "Gorka",
    family: "Pescador",
    notes: "Testigo clave de luces en el acantilado.",
  },
  {
    id: "iratxe",
    name: "Iratxe",
    family: "Ex-integrante",
    notes: "Aporta contexto sobre los rituales juveniles.",
  },
];

const resolveMediaUrl = (asset: any): string => {
  if (!asset) return "";
  const rawUrl =
    (typeof asset === "string"
      ? asset
      : asset?.data?.attributes?.url || asset?.url || asset?.attributes?.url) || "";

  if (!rawUrl) return "";
  if (rawUrl.startsWith("http")) return rawUrl;
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
    process.env.STRAPI_URL?.replace(/\/$/, "") ||
    "";
  return `${base}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
};

const normalizeEntry = <T,>(entry: any): (T & { id: string }) | null => {
  if (!entry) return null;
  const attributes = entry.attributes ?? entry;
  const id = String(entry.id ?? attributes.id ?? attributes.slug ?? attributes.title);
  return { id, ...(attributes as T) };
};

const fetchFromStrapi = async <T,>(path: string) => {
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
    process.env.STRAPI_URL?.replace(/\/$/, "");
  if (!base) return null;
  try {
    const response = await fetch(`${base}/api/${path}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error("Strapi fetch failed", error);
    return null;
  }
};

export const loadInvestigationContent = async (): Promise<InvestigationContent> => {
  const [caseRes, eventsRes, evidencesRes, locationsRes, questionsRes, charactersRes] =
    await Promise.all([
      fetchFromStrapi<any>("case?populate=*") as Promise<any>,
      fetchFromStrapi<any>("events?populate=*") as Promise<any>,
      fetchFromStrapi<any>("evidences?populate=*") as Promise<any>,
      fetchFromStrapi<any>("locations?populate=*") as Promise<any>,
      fetchFromStrapi<any>("questions?populate=*") as Promise<any>,
      fetchFromStrapi<any>("characters?populate=*") as Promise<any>,
    ]);

  if (
    !caseRes &&
    !eventsRes &&
    !evidencesRes &&
    !locationsRes &&
    !questionsRes &&
    !charactersRes
  ) {
    return {
      caseFile: FALLBACK_CASE,
      events: FALLBACK_EVENTS,
      evidences: FALLBACK_EVIDENCES,
      locations: FALLBACK_LOCATIONS,
      questions: FALLBACK_QUESTIONS,
      characters: FALLBACK_CHARACTERS,
      source: "fallback",
    };
  }

  const caseFile: CaseFile = normalizeEntry(caseRes?.data) ?? FALLBACK_CASE;
  const events: InvestigativeEvent[] =
    eventsRes?.data?.map((entry: any) => {
      const normalized = normalizeEntry<InvestigativeEvent>(entry);
      return (
        normalized && {
          ...normalized,
          unlocked: normalized.unlocked ?? false,
        }
      );
    }) ?? FALLBACK_EVENTS;

  const evidences: EvidenceItem[] =
    evidencesRes?.data?.map((entry: any) => {
      const normalized = normalizeEntry<any>(entry);
      if (!normalized) return null;
      return {
        id: normalized.id,
        title: normalized.title || normalized.name || "Evidencia",
        summary: normalized.summary || normalized.description || "",
        type: (normalized.type as EvidenceType) || "otro",
        eventId: normalized.event?.data?.id?.toString() ?? normalized.eventId,
        locationId: normalized.location?.data?.id?.toString() ?? normalized.locationId,
        characterId: normalized.character?.data?.id?.toString() ?? normalized.characterId,
        mediaUrl: resolveMediaUrl(normalized.file || normalized.media || normalized.mediaUrl),
        previewUrl: resolveMediaUrl(normalized.preview || normalized.previewUrl),
        restrictionReason: normalized.restrictionReason || normalized.blockReason || null,
        unlocked: normalized.unlocked ?? normalized.published ?? false,
        transcript: normalized.transcript || "",
      } as EvidenceItem;
    })
      ?.filter(Boolean) as EvidenceItem[];

  const locations: LocationPin[] =
    locationsRes?.data?.map((entry: any) => {
      const normalized = normalizeEntry<any>(entry);
      if (!normalized) return null;
      const coords = normalized.coordinates || normalized.position || { x: 0, y: 0 };
      return {
        id: normalized.id,
        name: normalized.name || normalized.title,
        description: normalized.description || "",
        coordinates: {
          x: Number(coords.x ?? coords.X ?? 0),
          y: Number(coords.y ?? coords.Y ?? 0),
        },
        notes: normalized.notes || "",
        unlocked: normalized.unlocked ?? false,
        evidenceIds: normalized.evidences?.data?.map((ev: any) => String(ev.id)) || [],
      } as LocationPin;
    })
      ?.filter(Boolean) as LocationPin[];

  const questions: InvestigationQuestion[] =
    questionsRes?.data?.map((entry: any) => {
      const normalized = normalizeEntry<any>(entry);
      if (!normalized) return null;
      return {
        id: normalized.id,
        prompt: normalized.prompt || normalized.question || "",
        type: (normalized.type as QuestionKind) || "multiple_choice",
        options: normalized.options || normalized.choices || [],
        answer: normalized.answer ?? "",
        hints: normalized.hints || [],
        helperText: normalized.helperText || "",
        unlocks: {
          evidenceIds:
            normalized.unlocks?.evidences ||
            normalized.unlocks?.evidenceIds ||
            normalized.evidenceIds ||
            [],
          eventIds:
            normalized.unlocks?.events ||
            normalized.unlocks?.eventIds ||
            normalized.eventIds ||
            [],
          locationIds:
            normalized.unlocks?.locations ||
            normalized.unlocks?.locationIds ||
            normalized.locationIds ||
            [],
        },
      } as InvestigationQuestion;
    })
      ?.filter(Boolean) as InvestigationQuestion[];

  const characters: CharacterProfile[] =
    charactersRes?.data?.map((entry: any) => {
      const normalized = normalizeEntry<any>(entry);
      if (!normalized) return null;
      return {
        id: normalized.id,
        name: normalized.name || normalized.title,
        family: normalized.family,
        notes: normalized.notes || normalized.description,
      } as CharacterProfile;
    }) ?? FALLBACK_CHARACTERS;

  return {
    caseFile,
    events: events.length ? events : FALLBACK_EVENTS,
    evidences: evidences.length ? evidences : FALLBACK_EVIDENCES,
    locations: locations.length ? locations : FALLBACK_LOCATIONS,
    questions: questions.length ? questions : FALLBACK_QUESTIONS,
    characters,
    source: "strapi",
  };
};

export interface StoredProgress {
  reviewedEvents: Record<string, "abierto" | "revisado" | "conclusion">;
  unlockedEvidenceIds: string[];
  unlockedEventIds: string[];
  unlockedLocationIds: string[];
  viewedEvidenceIds: string[];
  theories: TheoryRecord[];
  questionResponses: Record<
    string,
    { answer: string | string[]; correct: boolean; hintsUsed: number }
  >;
  caseVersion: string;
}

export interface TheoryRecord {
  id: string;
  title: string;
  content: string;
  evidenceSupport: string[];
  feedback: string[];
  createdAt: string;
}

export const buildEmptyProgress = (caseVersion: string): StoredProgress => ({
  reviewedEvents: {},
  unlockedEvidenceIds: [],
  unlockedEventIds: [],
  unlockedLocationIds: [],
  viewedEvidenceIds: [],
  theories: [],
  questionResponses: {},
  caseVersion,
});

export const CASE_STORAGE_KEY = "los-hijos-acantilado";
