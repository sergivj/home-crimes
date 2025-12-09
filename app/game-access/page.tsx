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
import { ActExperience } from "@/components/ui/ActExperience"
import type { Act } from "@/lib/strapi/api"

interface GameExperienceProduct {
  title: string
  slug: string
  acts: Act[]
}

export default function GameAccessPage() {
  const t = useTranslations('gameAccess');
  const searchParams = useSearchParams();
  const [accessCode, setAccessCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [product, setProduct] = useState<GameExperienceProduct | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [loadingExperience, setLoadingExperience] = useState(false)
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")

  const fallbackActs: Act[] = useMemo(() => ([
    {
      id: 'intro-act',
      title: 'Prólogo: Registro en la escena',
      order: 1,
      description: 'Una llamada anónima te deja en la puerta del edificio. Hay un plano, un QR borrado y una cinta de voz rota.',
      unlockType: 'auto',
      unlockCode: '',
      clues: [
        { id: 'c1', title: 'Nota del portero', type: 'text', content: '"Nadie sube sin mostrar la tarjeta roja"', order: 1, solution: '', previewImage: '', file: '' },
        { id: 'c2', title: 'Tarjeta roja escaneada', type: 'qr', content: 'El QR revela un código parcial: 14-0-?', order: 2, solution: '1408', previewImage: '', file: '' },
      ],
    },
    {
      id: 'suspect-act',
      title: 'Acto II: La coartada del sospechoso',
      order: 2,
      description: 'El sospechoso jura que estaba en el metro. Solo se desbloquea si cruzas sus pruebas.',
      unlockType: 'answer',
      unlockCode: '1408',
      clues: [
        { id: 'c3', title: 'Billete del metro', type: 'image', content: 'Hora marcada: 23:55', order: 1, solution: '', previewImage: '', file: '' },
        { id: 'c4', title: 'Cámara de seguridad', type: 'video', content: '¿Está realmente en el andén?', order: 2, solution: 'andén 3', previewImage: '', file: '' },
      ],
    },
    {
      id: 'final-act',
      title: 'Acto Final: Resolución',
      order: 3,
      description: 'Solo abre cuando afirmes haber reconstruido el archivo clave.',
      unlockType: 'fileSolved',
      unlockCode: '',
      isFinalStep: true,
      clues: [
        { id: 'c5', title: 'Dossier cifrado', type: 'puzzle', content: 'Introduce la palabra que completaba el QR.', order: 1, solution: '1408', previewImage: '', file: '' },
      ],
    },
  ]), [])

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
      setProduct(payload)
    } catch (err) {
      console.error(err)
      setProduct({ title: 'Sala de caso', slug: slug || 'demo', acts: fallbackActs })
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
          ) : (
            <div className="space-y-6">
              <div className="max-w-5xl mx-auto">
                <Alert className="mb-8">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-black">
                    {emailSentTo ? `Código validado. Revisa ${emailSentTo} por si quieres guardarlo.` : t('successMessage')}
                  </AlertDescription>
                </Alert>
                {loadingExperience && (
                  <div className="flex items-center gap-2 text-sm text-black/60 mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando actos y pistas desde el caso...
                  </div>
                )}
                {product && (
                  <ActExperience productTitle={product.title} acts={product.acts} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}