"use client";

import { useMemo, useState } from "react";
import { Play, Sparkles, Video, Lock, Unlock, Download, Image as ImageIcon, FileText, Lightbulb } from "lucide-react";
import { Act, Clue } from "@/lib/strapi/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ActExperienceProps {
  productTitle: string;
  acts: Act[];
}

const iconsByType: Record<string, JSX.Element> = {
  pdf: <FileText className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Play className="h-4 w-4" />,
  puzzle: <Lightbulb className="h-4 w-4" />,
};

export function ActExperience({ productTitle, acts }: ActExperienceProps) {
  const orderedActs = useMemo(() => [...acts].sort((a, b) => a.order - b.order), [acts]);
  const autoUnlocked = orderedActs
    .filter((act, index) => index === 0 || act.unlockType === "auto")
    .map((act) => String(act.id));
  const [unlockedActs, setUnlockedActs] = useState<Set<string>>(new Set(autoUnlocked));
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());
  const [unlockAnswers, setUnlockAnswers] = useState<Record<string, string>>({});
  const [finalNotes, setFinalNotes] = useState("");
  const [finalShared, setFinalShared] = useState(false);

  const unlockAct = (act: Act) => {
    const attempt = (unlockAnswers[String(act.id)] || "").trim().toLowerCase();
    const expectedCode = (act.unlockCode || "").trim().toLowerCase();

    if (act.unlockType === "auto") {
      setUnlockedActs(new Set([...unlockedActs, String(act.id)]));
      return;
    }

    if ((act.unlockType === "code" || act.unlockType === "answer") && expectedCode && attempt === expectedCode) {
      setUnlockedActs(new Set([...unlockedActs, String(act.id)]));
    }

    if (act.unlockType === "fileSolved" && attempt.length > 2) {
      setUnlockedActs(new Set([...unlockedActs, String(act.id)]));
    }
  };

  const revealClue = (clue: Clue) => {
    const attempt = (unlockAnswers[`clue-${clue.id}`] || "").trim().toLowerCase();
    const expected = (clue.solution || "").trim().toLowerCase();

    if (!expected || attempt === expected) {
      setRevealedClues(new Set([...revealedClues, String(clue.id)]));
    }
  };

  const unlockedCount = unlockedActs.size;
  const totalActs = orderedActs.length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-black to-neutral-900 text-white border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenido al caso: {productTitle}</CardTitle>
          <CardDescription className="text-white/70">
            Recorre los actos, desbloquea pruebas y escribe tu hipótesis. Las pistas cambian de formato: texto, fotos, PDF, audio, y rompecabezas con código.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <ProgressBadge label="Actos desbloqueados" value={`${unlockedCount}/${totalActs}`} />
            <ProgressBadge label="Pistas visibles" value={`${revealedClues.size} claves`} />
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4" />
              La historia reacciona a lo que escribes: algunas pistas sólo aparecen si respondes bien.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {orderedActs.map((act, index) => {
          const actId = String(act.id);
          const isUnlocked = unlockedActs.has(actId);
          const clueChallenge = act.clues.find((clue) => clue.solution);

          return (
            <Card key={act.id} className="border border-black/10 shadow-sm">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-semibold">{index + 1}</span>
                    {act.title}
                    {act.isFinalStep && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Final</span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm text-black/70">
                    {act.description || "Una escena inesperada te espera."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-green-600"><Unlock className="h-4 w-4" /> Abierto</span>
                  ) : (
                    <span className="flex items-center gap-1 text-black/60"><Lock className="h-4 w-4" /> Bloqueado</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {!isUnlocked && (
                  <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                    <p className="text-sm font-medium">Cómo desbloquear</p>
                    <UnlockHints act={act} clueChallenge={clueChallenge} />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        placeholder={act.unlockType === "fileSolved" ? "Escribe el nombre del archivo o la pista resuelta" : "Introduce el código o respuesta"}
                        value={unlockAnswers[actId] || ""}
                        onChange={(e) => setUnlockAnswers({ ...unlockAnswers, [actId]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && unlockAct(act)}
                        className="bg-white"
                      />
                      <Button onClick={() => unlockAct(act)} className="w-full sm:w-auto">Desbloquear</Button>
                    </div>
                  </div>
                )}

                {isUnlocked && act.videoUrl && (
                  <div className="overflow-hidden rounded-lg border">
                    <div className="bg-black/5 p-3 text-sm font-medium">Videomensaje del acto</div>
                    <div className="aspect-video bg-black/80 flex items-center justify-center text-white/80">
                      <a href={act.videoUrl} className="flex items-center gap-2 underline" target="_blank" rel="noreferrer">
                        <Play className="h-5 w-5" /> Ver video
                      </a>
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {act.clues.map((clue) => {
                      const clueId = String(clue.id);
                      const isRevealed = revealedClues.has(clueId) || !clue.solution;

                      return (
                        <div key={clue.id} className="rounded-lg border p-4 bg-white/90 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-black text-white uppercase">{clue.type || "pista"}</span>
                              <p className="font-medium">{clue.title}</p>
                            </div>
                            <div className="text-black/40 text-xs flex items-center gap-1">
                              {iconsByType[clue.type] || <Sparkles className="h-3 w-3" />} #{clue.order + 1}
                            </div>
                          </div>

                          {!isRevealed ? (
                            <div className="space-y-2">
                              {clue.previewImage && (
                                <img src={clue.previewImage} alt="Vista previa" className="w-full h-32 object-cover rounded-md border" />
                              )}
                              <p className="text-sm text-black/70">Escribe la solución correcta para revelar esta pista.</p>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Respuesta, código o nombre"
                                  value={unlockAnswers[`clue-${clue.id}`] || ""}
                                  onChange={(e) => setUnlockAnswers({ ...unlockAnswers, [`clue-${clue.id}`]: e.target.value })}
                                  onKeyDown={(e) => e.key === "Enter" && revealClue(clue)}
                                />
                                <Button onClick={() => revealClue(clue)} variant="outline">Revelar</Button>
                              </div>
                            </div>
                          ) : (
                            <ClueContent clue={clue} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-black/10">
        <CardHeader>
          <CardTitle>Tu informe final</CardTitle>
          <CardDescription>Entrega una versión corta de tus sospechas y cómo cada pista te llevó hasta ahí.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="¿Quién es culpable? ¿Qué coartada se rompe? ¿Qué pruebas cierran el caso?"
            value={finalNotes}
            onChange={(e) => setFinalNotes(e.target.value)}
            rows={5}
          />
          <Button
            onClick={() => setFinalShared(true)}
            disabled={!finalNotes.trim()}
            className="w-full sm:w-auto"
          >
            Enviar deducción
          </Button>
          {finalShared && (
            <p className="text-sm text-green-600">Recibido. Usaremos tu deducción para desbloquear el epílogo cuando esté disponible.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClueContent({ clue }: { clue: Clue }) {
  return (
    <div className="space-y-2 text-sm text-black/80">
      {clue.content && (
        <p className="leading-relaxed whitespace-pre-wrap">{clue.content}</p>
      )}
      {clue.file && (
        <a
          href={clue.file}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-black underline"
        >
          <Download className="h-4 w-4" /> Abrir archivo adjunto
        </a>
      )}
      {clue.type === "video" && clue.file && (
        <video controls className="w-full rounded-lg border">
          <source src={clue.file} />
        </video>
      )}
    </div>
  );
}

function UnlockHints({ act, clueChallenge }: { act: Act; clueChallenge?: Clue }) {
  if (act.unlockType === "auto") {
    return <p className="text-sm text-black/70">Este acto se abrirá automáticamente cuando llegues aquí.</p>;
  }

  if (act.unlockType === "fileSolved") {
    return <p className="text-sm text-black/70">Marca el nombre del informe o archivo que hayas resuelto para continuar.</p>;
  }

  if (clueChallenge?.solution) {
    return <p className="text-sm text-black/70">Descifra la pista clave "{clueChallenge.title}" e introduce su respuesta para avanzar.</p>;
  }

  return <p className="text-sm text-black/70">Introduce el código o palabra clave que recibiste durante la investigación.</p>;
}

function ProgressBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white/10 text-sm backdrop-blur border border-white/20">
      <div className="text-white/70">{label}</div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  );
}
