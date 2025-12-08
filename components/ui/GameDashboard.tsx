"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, CheckCircle, Lock, FileText, Image as ImageIcon } from "lucide-react"

interface GameDashboardProps {
  gameTitle: string
}

export default function GameDashboard({ gameTitle }: GameDashboardProps) {
  const [clues, setClues] = useState<string[]>([
    "Witness saw a figure in a dark coat at 11:45 PM",
    "The safe was opened with the correct combination",
    "A torn piece of fabric was found at the scene"
  ])
  const [newClue, setNewClue] = useState("")
  const [solution, setSolution] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const addClue = () => {
    if (newClue.trim()) {
      setClues([...clues, newClue])
      setNewClue("")
    }
  }

  const submitSolution = () => {
    setSubmitted(true)
  }

  const downloadables = [
    { name: "Evidence Photos", type: "PDF", size: "2.4 MB", icon: FileText },
    { name: "Crime Scene Map", type: "PDF", size: "1.8 MB", icon: FileText },
    { name: "Suspect Profiles", type: "PDF", size: "3.2 MB", icon: FileText },
    { name: "Investigation Photos", type: "ZIP", size: "12.5 MB", icon: ImageIcon }
  ]

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{gameTitle}</h1>
        <p className="text-black/50">Your private investigation dashboard</p>
      </div>

      <Tabs defaultValue="clues" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clues">Clues</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="clues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collected Clues</CardTitle>
              <CardDescription>
                Keep track of all the evidence you've discovered. Add new clues as you find them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {clues.map((clue, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{clue}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <Label htmlFor="new-clue">Add New Clue</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-clue"
                    placeholder="Enter a new clue you've discovered..."
                    value={newClue}
                    onChange={(e) => setNewClue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addClue()}
                  />
                  <Button onClick={addClue}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Solution</CardTitle>
              <CardDescription>
                Think you've cracked the case? Submit your solution below. You can modify it anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitted ? (
                <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Solution Submitted!</h3>
                  </div>
                  <p className="text-black/50 mb-4">Your solution has been recorded. You can update it anytime.</p>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{solution}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSubmitted(false)}
                  >
                    Edit Solution
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="solution">Your Solution</Label>
                    <Textarea
                      id="solution"
                      placeholder="Who committed the crime? What was their motive? How did they do it? Explain your reasoning..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={submitSolution}
                    disabled={!solution.trim()}
                    className="w-full"
                  >
                    Submit Solution
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Downloadable Materials</CardTitle>
              <CardDescription>
                Access all graphic materials, evidence photos, and documents for your investigation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {downloadables.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-primary/10">
                        <file.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-black/50">
                          {file.type} • {file.size}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-black/50 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Additional Materials Locked</p>
                    <p className="text-sm text-black/50">
                      More evidence will be unlocked as you progress through the game. Check back later!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
