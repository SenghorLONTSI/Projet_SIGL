import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-white text-center px-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">À propos de MonApp</h1>
        <p className="text-gray-700 max-w-2xl">
          MonApp est une application conçue pour simplifier la gestion des utilisateurs et la
          connexion sécurisée. Son interface est intuitive, rapide et construite avec Next.js et shadcn/ui.
        </p>
      </main>
      <Footer />
    </>
  )
}
