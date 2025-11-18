"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [filterMA, setFilterMA] = useState("all"); // "all" | "with" | "without"

  useEffect(() => {
    async function loadApprentis() {
      try {
        const res = await fetch("/api/TP/liste_apprentis");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erreur de chargement");
        }

        setApprentis(data.apprentis || []);
      } catch (err) {
        setError(err?.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    loadApprentis();
  }, []);

  // 🔎 Filtrage local (recherche + filtre MA)
  const filteredApprentis = useMemo(() => {
    let list = [...apprentis];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const fullName = `${a.name ?? ""} ${a.subName ?? ""}`.toLowerCase();
        const apprEmail = a.user?.email?.toLowerCase() ?? "";
        const maName = `${a.ma?.name ?? ""} ${a.ma?.subName ?? ""}`.toLowerCase();
        const maEmail = a.ma?.user?.email?.toLowerCase() ?? "";

        return (
          fullName.includes(q) ||
          apprEmail.includes(q) ||
          maName.includes(q) ||
          maEmail.includes(q)
        );
      });
    }

    if (filterMA === "with") {
      list = list.filter((a) => !!a.ma);
    } else if (filterMA === "without") {
      list = list.filter((a) => !a.ma);
    }

    list.sort((a, b) =>
      `${a.name ?? ""} ${a.subName ?? ""}`.localeCompare(
        `${b.name ?? ""} ${b.subName ?? ""}`,
        "fr"
      )
    );

    return list;
  }, [apprentis, search, filterMA]);

  const total = apprentis.length;
  const withMA = apprentis.filter((a) => !!a.ma).length;
  const withoutMA = total - withMA;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 space-y-6">
      {/* Titre + sous-titre */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mes apprentis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisez vos apprentis, leurs coordonnées et les maîtres d&#39;apprentissage associés.
          </p>
        </div>
      </header>

      {/* Barre de stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-slate-200">
            <CardContent className="py-3 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total apprentis
              </p>
              <p className="text-2xl font-semibold">{total}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardContent className="py-3 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-emerald-700">
                Avec MA associé
              </p>
              <p className="text-2xl font-semibold text-emerald-800">{withMA}</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/60">
            <CardContent className="py-3 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-amber-700">
                Sans MA
              </p>
              <p className="text-2xl font-semibold text-amber-800">{withoutMA}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barre de recherche + filtres */}
      {!loading && !error && total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-2/3">
            <input
              type="text"
              placeholder="Rechercher par nom, email, MA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filtrer :</span>
            <button
              onClick={() => setFilterMA("all")}
              className={`px-3 py-1 rounded-full border text-xs transition ${
                filterMA === "all"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterMA("with")}
              className={`px-3 py-1 rounded-full border text-xs transition ${
                filterMA === "with"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Avec MA
            </button>
            <button
              onClick={() => setFilterMA("without")}
              className={`px-3 py-1 rounded-full border text-xs transition ${
                filterMA === "without"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Sans MA
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {loading && <p>Chargement...</p>}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && filteredApprentis.length === 0 && total > 0 && (
        <p className="text-sm text-slate-500">
          Aucun apprenti ne correspond à votre recherche / filtre.
        </p>
      )}

      {!loading && !error && total === 0 && (
        <p className="text-sm text-slate-500">
          Aucun apprenti assigné pour le moment.
        </p>
      )}

      {/* Grille des cartes */}
      {!loading && !error && filteredApprentis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApprentis.map((a) => (
            <Card
              key={a.id}
              className="flex flex-col border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2 pt-4 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-base font-semibold">
                  {getInitials(a.name, a.subName)}
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {a.name} {a.subName ?? ""}
                  </CardTitle>
                  <p className="text-xs text-slate-500">Apprenti(e)</p>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-1 text-sm text-slate-700 flex-1 flex flex-col gap-3">
                {/* Infos apprenti */}
                <div className="rounded-md border border-slate-100 bg-white/60 px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Coordonnées
                  </p>
                  {a.user?.email ? (
                    <p className="mt-1 text-xs truncate">
                      <span className="text-slate-500">Email : </span>
                      <span className="font-medium">{a.user.email}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">
                      Aucun email renseigné.
                    </p>
                  )}
                </div>

                {/* Infos MA */}
                <div className="rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                      Maître d&#39;apprentissage
                    </p>
                    <span
                      className={`px-2 py-[2px] rounded-full text-[10px] font-semibold ${
                        a.ma
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {a.ma ? "Assigné" : "Non assigné"}
                    </span>
                  </div>

                  {a.ma ? (
                    <div className="mt-1 space-y-1.5">
                      <p className="text-xs font-medium text-slate-800">
                        {a.ma.name} {a.ma.subName ?? ""}
                      </p>
                      {a.ma.user?.email && (
                        <p className="text-[11px] text-slate-600 truncate">
                          <span className="text-slate-500">Email : </span>
                          {a.ma.user.email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Aucun MA n&#39;est encore associé à cet apprenti.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
