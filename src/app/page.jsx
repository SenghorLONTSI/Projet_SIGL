import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gray-50 text-center px-4">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Bienvenue sur MonApp 🚀
        </h1>
        <p className="text-gray-700 max-w-xl">
          MonApp est une pde l'étudiant en apprenlateforme conçue pour faciliter la collaboration .
        </p>
      </main>
      <Footer />
    </>
  )
}
