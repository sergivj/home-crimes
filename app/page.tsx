"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CASE_STORAGE_KEY,
  EvidenceItem,
  EvidenceType,
  InvestigationContent,
  InvestigationQuestion,
  LocationPin,
  StoredProgress,
  TheoryRecord,
  buildEmptyProgress,
  loadInvestigationContent,
} from "@/lib/investigation-data";

const statusLabels: Record<StoredProgress["reviewedEvents"][string], string> = {
  abierto: "Abierto",
  revisado: "Revisado",
  conclusion: "Conclusión provisional",
};

const typeLabels: Record<EvidenceType, string> = {
  documento: "Documento",
  foto: "Foto",
  audio: "Audio",
  objeto: "Objeto",
  recorte: "Recorte",
  mapa: "Croquis / Mapa",
  otro: "Evidencia",
};

const evidenceTypeBadge: Record<EvidenceType, string> = {
  documento: "bg-amber-100 text-amber-900 border-amber-300",
  foto: "bg-blue-100 text-blue-900 border-blue-300",
  audio: "bg-emerald-100 text-emerald-900 border-emerald-300",
  objeto: "bg-slate-100 text-slate-900 border-slate-300",
  recorte: "bg-rose-100 text-rose-900 border-rose-300",
  mapa: "bg-indigo-100 text-indigo-900 border-indigo-300",
  otro: "bg-stone-100 text-stone-900 border-stone-300",
};

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-stone-200 bg-white/90 shadow-sm shadow-stone-100">
    <div className="border-b border-stone-100 px-6 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{subtitle ?? "Informe"}</p>
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
    </div>
    <div className="p-6 space-y-3">{children}</div>
  </section>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-stone-200 ${className ?? "h-4"}`} />
);

const EvidenceCard = ({
  evidence,
  unlocked,
  onSelect,
}: {
  evidence: EvidenceItem;
  unlocked: boolean;
  onSelect: (ev: EvidenceItem) => void;
}) => {
  return (
    <button
      onClick={() => unlocked && onSelect(evidence)}
      className={`flex w-full flex-col items-start gap-2 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
        unlocked
          ? "border-stone-200 bg-white"
          : "border-dashed border-amber-300 bg-amber-50/70 text-amber-900"
      }`}
      aria-label={`Abrir ${evidence.title}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="text-sm font-semibold text-stone-900">{evidence.title}</div>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            evidenceTypeBadge[evidence.type]
          }`}
        >
          {typeLabels[evidence.type]}
        </span>
      </div>
      <p className="text-sm text-stone-700 line-clamp-2">{evidence.summary}</p>
      <div className="flex w-full items-center gap-2 text-[11px] text-stone-500">
        {evidence.eventId && <span>Evento: {evidence.eventId}</span>}
        {evidence.locationId && <span>Ubicación: {evidence.locationId}</span>}
      </div>
      {!unlocked && evidence.restrictionReason && (
        <p className="text-xs font-semibold text-amber-800">
          Acceso restringido · {evidence.restrictionReason}
        </p>
      )}
    </button>
  );
};

const EvidenceViewer = ({
  evidence,
  onClose,
}: {
  evidence: EvidenceItem | null;
  onClose: () => void;
}) => {
  if (!evidence) return null;

  const renderContent = () => {
    if (!evidence.mediaUrl) {
      return (
        <p className="text-sm text-stone-700">
          Sin fichero adjunto en Strapi. Revisa el resumen y las notas.
        </p>
      );
    }
    if (evidence.type === "foto" || evidence.type === "mapa" || evidence.type === "otro") {
      return (
        <img
          src={evidence.mediaUrl}
          alt={evidence.title}
          className="max-h-[60vh] w-full rounded-md object-contain"
        />
      );
    }
    if (evidence.type === "audio") {
      return (
        <audio controls className="w-full">
          <source src={evidence.mediaUrl} />
          Tu navegador no soporta audio.
        </audio>
      );
    }
    if (evidence.type === "documento" || evidence.type === "recorte") {
      return (
        <iframe
          src={evidence.mediaUrl}
          className="h-[60vh] w-full rounded-md border"
          title={evidence.title}
        />
      );
    }
    return (
      <p className="text-sm text-stone-700">
        Revisa el fichero adjunto: <a href={evidence.mediaUrl} className="underline">descargar</a>
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm"
        >
          Cerrar visor
        </button>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Evidencia</p>
            <h3 className="text-xl font-semibold text-stone-900">{evidence.title}</h3>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              evidenceTypeBadge[evidence.type]
            }`}
          >
            {typeLabels[evidence.type]}
          </span>
        </div>
        <p className="mb-4 text-sm text-stone-700">{evidence.summary}</p>
        {renderContent()}
        {evidence.transcript && (
          <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Notas rápidas</p>
            {evidence.transcript}
          </div>
        )}
      </div>
    </div>
  );
};

