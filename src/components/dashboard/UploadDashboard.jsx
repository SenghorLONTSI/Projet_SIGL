"use client";

import Link from "next/link";
import { FileText, FilePlus2, FolderOpen } from "lucide-react";
import DepositStatusApprenti from "@/components/upload/DepositStatusApprenti";

export default function UploadDashboard({ user }) {
  // 🔧 MOCK temporaire
  const depositStart = "2025-05-01";
  const depositEnd = "2025-05-31";

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6 border border-muted rounded-2xl shadow-sm bg-white">
      <h2 className="text-2xl font-bold text-center">
        Espace de Dépôt
      </h2>

      {/* 📅 État du dépôt */}
      <DepositStatusApprenti
        startDate={depositStart}
        endDate={depositEnd}
      />

      <p className="text-center text-gray-600">
        Sélectionnez le type de document que vous souhaitez déposer.
      </p>

      <div className="space-y-3">
        <Link
          href="/upload/rapport"
          className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition"
        >
          <FileText className="w-5 h-5 text-gray-700" />
          <span className="font-medium">
            Déposer le Rapport Final
          </span>
        </Link>

        <Link
          href="/upload/synthese"
          className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition"
        >
          <FilePlus2 className="w-5 h-5 text-gray-700" />
          <span className="font-medium">
            Déposer la Fiche de Synthèse
          </span>
        </Link>

        <Link
          href="/upload/complementaires"
          className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition"
        >
          <FolderOpen className="w-5 h-5 text-gray-700" />
          <span className="font-medium">
            Déposer les Documents Complémentaires
          </span>
        </Link>
      </div>
    </div>
  );
}
