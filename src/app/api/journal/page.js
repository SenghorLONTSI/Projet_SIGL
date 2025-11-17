// src/app/journaux/page.js
import { prisma } from "../../lib/prisma";
import { requireApprenti } from "../../lib/auth";
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

// Récupérer uniquement les journaux appartenant à l'apprenti connecté
async function getAssignments(apprentiId) {
  return prisma.journalAssignment.findMany({
    where: { apprentiId },
    include: { template: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function LivretPage() {
  // 1) Vérifier authentification + rôle apprenti
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

  // 2) Récupérer les journaux assignés
  const assignments = await getAssignments(user.id);

  // Nom complet (Better-auth)
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "Apprenti";

  return (
    <div className="livret-root">

      {/* HEADER */}
      <header className="livret-header">
        <div className="livret-header-overlay">
          <div className="livret-header-top">
            <h1>
              Bonjour {fullName}, bienvenue dans votre livret d&apos;alternance !
            </h1>
          </div>

          <div className="livret-header-content">
            
            {/* Bloc gauche : Infos apprenti */}
            <div className="livret-apprenti-block">
              <div className="livret-apprenti-name">{fullName}</div>
              <div className="livret-apprenti-role">
                {user.role || "Apprenti"}
              </div>
              <div className="livret-apprenti-contact">
                {user.email && <span>{user.email}</span>}
              </div>
            </div>

            {/* Bloc droite : Placeholder entreprise + école */}
            <div className="livret-apprenti-details">
              <div className="livret-detail-column">
                <div className="detail-label">Entreprise</div>
                <div className="detail-value">—</div>
                <div className="detail-sub"></div>
              </div>

              <div className="livret-detail-column">
                <div className="detail-label">Formation</div>
                <div className="detail-value">—</div>
                <div className="detail-sub"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="livret-main">
        
        {/* Bloc principal */}
        <section className="livret-section">
          <div className="livret-section-header">
            <h2>Mes prochaines étapes livret</h2>
            <p className="livret-section-sub">
              Vous avez {assignments.length} journal(aux) à compléter.
            </p>
          </div>

          <div className="livret-card">
            <div className="livret-card-header">
              <span className="livret-card-title">Journaux de formation</span>
            </div>

            <div className="livret-table-wrapper">
              <table className="livret-table">
                <thead>
                  <tr>
                    <th>Journal</th>
                    <th>Période</th>
                    <th>Statut</th>
                    <th>Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {/* Aucun journal */}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="livret-table-empty">
                        Aucun journal pour le moment.
                      </td>
                    </tr>
                  )}

                  {/* Liste */}
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="livret-journal-title">
                          {a.template?.Titre || a.template?.code}
                        </div>
                        {a.template?.description && (
                          <div className="livret-journal-desc">
                            {a.template.description}
                          </div>
                        )}
                      </td>

                      <td>{a.template?.periode || "—"}</td>

                      <td>
                        <span
                          className={`badge badge-${a.statut.toLowerCase()}`}
                        >
                          {a.statut.replace("_", " ")}
                        </span>
                      </td>

                      <td>{formatDate(a.template?.deadline)}</td>

                      <td>
                        <Link
                          href={`/journaux/${a.id}`}
                          className="livret-btn-primary"
                        >
                          Compléter
                        </Link>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ASIDE */}
        <aside className="livret-aside">

          <div className="livret-aside-block">
            <h3>Dernières notifications</h3>
            <p className="livret-aside-text">
              Vous avez {assignments.length} notification(s) en attente.
            </p>
          </div>

          <div className="livret-aside-block">
            <h3>Ressources</h3>
            <ul className="livret-aside-list">
              <li>Guide d’utilisation</li>
              <li>Règlement de l’alternance</li>
              <li>Contacts administratifs</li>
            </ul>
          </div>

        </aside>

      </main>
    </div>
  );
}
