import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";
import Link from "next/link";
import UploadDocument from "@/components/UploadDocument";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toString();
  }
}

export default async function JournalDetailPage({ params }) {
  const journalId = params.id;

  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Accès refusé.</p>
      </main>
    );
  }

  const idInt = Number(journalId);
  if (Number.isNaN(idInt)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Identifiant de journal invalide.</p>
      </main>
    );
  }

  const assignment = await prisma.journalAssignment.findUnique({
    where: { id: idInt },
    include: {
      template: { include: { slot: true } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!assignment) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Journal introuvable.</p>
      </main>
    );
  }

  const t = assignment.template;

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/journaux"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:underline"
        >
          ← Retour aux journaux
        </Link>

        <section className="bg-white p-6 rounded-2xl shadow space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {t?.Titre || t?.code || "Journal"}
          </h1>

          <p className="text-sm text-slate-700">
            <b>Période :</b> {t?.periode || "—"}
            <br />
            <b>Échéance :</b> {formatDate(t?.deadline)}
            <br />
            <b>Statut :</b>{" "}
            <span
              className={
                assignment.statut === "EN_COURS"
                  ? "text-blue-700"
                  : assignment.statut === "TERMINE"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              {assignment.statut.replace("_", " ")}
            </span>
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow space-y-3">
          <h2 className="text-lg font-semibold">Description du journal</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {t?.description || "Aucune description fournie."}
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Dépôt de document</h2>

          <p className="text-sm text-slate-600">
            Déposez ici votre fichier (PDF, DOCX, image...).<br />
            1 seul fichier est requis pour ce journal.
          </p>

          {/* ✅ IMPORTANT : on passe le doc soumis au composant */}
          <UploadDocument
            journalAssignmentId={assignment.id}
            initialDocument={assignment.documents?.[0] ?? null}
          />
        </section>
      </div>
    </main>
  );
}
