"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function CardDemo() {
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulation d’API (2s)
    setTimeout(() => {
      setLoading(false)
      alert("Connexion réussie ✅")
    }, 2000)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button asChild variant="link">
             <a href="/signup">Sign Up</a>
          </Button>

        </CardAction>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                href="/forgot-password"
                className="ml-auto inline-block text-sm text-blue-600 hover:underline"
                >
                Forgot your password?
              </a>

                
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>

          <CardFooter className="flex flex-col gap-2 mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
