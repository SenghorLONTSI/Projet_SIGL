"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function TpDashboard() {
  const [me, setMe] = useState(null);
  const [apprentis, setApprentis] = useState([]);
  const [search, setSearch] = useState("");

  // Charger l'utilisateur connecté
  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (res.ok) setMe(data.user);
    }
    loadUser();
  }, []);

  // Charger les apprentis liés au TP
  useEffect(() => {
    async function loadApprentis() {
      const res = await fetch("/api/TP/liste_apprentis");
      const data = await res.json();
      if (res.ok) setApprentis(data.apprentis);
    }
    loadApprentis();
  }, []);

  // Filtre recherche
  const filtered = apprentis.filter((a) =>
    a.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {me?.name ?? "..."}</h1>
          <p className="text-gray-500">Tuteur pédagogique</p>
        </div>

        {/* Avatar + Infos */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-300 rounded-full flex items-center justify-center text-white font-bold">
            {me?.name?.[0]?.toUpperCase() ?? "?"}
          </div>

          <div>
            <p className="font-semibold">{me?.name ?? "Chargement..."}</p>
            <p className="text-xs text-gray-500">{me?.role ?? ""}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-4 space-y-4">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-400 rounded-full mb-4 flex items-center justify-center text-white text-3xl font-bold">
                {me?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <h2 className="text-xl font-bold">{me?.name ?? "..."}</h2>
              <p className="text-sm text-gray-500">{me?.role ?? ""}</p>
              <p className="mt-2 text-sm text-gray-500">✉ {me?.email ?? ""}</p>
            </div>
          </div>

          {/* CV / Portfolio */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white rounded-xl shadow p-6 text-center font-semibold">
              📄 CV
            </button>
            <button className="bg-white rounded-xl shadow p-6 text-center font-semibold">
              🌐 Portfolio
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — LISTE DES APPRENTIS */}
        <div className="col-span-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Liste des apprentis</h2>

          {/* SEARCH BAR */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              className="w-full border rounded-lg pl-10 pr-3 py-2"
              placeholder="Rechercher un apprenti..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* APPRENTI CARDS */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm">
                Aucun apprenti trouvé...
              </p>
            )}

            {filtered.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-purple-300 rounded-full flex items-center justify-center text-white font-bold">
                    {a.user.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{a.user.name}</p>
                    <p className="text-xs text-gray-500">
                      MA : {a.ma?.user?.name ?? "Non assigné"}
                    </p>
                  </div>
                </div>

                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                  Voir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

