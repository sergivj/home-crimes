"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, CheckCircle, Loader2, MailCheck } from "lucide-react"
import { useTranslations } from 'next-intl'
import type {
  Case,
  Event,
  Evidence,
  Location,
  Character,
  Family,
  Question,
} from "@/lib/strapi/api"

type CaseExperiencePayload = Case & {
  evidence: Evidence[]
  events: Event[]
  locations: Location[]
  characters: Character[]
  families: Family[]
  questions: Question[]
}

export default function GameAccessPage() {
  const t = useTranslations('gameAccess');
  const searchParams = useSearchParams();
  const [accessCode, setAccessCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [caseFile, setCaseFile] = useState<CaseExperiencePayload | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [loadingExperience, setLoadingExperience] = useState(false)
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")

  const fallbackCase: CaseExperiencePayload = useMemo(() => ({
    id: 'fallback-case',
    title: 'Sala de caso',
    slug: 'demo',
    briefing: 'Revisa el expediente del caso, ordena los eventos y conecta las evidencias clave.',
    disclaimer: 'Cargado en modo sin conexión.',
    currentObjectiveTemplate: 'Reconstruye la cronología y relaciona las pruebas con cada evento.',
    theme: 'police-file',
    events: [],
    evidence: [],
    locations: [],
    characters: [],
    families: [],
    questions: [],
  }), [])

  const lookupSessionId = searchParams.get('session_id')
  const productFromQuery = searchParams.get('product')

  useEffect(() => {
    const autoBootstrap = async () => {
      if (!lookupSessionId) return
      setPending(true)
      try {
        const response = await fetch(`/api/checkout/success?session_id=${lookupSessionId}${productFromQuery ? `&product=${productFromQuery}` : ''}`)
        const payload = await response.json()

        if (response.ok && payload.code) {
          setAccessCode(payload.code)
          setStatusMessage('Pago confirmado. Hemos enviado tu código de acceso por email y lo hemos pegado aquí por si acaso.')
          setEmailSentTo(payload.email || null)
          await validateCode(payload.code)
        } else {
          setError(payload.error || 'No pudimos validar el pago. Escribe tu código manualmente.')
        }
      } catch (err) {
        console.error(err)
        setError('No pudimos validar automáticamente tu compra, introduce el código manualmente.')
      } finally {
        setPending(false)
      }
    }

    autoBootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupSessionId, productFromQuery])

  const validateCode = async (codeToValidate?: string) => {
    const finalCode = (codeToValidate || accessCode).trim()
    if (!finalCode) return

    setPending(true)
    setError("")

    try {
      const response = await fetch('/api/game-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: finalCode }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || t('errorInvalidCode'))
        return
      }

      setIsAuthenticated(true)
      await loadExperience(payload.productSlug)
    } catch (err) {
      setError(t('errorInvalidCode'))
    } finally {
      setPending(false)
    }
  }

  const loadExperience = async (slug: string) => {
    setLoadingExperience(true)
    try {
      const response = await fetch(`/api/game-experience?slug=${slug}`)
      if (!response.ok) {
        throw new Error('No se pudo cargar la partida')
      }
      const payload = await response.json()
      setCaseFile(payload)
    } catch (err) {
      console.error(err)
      setCaseFile({ ...fallbackCase, slug: slug || fallbackCase.slug })
    } finally {
      setLoadingExperience(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{t('title')}</CardTitle>
                  <CardDescription>
                    {t('description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); validateCode(); }} className="space-y-4">
                    <div className="space-y-3">
                      <div className="text-sm">{t('codeLabel')}</div>
                      <Input
                        id="access-code"
                        placeholder={t('codePlaceholder')}
                        value={accessCode}
                        onChange={(e) => {
                          setAccessCode(e.target.value)
                          setError("")
                        }}
                        className="text-center text-lg uppercase"
                        autoFocus
                        disabled={pending}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {statusMessage && (
                      <Alert>
                        <AlertDescription className="flex items-center gap-2">
                          <MailCheck className="h-4 w-4" />
                          {statusMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full border hover:bg-black hover:text-white cursor-pointer" size="lg">
                      {pending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Validando...
                        </span>
                      ) : (
                        t('submitButton')
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
                    <p className="font-medium mb-2">{t('cantFindCode')}</p>
                    <p className="text-black/50">
                      {t('cantFindCodeDescription')} <a href='mailto:support@homecrimes.com'>support@homecrimes.com</a>
                    </p>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-primary/5 text-sm">
                    <p className="font-medium mb-2 text-primary">{t('demoCodes')}</p>
                    <p className="text-black/50 mb-1">{t('demoCodesDescription')}</p>
                    <ul className="text-black/50 space-y-1 text-xs">
                      <li>• HC-DEMO-ARCHIVO.DEMO</li>
                      <li>• Códigos enviados tras el pago</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : loadingExperience ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-semibold">Cargando tu sala de caso...</p>
              <p className="text-black/60">Validando tu código y preparando las evidencias.</p>
            </div>
          ) : caseFile ? (
            <div className="max-w-5xl mx-auto space-y-6">
              <Alert className="mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-black">
                  {emailSentTo ? `Código validado. Revisa ${emailSentTo} por si quieres guardarlo.` : t('successMessage')}
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-center">
                <p className="text-sm uppercase tracking-wide text-black/50">Expediente</p>
                <h1 className="text-3xl md:text-4xl font-bold">{caseFile.title}</h1>
                {caseFile.disclaimer && (
                  <p className="text-xs text-amber-700 bg-amber-50 inline-flex px-3 py-2 rounded-full">{caseFile.disclaimer}</p>
                )}
                <p className="text-black/70 max-w-3xl mx-auto leading-relaxed">{caseFile.briefing}</p>
                {caseFile.currentObjectiveTemplate && (
                  <p className="text-sm text-primary font-semibold">
                    Objetivo actual: {caseFile.currentObjectiveTemplate}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>Eventos</CardTitle>
                    <CardDescription>Hitos de la investigación ordenados cronológicamente.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {caseFile.events.length === 0 && (
                      <p className="text-sm text-black/60">Añade eventos en Strapi para empezar a desbloquear evidencias.</p>
                    )}
                    {caseFile.events.map((event) => (
                      <div key={event.id} className="rounded-lg border p-3 bg-white/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{event.title}</p>
                          {typeof event.orderIndex === 'number' && (
                            <span className="text-xs text-black/50">Orden {event.orderIndex}</span>
                          )}
                        </div>
                        {event.summary && <p className="text-sm text-black/70">{event.summary}</p>}
                        {event.unlockDescription && (
                          <p className="text-xs text-primary">Desbloqueo: {event.unlockDescription}</p>
                        )}
                        {event.statusText && (
                          <p className="text-xs text-black/60">Estado: {event.statusText}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>Evidencias</CardTitle>
                    <CardDescription>Pruebas asociadas a eventos, personajes y ubicaciones.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {caseFile.evidence.length === 0 && (
                      <p className="text-sm text-black/60">Crea evidencias en Strapi y relaciónalas con eventos o ubicaciones.</p>
                    )}
                    {caseFile.evidence.map((ev) => (
                      <div key={ev.id} className="rounded-lg border p-3 bg-white/80 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{ev.title}</p>
                          <span className="text-xs bg-black text-white px-2 py-1 rounded-full">{ev.code || 'SIN-CODIGO'}</span>
                        </div>
                        {ev.description && (
                          <p className="text-sm text-black/70 line-clamp-3">{ev.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-black/60">
                          <span className="px-2 py-1 rounded-full bg-black/5 border">Tipo: {ev.type}</span>
                          {ev.locations?.length ? (
                            <span className="px-2 py-1 rounded-full bg-black/5 border">
                              Ubicaciones: {ev.locations.map((l) => l.name).join(', ')}
                            </span>
                          ) : null}
                          {ev.characters?.length ? (
                            <span className="px-2 py-1 rounded-full bg-black/5 border">
                              Personajes: {ev.characters.map((c) => c.name).join(', ')}
                            </span>
                          ) : null}
                        </div>
                        {ev.lockReason && (
                          <p className="text-xs text-red-600">Bloqueada: {ev.lockReason}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Personajes y familias</CardTitle>
                  <CardDescription>Relaciones para tus asociaciones y preguntas de desbloqueo.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Personajes</p>
                    {caseFile.characters.length === 0 && (
                      <p className="text-sm text-black/60">Añade personajes para vincularlos a evidencias y eventos.</p>
                    )}
                    {caseFile.characters.map((character) => (
                      <div key={character.id} className="rounded-lg border p-3 bg-white/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{character.name}</p>
                          {character.role && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">{character.role}</span>
                          )}
                        </div>
                        {character.family?.name && (
                          <p className="text-xs text-black/60">Familia: {character.family.name}</p>
                        )}
                        {character.bio && <p className="text-sm text-black/70 line-clamp-2">{character.bio}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Familias</p>
                    {caseFile.families.length === 0 && (
                      <p className="text-sm text-black/60">Crea familias para agrupar personajes y evidencias.</p>
                    )}
                    {caseFile.families.map((family) => (
                      <div key={family.id} className="rounded-lg border p-3 bg-white/80 space-y-1">
                        <p className="font-semibold">{family.name}</p>
                        {family.type && (
                          <span className="text-xs px-2 py-1 rounded-full bg-black/5 border capitalize">{family.type}</span>
                        )}
                        {family.description && <p className="text-sm text-black/70 line-clamp-2">{family.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-lg font-semibold">No se pudo cargar el caso</p>
              <p className="text-black/60">Revisa tu código o vuelve a intentarlo más tarde.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}