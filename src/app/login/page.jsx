import { Navbar } from "@/components/Navbar"
import { CardDemo } from "@/components/CardDemo"
import { Footer } from "@/components/Footer"

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <CardDemo />
      </div>
      <Footer />
    </>
  )
}
