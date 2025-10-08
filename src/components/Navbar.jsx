"use client"

import Link from "next/link"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
      {/* Logo / nom du site */}
      <Link href="/" className="text-xl font-bold text-blue-600">
        MonApp
      </Link>

      {/* Liens de navigation */}
      <div className="flex items-center gap-6">
        <Link href="/login" className="text-gray-700 hover:text-blue-600">
          Accueil
        </Link>
        <Link href="/about" className="text-gray-700 hover:text-blue-600">
          À propos
        </Link>
        <Link href="/contact" className="text-gray-700 hover:text-blue-600">
          Contact
        </Link>
      </div>
    </nav>
  )
}
