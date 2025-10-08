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

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    setError("")

    // Vérifier si les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas.")
      return
    }

    // Simulation d’inscription
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert("Compte créé avec succès ✅")
    }, 2000)
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>
              Remplissez les champs ci-dessous pour vous inscrire.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Message d’erreur */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <CardFooter className="flex flex-col gap-2 mt-4 p-0">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Déjà un compte ?{" "}
                  <a href="/login" className="text-blue-600 hover:underline">
                    Se connecter
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
