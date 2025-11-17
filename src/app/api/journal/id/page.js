// src/app/journaux/[id]/page.js
import { prisma } from "../../../lib/prisma";
import { requireApprenti } from "../../../lib/auth";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toString();
  }
}

async function getAssignment(id, apprentiId) {
  const intId = Number(id);
  if (Number.isNaN(intId)) return null;

  return prisma.journalAssignment.findFirst({
    where: {
      id: intId,
      apprentiId, // on s'assure que ce journal appartient bien à l'apprenti connecté
    },
    include: {
      template: true,
      // plus tard : slots, documents, etc.
    },
  });
}

export default async function JournalDetailPage({ params }) {
  // 1) Vérifier que l'utilisateur est bien un apprenti connecté
  let user;
  try {
    user = await requireApprenti();
  } catch (e) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Accès refusé</h1>
        <p>Vous devez être connecté en tant qu&apos;apprenti pour accéder à cette page.</p>
      </div>
    );
  }

  const { id } = params;

  // 2) Récupérer l'affectation du journal (JournalAssignment)
  const assignment = await getAssignment(id, user.id);

  if (!assignment) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Journal introuvable</h1>
        <p>Ce journal n&apos;existe pas ou ne vous appartient pas.</p>
      </div>
    );
  }

  const template = assignment.template;

  return (
    <div className="livret-root" style={{ minHeight: "100vh" }}>
      <main className="journal-detail-main">
        <div className="journal-detail-header">
          <h1>{template?.Titre || template?.code || "Journal de formation"}</h1>
          <p className="journal-detail-sub">
            Période : {template?.periode || "—"} · Deadline :{" "}
            {formatDate(template?.deadline)}
          </p>
          <p className="journal-detail-status">
            Statut :
            <span
              className={`badge badge-${assignment.statut.toLowerCase()}`}
              style={{ marginLeft: 8 }}
            >
              {assignment.statut.replace("_", " ")}
            </span>
          </p>
        </div>

        <div className="journal-detail-content">
          <section className="journal-detail-card">
            <h2>Description du journal</h2>
            <p>
              {template?.description ||
                "Aucune description fournie pour ce journal."}
            </p>
          </section>

          <section className="journal-detail-card">
            <h2>Vos livrables</h2>
            <p>
              Ici, vous pourrez plus tard téléverser vos fichiers (PDF, DOC,
              etc.) ou remplir un formulaire associé au journal.
            </p>
            <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
              ⚠️ Pour l&apos;instant, la partie upload / slots / documents n&apos;est
              pas encore implémentée.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
