"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage("")

    // Vérifie si l'email est vide
    if (!email) {
      setMessage("❌ Veuillez entrer votre adresse email.")
      return
    }

    setLoading(true)

    // Simulation d'envoi d'email de réinitialisation
    setTimeout(() => {
      setLoading(false)
      setMessage("✅ Un lien de réinitialisation a été envoyé à votre adresse email.")
      setEmail("")
    }, 2000)
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Message de confirmation ou d’erreur */}
              {message && (
                <p
                  className={`text-sm ${
                    message.startsWith("✅") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {message}
                </p>
              )}

              <CardFooter className="flex flex-col gap-2 mt-4 p-0">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </Button>

                <p className="text-sm text-gray-600 mt-2">
                  Revenir à la{" "}
                  <a href="/login" className="text-blue-600 hover:underline">
                    page de connexion
                  </a>
                </p>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
