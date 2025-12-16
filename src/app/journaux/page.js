// src/app/journal/page.js
import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toString();
  }
}

// Récupère tous les journaux
async function getAssignments() {
  return prisma.journalAssignment.findMany({
    include: {
      template: {
        include: { slot: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function JournauxPage() {
  // Protection d’accès
  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Accès refusé</h1>
          <p className="text-slate-600">
            Vous devez être connecté en tant qu&apos;apprenti pour accéder à cette page.
          </p>
        </div>
      </main>
    );
  }

  const assignments = await getAssignments();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* HEADER + bouton retour */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mes journaux de bord
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Liste de tous vos journaux à compléter. Cliquez sur &quot;Compléter&quot; pour
              voir le détail et déposer vos documents.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </header>

        {/* MESSAGE SI AUCUN JOURNAL */}
        {assignments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 text-sm">
            Aucun journal n&apos;a encore été créé.
          </div>
        )}

        {/* LISTE DES JOURNAUX (vue simplifiée) */}
        <div className="space-y-4">
          {assignments.map((a) => {
            const t = a.template;
            const slot = t?.slot || null;
            const nbSlotsRequis = slot ? 1 : 0;
            const nbSlotsDeposes = slot?.nbFiles ?? 0;

            return (
              <article
                key={a.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 sm:px-6 py-4 flex flex-col gap-3"
              >
                {/* Titre + infos principales */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {t?.Titre || t?.code || "Journal"}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                      Période :{" "}
                      <span className="font-medium">
                        {t?.periode || "—"}
                      </span>{" "}
                      • Échéance :{" "}
                      <span className="font-medium">
                        {formatDate(t?.deadline)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-slate-50 text-[11px] sm:text-xs text-slate-700 border border-slate-200">
                      {nbSlotsDeposes}/{nbSlotsRequis} dépôt(s) requis
                    </div>

                    <span
                      className={
                        "px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium " +
                        (a.statut === "EN_COURS"
                          ? "bg-blue-100 text-blue-700"
                          : a.statut === "TERMINE"
                          ? "bg-green-100 text-green-700"
                          : a.statut === "EN_RETARD"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700")
                      }
                    >
                      {a.statut.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Bouton compléter */}
                <div className="flex justify-end">
                  <Link
                    href={`/journal/${a.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-blue-700 shadow-sm transition"
                  >
                    Compléter mon journal
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
