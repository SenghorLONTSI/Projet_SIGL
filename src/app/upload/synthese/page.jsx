"use client";

import { useEffect, useState } from "react";
import { FileUploadBox } from "@/components/upload/FileUploadBox";

export default function SyntheseUploadPage() {
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

  if (loading) return <div className="p-6">Chargement...</div>;

  if (!session) {
    return (
      <div className="p-6 text-red-600">
        Vous devez être connecté pour accéder à cette page.
      </div>
    );
  }

  // Restriction aux apprentis
  if (session.role !== "APPRENTI") {
    return (
      <div className="p-6 text-red-600">
        Accès réservé aux apprentis.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Fiche de Synthèse</h1>
      <p className="text-muted-foreground">Téléversez ici votre fiche de synthèse.</p>

      <FileUploadBox 
        label="Upload de la Synthèse"
        journalSlotId={2} // ID numérique correct du slot Synthèse
        multiple={false}
      />
    </div>
  );
}
