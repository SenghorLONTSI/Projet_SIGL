import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 text-center px-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Contactez-nous</h1>
        <p className="text-gray-700 max-w-lg">
          Vous pouvez nous joindre à l’adresse suivante :
        </p>
        <p className="mt-2 font-medium text-gray-900">contact@monapp.com</p>
      </main>
      <Footer />
    </>
  )
}
