"use client"

import { useState } from "react"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import GameDashboard from "@/components/ui/GameDashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, CheckCircle } from "lucide-react"
import { useTranslations } from 'next-intl'

// Mock valid codes - in production, this would be validated via API
const VALID_CODES: Record<string, string> = {
  "MANSION2024": "The Mansion Mystery",
  "ARTHEIST2024": "The Art Heist",
  "HOTEL2024": "The Hotel Enigma"
}

export default function GameAccessPage() {
  const t = useTranslations('gameAccess');
  const [accessCode, setAccessCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gameTitle, setGameTitle] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = accessCode.toUpperCase().trim()
    
    if (VALID_CODES[code]) {
      setIsAuthenticated(true)
      setGameTitle(VALID_CODES[code])
      setError("")
    } else {
      setError(t('errorInvalidCode'))
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
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full border hover:bg-black hover:text-white cursor-pointer" size="lg">
                      {t('submitButton')}
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
                      <li>• MANSION2024</li>
                      <li>• ARTHEIST2024</li>
                      <li>• HOTEL2024</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="max-w-5xl mx-auto">
                <Alert className="mb-8">
                  <CheckCircle className="h-4 w-4 text-red" />
                  <AlertDescription className="text-red">
                    {t('successMessage')}
                  </AlertDescription>
                </Alert>
                <GameDashboard gameTitle={gameTitle} />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}