// src/app/journaux/page.js
import { prisma } from "../../lib/prisma";
import { requireApprenti } from "../../lib/auth";
import Link from "next/link";
import TopNav from "../../components/TopNav";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toString();
  }
}

// On ne filtre pas par apprentiId : tous les journaux
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
  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Accès refusé</h1>
          <p>
            Vous devez être connecté en tant qu&apos;apprenti pour accéder à cette
            page.
          </p>
        </div>
      </main>
    );
  }

  const assignments = await getAssignments();

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Mes journaux</h1>
          <p className="text-slate-600">
            Voici la liste des journaux à compléter.
          </p>
        </header>

        {assignments.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Aucun journal n&apos;a encore été créé.
          </div>
        )}

        <div className="space-y-4">
          {assignments.map((a) => {
            const t = a.template;
            const slot = t?.slot || null;
            const nbSlotsRequis = slot ? 1 : 0;
            const nbSlotsDeposes = slot?.nbFiles ?? 0;

            return (
              <article
                key={a.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-5 flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t?.Titre || t?.code || `Journal`}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Période {t?.periode || "—"} • Échéance{" "}
                      {formatDate(t?.deadline)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
                      {nbSlotsDeposes}/{nbSlotsRequis} dépôt(s) requis
                    </div>
                    <span
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
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

                {t?.description && (
                  <p className="text-sm text-slate-700">{t.description}</p>
                )}

                <div className="flex justify-end">
                  <Link
                    href={`/journaux/${a.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 transition"
                  >
                    Compléter
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
