"use client";

import { useEffect, useState } from "react";
import { FileUploadBox } from "@/components/upload/FileUploadBox";
import { AlertCircle } from "lucide-react";

export default function RapportUploadPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/get-session");
      const data = await res.json();

      if (data.user) {
        setSession(data.user);
      }
      setLoading(false);
    }

    fetchSession();
  }, []);

  // Loader plus propre
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-600">
        Chargement...
      </div>
    );
  }

  // Message si non connecté
  if (!session) {
    return (
      <div className="max-w-xl mx-auto p-6 flex items-center gap-3 text-red-600 border border-red-300 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>Vous devez être connecté pour accéder à cette page.</span>
      </div>
    );
  }

  // Restriction de rôle
  if (session.role !== "APPRENTI") {
    return (
      <div className="max-w-xl mx-auto p-6 flex items-center gap-3 text-red-600 border border-red-300 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>Accès réservé aux apprentis.</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Déposer votre Rapport Final</h1>

      <div className="p-4 border rounded-xl bg-gray-50 text-gray-700">
        Assurez-vous de déposer la version définitive de votre rapport.  
        Les formats acceptés sont généralement <strong>PDF</strong>.
      </div>

      <div className="border rounded-xl p-6 shadow-sm">
        <FileUploadBox
          label="Upload du Rapport"
          journalSlotId={1} 
        />
      </div>
    </div>
  );
}