const MapPin = ({
  pin,
  unlocked,
  onSelect,
}: {
  pin: LocationPin;
  unlocked: boolean;
  onSelect: (pin: LocationPin) => void;
}) => (
  <button
    onClick={() => unlocked && onSelect(pin)}
    className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow ${
      unlocked
        ? "border-emerald-600 bg-emerald-200 hover:scale-105"
        : "border-dashed border-stone-300 bg-stone-100"
    }`}
    style={{ left: `${pin.coordinates.x}%`, top: `${pin.coordinates.y}%` }}
    aria-label={`Abrir ${pin.name}`}
  />
);

const QuestionCard = ({
  question,
  response,
  onAnswer,
  onHint,
}: {
  question: InvestigationQuestion;
  response?: { answer: string | string[]; correct: boolean; hintsUsed: number };
  onAnswer: (answer: string | string[]) => void;
  onHint: () => void;
}) => {
  const [selection, setSelection] = useState<string | string[]>(response?.answer ?? "");

  const handleSelection = (value: string) => {
    if (Array.isArray(question.answer)) {
      const current = Array.isArray(selection) ? selection : [];
      if (current.includes(value)) {
        setSelection(current.filter((item) => item !== value));
      } else {
        setSelection([...current, value]);
      }
    } else {
      setSelection(value);
    }
  };

  const resolvedSelection = useMemo(() => selection, [selection]);

  return (
    <div className="rounded-lg border border-stone-200 bg-white/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Pregunta de investigación</p>
          <h4 className="font-semibold text-stone-900">{question.prompt}</h4>
          {question.helperText && <p className="text-sm text-stone-600">{question.helperText}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
          response?.correct ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"
        }`}>
          {response?.correct ? "Desbloqueado" : "Pendiente"}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {question.options?.map((option) => {
          const selected = Array.isArray(resolvedSelection)
            ? resolvedSelection.includes(option)
            : resolvedSelection === option;
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                selected
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <input
                type={Array.isArray(question.answer) ? "checkbox" : "radio"}
                name={question.id}
                value={option}
                checked={selected}
                onChange={() => handleSelection(option)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-stone-800">{option}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          onClick={() => onAnswer(resolvedSelection)}
        >
          Registrar respuesta
        </button>
        <button
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          onClick={onHint}
        >
          Pedir pista ({response?.hintsUsed ?? 0}/2)
        </button>
      </div>
      {response && (
        <p className={`mt-2 text-sm ${response.correct ? "text-emerald-700" : "text-stone-700"}`}>
          {response.correct
            ? "Desbloqueo aplicado. Continúa con la siguiente evidencia."
            : "Respuesta registrada. Ajusta la deducción si nuevas evidencias aparecen."}
        </p>
      )}
    </div>
  );
};

export default function Home() {
  const [content, setContent] = useState<InvestigationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "caso" | "evidencias" | "mapa" | "teorias" | "cronologia"
  >("caso");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationPin | null>(null);
  const [filters, setFilters] = useState({
    type: "todas",
    event: "todos",
    location: "todas",
    character: "todos",
  });
  const [theoryDraft, setTheoryDraft] = useState({
    title: "", content: "", evidenceSupport: [] as string[],
  });
  const [progress, setProgress] = useState<StoredProgress | null>(null);
  const [storageKey, setStorageKey] = useState(CASE_STORAGE_KEY);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const payload = await loadInvestigationContent();
        setContent(payload);
        const versionedKey = `${CASE_STORAGE_KEY}-${payload.caseFile.version}`;
        setStorageKey(versionedKey);
        const stored = typeof window !== "undefined" ? localStorage.getItem(versionedKey) : null;
        if (stored) {
          const parsed = JSON.parse(stored) as StoredProgress;
          setProgress(parsed.caseVersion === payload.caseFile.version ? parsed : buildEmptyProgress(payload.caseFile.version));
        } else {
          setProgress(buildEmptyProgress(payload.caseFile.version));
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el expediente. Utiliza los datos de respaldo.");
        setContent({
          caseFile: {
            title: "Los Hijos del Acantilado",
            briefing: "",
            objective: "",
            version: "v1",
          },
          events: [],
          evidences: [],
          locations: [],
          questions: [],
          characters: [],
          source: "fallback",
        });
        setProgress(buildEmptyProgress("v1"));
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (progress) {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    }
  }, [progress, storageKey]);

  const availableEvents = useMemo(() => content?.events ?? [], [content]);

  const accessibleEvidence = useMemo(() => {
    if (!content) return [] as EvidenceItem[];
    const unlockedIds = new Set([
      ...((progress?.unlockedEvidenceIds ?? []) as string[]),
      ...content.evidences.filter((ev) => ev.unlocked).map((ev) => ev.id),
    ]);
    return content.evidences.map((ev) => ({ ...ev, unlocked: unlockedIds.has(ev.id) }));
  }, [content, progress?.unlockedEvidenceIds]);

  const visibleEvidence = useMemo(() => {
    return accessibleEvidence.filter((ev) => {
      const typeOk = filters.type === "todas" || ev.type === filters.type;
      const eventOk = filters.event === "todos" || ev.eventId === filters.event;
      const locationOk = filters.location === "todas" || ev.locationId === filters.location;
      const characterOk = filters.character === "todos" || ev.characterId === filters.character;
      return typeOk && eventOk && locationOk && characterOk;
    });
  }, [accessibleEvidence, filters]);

  const unlockedLocations = useMemo(() => {
    const unlockedIds = new Set([
      ...((progress?.unlockedLocationIds ?? []) as string[]),
      ...content?.locations.filter((loc) => loc.unlocked).map((loc) => loc.id),
    ]);
    return content?.locations.map((loc) => ({ ...loc, unlocked: unlockedIds.has(loc.id) })) ?? [];
  }, [content, progress?.unlockedLocationIds]);

  const reviewedEvents = progress?.reviewedEvents ?? {};

  const handleEvidenceSelect = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setProgress((prev) => {
      if (!prev) return prev;
      const viewed = new Set(prev.viewedEvidenceIds);
      viewed.add(evidence.id);
      return { ...prev, viewedEvidenceIds: Array.from(viewed) };
    });
  };

  const cycleEventStatus = (eventId: string) => {
    setProgress((prev) => {
      if (!prev) return prev;
      const current = prev.reviewedEvents[eventId] ?? "abierto";
      const next = current === "abierto" ? "revisado" : current === "revisado" ? "conclusion" : "abierto";
      return { ...prev, reviewedEvents: { ...prev.reviewedEvents, [eventId]: next } };
    });
  };

  const persistTheory = () => {
    if (!progress || !theoryDraft.title.trim()) return;
    const feedback = buildSoftFeedback(theoryDraft, accessibleEvidence);
    const newTheory: TheoryRecord = {
      id: crypto.randomUUID(),
      title: theoryDraft.title.trim(),
      content: theoryDraft.content.trim(),
      evidenceSupport: theoryDraft.evidenceSupport,
      feedback,
      createdAt: new Date().toISOString(),
    };
    setProgress({ ...progress, theories: [newTheory, ...progress.theories] });
    setTheoryDraft({ title: "", content: "", evidenceSupport: [] });
  };

  const handleAnswer = (question: InvestigationQuestion, answer: string | string[]) => {
    if (!progress) return;
    const correct = compareAnswers(question.answer, answer);
    const unlocks = question.unlocks ?? {};
    setProgress((prev) => {
      if (!prev) return prev;
      const unlockedEvidence = new Set(prev.unlockedEvidenceIds);
      const unlockedEvents = new Set(prev.unlockedEventIds);
      const unlockedLocationsSet = new Set(prev.unlockedLocationIds);

      if (correct) {
        unlocks.evidenceIds?.forEach((id) => unlockedEvidence.add(id));
        unlocks.eventIds?.forEach((id) => unlockedEvents.add(id));
        unlocks.locationIds?.forEach((id) => unlockedLocationsSet.add(id));
      }

      return {
        ...prev,
        unlockedEvidenceIds: Array.from(unlockedEvidence),
        unlockedEventIds: Array.from(unlockedEvents),
        unlockedLocationIds: Array.from(unlockedLocationsSet),
        questionResponses: {
          ...prev.questionResponses,
          [question.id]: {
            answer,
            correct,
            hintsUsed: prev.questionResponses[question.id]?.hintsUsed ?? 0,
          },
        },
      };
    });
  };

  const handleHint = (question: InvestigationQuestion) => {
    if (!progress) return;
    const response = progress.questionResponses[question.id];
    const used = response?.hintsUsed ?? 0;
    const nextHintIndex = Math.min(used, (question.hints?.length ?? 1) - 1);
    const hint = question.hints?.[nextHintIndex] ?? "Sin pistas adicionales.";
    setHintMessage(hint);
    if (used >= 2) return;
    setProgress({
      ...progress,
      questionResponses: {
        ...progress.questionResponses,
        [question.id]: {
          answer: response?.answer ?? "",
          correct: response?.correct ?? false,
          hintsUsed: used + 1,
        },
      },
    });
  };

  const resetCase = () => {
    if (!content) return;
    setProgress(buildEmptyProgress(content.caseFile.version));
    setSelectedEvidence(null);
    setSelectedLocation(null);
    setHintMessage(null);
  };

  if (loading || !content || !progress) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </main>
    );
  }

  const progressSummary = [
    `${progress.viewedEvidenceIds.length} evidencias revisadas`,
    `${Object.keys(progress.reviewedEvents).length} eventos con estado`,
    `${progress.theories.length} hipótesis guardadas`,
  ];

  return (
    <main className="min-h-screen bg-[#f8f3e8] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Expediente</p>
            <h1 className="text-xl font-semibold">{content.caseFile.title}</h1>
            <p className="text-sm text-stone-600">{content.caseFile.status}</p>
          </div>
          <div className="flex items-center gap-2">
            {(["caso", "evidencias", "mapa", "teorias", "cronologia"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeSection === key
                    ? "bg-stone-900 text-white shadow"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {key === "caso"
                  ? "Caso"
                  : key === "evidencias"
                  ? "Evidencias"
                  : key === "mapa"
                  ? "Mapa"
                  : key === "teorias"
                  ? "Teorías"
                  : "Cronología"}
              </button>
            ))}
            <button
              onClick={resetCase}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-800 hover:bg-rose-100"
            >
              Reiniciar caso
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        <SectionCard title="Briefing del caso" subtitle="Caso" >
          <p className="text-sm leading-relaxed text-stone-700">{content.caseFile.briefing}</p>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Estado actual</p>
            {content.caseFile.objective}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-stone-600">
            {progressSummary.map((item) => (
              <span key={item} className="rounded-full border border-stone-200 bg-white px-3 py-1 shadow-sm">
                {item}
              </span>
            ))}
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
              Fuente: {content.source === "strapi" ? "Strapi" : "Respaldo"}
            </span>
          </div>
        </SectionCard>

        {activeSection === "caso" && (
          <SectionCard title="Eventos investigativos" subtitle="Eventos">
            <div className="grid gap-3 md:grid-cols-2">
              {availableEvents
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((event) => {
                  const status = reviewedEvents[event.id] ?? "abierto";
                  const unlocked = event.unlocked || progress.unlockedEventIds.includes(event.id);
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-4 shadow-sm ${
                        unlocked ? "border-stone-200 bg-white" : "border-dashed border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{`Evento ${event.order ?? ""}`}</p>
                          <h3 className="text-base font-semibold text-stone-900">{event.title}</h3>
                          <p className="text-sm text-stone-700">{event.description}</p>
                        </div>
                        <button
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            status === "abierto"
                              ? "bg-stone-100 text-stone-700"
                              : status === "revisado"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                          onClick={() => cycleEventStatus(event.id)}
                          disabled={!unlocked}
                        >
                          {unlocked ? statusLabels[status] : "Acceso restringido"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </SectionCard>
        )}

        {activeSection === "evidencias" && (
          <SectionCard title="Evidencias" subtitle="Archivo">
            <div className="grid gap-3 md:grid-cols-5">
              <select
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="todas">Tipo</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                value={filters.event}
                onChange={(e) => setFilters({ ...filters, event: e.target.value })}
              >
                <option value="todos">Evento</option>
                {content.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="todas">Ubicación</option>
                {content.locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                value={filters.character}
                onChange={(e) => setFilters({ ...filters, character: e.target.value })}
              >
                <option value="todos">Familia/Personaje</option>
                {content.characters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
              <button
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                onClick={() => setFilters({ type: "todas", event: "todos", location: "todas", character: "todos" })}
              >
                Limpiar filtros
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleEvidence.map((evidence) => (
                <EvidenceCard
                  key={evidence.id}
                  evidence={evidence}
                  unlocked={!!evidence.unlocked}
                  onSelect={handleEvidenceSelect}
                />
              ))}
              {visibleEvidence.length === 0 && (
                <p className="text-sm text-stone-600">No hay evidencias con los filtros actuales.</p>
              )}
            </div>
          </SectionCard>
        )}

        {activeSection === "mapa" && (
          <SectionCard title="Mapa de ubicaciones" subtitle="Mapa">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative h-80 w-full overflow-hidden rounded-lg border border-stone-200 bg-gradient-to-br from-slate-50 to-slate-100">
                <img
                  src="https://dummyimage.com/800x600/ebe4d8/40372b&text=Mapa+de+Costa"
                  alt="Mapa ilustrado"
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                {unlockedLocations.map((pin) => (
                  <MapPin
                    key={pin.id}
                    pin={pin}
                    unlocked={!!pin.unlocked}
                    onSelect={setSelectedLocation}
                  />
                ))}
              </div>
              <div className="w-full space-y-3 md:w-1/2">
                {selectedLocation ? (
                  <div className="rounded-lg border border-stone-200 bg-white p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Ubicación</p>
                    <h3 className="text-lg font-semibold text-stone-900">{selectedLocation.name}</h3>
                    <p className="text-sm text-stone-700">{selectedLocation.description}</p>
                    <div className="mt-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Notas de la inspectora</p>
                      {selectedLocation.notes}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-stone-800">Evidencias asociadas</p>
                    <ul className="list-disc pl-5 text-sm text-stone-700">
                      {accessibleEvidence
                        .filter((ev) => ev.locationId === selectedLocation.id)
                        .map((ev) => (
                          <li key={ev.id} className="mt-1">
                            <button
                              onClick={() => handleEvidenceSelect(ev)}
                              className="underline decoration-dotted underline-offset-4"
                            >
                              {ev.title}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-stone-600">Selecciona un pin para abrir el panel de información.</p>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === "teorias" && (
          <SectionCard title="Hipótesis y análisis" subtitle="Teorías">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <input
                  type="text"
                  value={theoryDraft.title}
                  onChange={(e) => setTheoryDraft({ ...theoryDraft, title: e.target.value })}
                  placeholder="Título del informe"
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                />
                <textarea
                  value={theoryDraft.content}
                  onChange={(e) => setTheoryDraft({ ...theoryDraft, content: e.target.value })}
                  placeholder="Describe la hipótesis, observaciones y relación con el caso."
                  className="h-32 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Evidencias de soporte</p>
                  <div className="grid grid-cols-2 gap-2">
                    {accessibleEvidence.slice(0, 8).map((ev) => {
                      const selected = theoryDraft.evidenceSupport.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                            selected
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-stone-200 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              setTheoryDraft((prev) => ({
                                ...prev,
                                evidenceSupport: selected
                                  ? prev.evidenceSupport.filter((id) => id !== ev.id)
                                  : [...prev.evidenceSupport, ev.id],
                              }));
                            }}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className="text-stone-800">{ev.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={persistTheory}
                  className="rounded-md border border-stone-300 bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
                >
                  Registrar observación
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"
                >
                  Exportar notas/teorías (PDF)
                </button>
              </div>
              <div className="space-y-3">
                {progress.theories.length === 0 && (
                  <p className="text-sm text-stone-600">Aún no se han registrado hipótesis.</p>
                )}
                {progress.theories.map((theory) => (
                  <div key={theory.id} className="rounded-lg border border-stone-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Hipótesis</p>
                        <h4 className="text-base font-semibold text-stone-900">{theory.title}</h4>
                        <p className="text-xs text-stone-500">{new Date(theory.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right text-xs text-stone-600">
                        {theory.evidenceSupport.length} evidencias apoyo
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-stone-700">{theory.content}</p>
                    <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Comprobación suave</p>
                      <ul className="list-disc pl-4">
                        {theory.feedback.map((fb) => (
                          <li key={fb}>{fb}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === "cronologia" && (
          <SectionCard title="Preguntas de investigación" subtitle="Desbloqueos">
            <div className="space-y-3">
              {content.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  response={progress.questionResponses[question.id]}
                  onAnswer={(answer) => handleAnswer(question, answer)}
                  onHint={() => handleHint(question)}
                />
              ))}
              {hintMessage && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Pista</p>
                  {hintMessage}
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>

      <EvidenceViewer evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
    </main>
  );
}

function compareAnswers(expected: string | string[], given: string | string[]) {
  if (Array.isArray(expected)) {
    const givenArr = Array.isArray(given) ? given : [];
    return (
      expected.length === givenArr.length &&
      expected.every((item) => givenArr.includes(item))
    );
  }
  if (Array.isArray(given)) return false;
  return expected.trim().toLowerCase() === given.trim().toLowerCase();
}

function buildSoftFeedback(
  theoryDraft: { title: string; content: string; evidenceSupport: string[] },
  evidences: EvidenceItem[],
) {
  const linkedEvidences = evidences.filter((ev) => theoryDraft.evidenceSupport.includes(ev.id));
  const feedback: string[] = [];

  if (linkedEvidences.length) {
    const events = new Set(linkedEvidences.map((ev) => ev.eventId).filter(Boolean));
    if (events.size > 1) {
      feedback.push("La hipótesis conecta eventos dispersos: revisa coincidencias temporales.");
    } else if (events.size === 1) {
      feedback.push("Concentra las evidencias en un único evento: busca contradicciones externas.");
    }

    const types = new Set(linkedEvidences.map((ev) => ev.type));
    if (types.has("audio")) {
      feedback.push("Incluye audio: compara ritmos o voces con el registro de la plaza.");
    }
    if (types.has("mapa")) {
      feedback.push("El croquis puede sugerir rutas; valida con la cronología de la vigilia.");
    }
  } else {
    feedback.push("Faltan evidencias de soporte: vincula al menos una prueba concreta.");
  }

  if (theoryDraft.content.length < 80) {
    feedback.push("Amplía la descripción para registrar observaciones y dudas.");
  }

  return feedback;
}
