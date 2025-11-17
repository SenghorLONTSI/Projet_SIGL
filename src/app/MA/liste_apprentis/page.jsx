"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function MesApprentisPage() {
  const [apprentis, setApprentis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadApprentis() {
      try {
        const res = await fetch("/api/MA/liste_apprentis");

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Erreur de chargement");
        }

        const data = await res.json();
        setApprentis(data.apprentis || []);
      } catch (err) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    loadApprentis();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <p>Chargement des apprentis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 space-y-4">
        <h1 className="text-2xl font-bold">Mes apprentis</h1>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Mes apprentis</h1>

      {apprentis.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Aucun apprenti ne vous est assigné en tant que MA.
        </p>
      ) : (
        <div className="space-y-3">
          {apprentis.map((a) => (
            <Card key={a.id} className="groupe">
              <CardHeader className="group">
                <CardTitle className="text-green-500 group-hover:text-blue-900 transition-colors duration-300">
                  {a.name} {a.subName ?? ""}
                </CardTitle>
              </CardHeader>
              {/* UI détaillée possible ici (CardContent…) */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
