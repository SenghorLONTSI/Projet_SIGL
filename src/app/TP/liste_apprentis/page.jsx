"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function getInitials(name = "", subName = "") {
  const parts = `${name} ${subName}`.trim().split(" ");
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function MesApprentisTPPage() {
  const [apprentis, setApprentis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadApprentis() {
      try {
        const res = await fetch("/api/TP/liste_apprentis");

        if (!res.ok) throw new Error("Erreur de chargement");

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

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mes apprentis</h1>

      {/* états loading / erreur / vide comme avant... */}

      {!loading && !error && apprentis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {apprentis.map((a) => (
            <Card
              key={a.id}
              className="aspect-square flex flex-col items-center justify-between shadow-sm border hover:shadow-md hover:bg-slate-50 transition-all p-4"
            >
              <CardHeader className="text-center p-0">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-lg font-bold">
                  {getInitials(a.name, a.subName)}
                </div>
                <CardTitle className="mt-3 text-md font-semibold text-gray-900">
                  {a.name} {a.subName ?? ""}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center text-xs text-gray-600 space-y-1 p-0">
                {/* Email de l'apprenti */}
                {a.user?.email && <p className="truncate">Email: {a.user.email}</p>}

                {/* Infos du MA */}
                {a.ma && (
                  <div className="mt-1">
                    <p className="font-semibold text-[11px] text-slate-700">
                      MA :
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">
                      {a.ma.name} {a.ma.subName ?? ""}
                    </p>
                    {a.ma.user?.email && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {a.ma.user.email}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
