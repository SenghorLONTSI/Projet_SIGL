// src/app/journaux/[id]/page.js
import { prisma } from "../../../lib/prisma";
import { requireApprenti } from "../../../lib/auth";
import Link from "next/link";
import TopNav from "../../../components/TopNav";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toString();
  }
}

async function getAssignmentById(id) {
  const intId = Number(id);
  if (Number.isNaN(intId)) return null;

  return prisma.journalAssignment.findUnique({
    where: { id: intId },
    include: {
      template: { include: { slot: true } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export default async function JournalDetailPage({ params }) {
  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Accès refusé</h1>
          <p>Vous devez être connecté en tant qu&apos;apprenti pour accéder à cette page.</p>
        </div>
      </main>
    );
  }

  const assignment = await getAssignmentById(params.id);

  if (!assignment) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold">Journal introuvable</h1>
            <p className="text-slate-600">
              Ce journal n&apos;existe pas.
            </p>
            <Link
              href="/journaux"
              className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 transition"
            >
              ← Retour à la liste des journaux
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const t = assignment.template;
  const slot = t?.slot || null;

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Bouton retour en haut de la page */}
        <div>
          <Link
            href="/journaux"
            className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-black transition"
          >
            ← Retour à la liste des journaux
          </Link>
        </div>

        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">
            {t?.Titre || t?.code || `Journal`}
          </h1>
          <p className="text-sm text-slate-600">
            Période {t?.periode || "—"} • Échéance {formatDate(t?.deadline)}
          </p>
          <p className="text-sm text-slate-700">
            Statut :{" "}
            <span className="font-semibold">
              {assignment.statut.replace("_", " ")}
            </span>
          </p>
        </header>

        {/* Description */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-2">
          <h2 className="text-lg font-semibold">Description du journal</h2>
          <p className="text-sm text-slate-700">
            {t?.description || "Aucune description fournie pour ce journal."}
          </p>
        </section>

        {/* Espace de dépôt (maquette) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <h2 className="text-lg font-semibold">Espace de dépôt</h2>

          <p className="text-sm text-slate-700">
            Déposez ici votre journal (rapport, compte-rendu, etc.).
            La logique d&apos;upload sera gérée par un autre membre de l&apos;équipe.
          </p>

          {slot && (
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase text-slate-500">
                  Titre du livrable
                </div>
                <div className="font-medium">{slot.titre}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">
                  Date limite
                </div>
                <div className="font-medium">{formatDate(slot.dueAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">
                  Obligatoire
                </div>
                <div className="font-medium">
                  {slot.isrequired ? "Oui" : "Non"}
                </div>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50">
            <p className="text-sm text-slate-700">
              Zone de dépôt des fichiers (interface uniquement).
            </p>
            <p className="text-xs text-slate-500">
              L&apos;implémentation technique de l&apos;upload sera faite plus tard (API,
              stockage, etc.).
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-full bg-slate-300 text-slate-600 text-sm font-medium px-4 py-2 cursor-not-allowed"
            >
              Choisir un fichier (non fonctionnel)
            </button>
          </div>
        </section>

        {/* Documents déjà déposés */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Documents déjà déposés</h2>

          {assignment.documents.length === 0 && (
            <p className="text-sm text-slate-600">
              Aucun document n&apos;a encore été déposé pour ce journal.
            </p>
          )}

          {assignment.documents.length > 0 && (
            <ul className="space-y-2 text-sm">
              {assignment.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"
                >
                  <div>
                    <div className="font-medium">{doc.fileName}</div>
                    <div className="text-xs text-slate-500">
                      {doc.mimeType} • {(doc.size / 1024).toFixed(1)} Ko
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">{doc.status}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
