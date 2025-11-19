"use client";

import Link from "next/link";

export default function UploadDashboard({ user }) {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4 border border-muted rounded-lg">
      <h2 className="text-xl font-bold text-center">Vos uploads</h2>

      <div className="space-y-2">
        <Link
          href="/upload/rapport"
          className="block text-center p-3 border rounded hover:bg-gray-100"
        >
          Déposer le Rapport Final
        </Link>

        <Link
          href="/upload/synthese"
          className="block text-center p-3 border rounded hover:bg-gray-100"
        >
          Déposer la Fiche de Synthèse
        </Link>

        <Link
          href="/upload/complementaires"
          className="block text-center p-3 border rounded hover:bg-gray-100"
        >
          Déposer les Documents Complémentaires
        </Link>
      </div>
    </div>
  );
}
