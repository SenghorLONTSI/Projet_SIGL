import { requireApprenti } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EntretiensPage() {
  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Accès refusé.</p>
      </main>
    );
  }

  // 🔹 TEMPORAIRE (mock UI) — remplacé par Prisma plus tard
  const entretiens = [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Mes entretiens
          </h1>

          {/* Bouton créer */}
          <Link
            href="/entretiens/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            ➕ Créer un entretien
          </Link>
        </div>

        {/* LISTE */}
        {entretiens.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-slate-600 mb-4">
              Aucun entretien programmé.
            </p>

          
          </div>
        ) : (
          <div className="space-y-4">
            {entretiens.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-2xl shadow p-6 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h2 className="font-semibold text-slate-900">
                    Entretien
                  </h2>

                  <p className="text-sm text-slate-600">
                    📅 {e.date} à {e.heure}
                  </p>

                  <p className="text-sm text-slate-600">
                    👥 Participants : MA, TP
                  </p>

                  <p className="text-sm text-slate-600">
                    📝 Thème : {e.theme || "—"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full
                      ${
                        e.statut === "TERMINE"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {e.statut === "TERMINE" ? "TERMINÉ" : "À FAIRE"}
                  </span>

                  <Link
                    href={`/entretiens/${e.id}`}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    Voir plus →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
