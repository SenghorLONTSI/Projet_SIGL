import { prisma } from "../../lib/prisma";
import { requireApprenti } from "../../lib/auth";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    const dateObj = d instanceof Date ? d : new Date(d);
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
      dateObj
    );
  } catch (e) {
    return d?.toISOString ? d.toISOString() : String(d);
  }
}

export default async function JournauxPage() {
  // 1) Récupérer l'apprenti connecté (via cookie "session")
  let apprentiInfo;
  try {
    apprentiInfo = await requireApprenti();
  } catch {
    return (
      <div style={{ padding: 32 }}>
        <h1>Mes journaux</h1>
        <p>Vous devez être connecté en tant qu’apprenti.</p>
      </div>
    );
  }

  const { apprentiId } = apprentiInfo;

  // 2) Charger SES journaux
  const assignments = await prisma.journalAssignment.findMany({
    where: { apprentiId },
    include: {
      template: {
        include: {
          slots: {
            include: {
              documents: {
                where: {
                  OR: [{ status: "SUBMITTED" }, { status: "UPLOADED" }],
                },
                select: { id: true },
              },
            },
          },
        },
      },
      documents: {
        where: {
          OR: [{ status: "SUBMITTED" }, { status: "UPLOADED" }],
        },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (assignments.length === 0) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Mes journaux</h1>
        <p>Aucun journal assigné pour le moment.</p>
      </div>
    );
  }

  // 3) Préparer les données pour l'affichage
  const items = assignments.map((a) => {
    const slots = a.template.slots || [];
    const required = slots.filter((s) => s.isRequired);

    const nbSlotsRequis = required.length;
    const nbSlotsDéposés = required.filter(
      (s) => s.documents && s.documents.length > 0
    ).length;

    // dueAt = max(dueAt requis) ou deadline
    const dueCandidates = required
      .map((s) => s.dueAt)
      .filter((d) => d != null);

    const dueAt =
      dueCandidates.length > 0
        ? new Date(
            Math.max(
              ...dueCandidates.map((d) =>
                (d instanceof Date ? d : new Date(d)).getTime()
              )
            )
          )
        : a.template.deadline || null;

    // type de journal
    const hasSlots = nbSlotsRequis > 0 || slots.length > 0;
    const type = hasSlots ? "Journal structuré (avec slots)" : "Dépôt unique";

    // statut global
    let statut = "NON_COMMENCE";
    if (hasSlots) {
      if (nbSlotsRequis > 0 && nbSlotsDéposés === nbSlotsRequis) {
        statut = "TERMINE";
      } else if (nbSlotsDéposés > 0) {
        statut = "EN_COURS";
      }
    } else {
      // pas de slots : terminé si un doc au niveau assignment
      statut = a.documents && a.documents.length > 0 ? "TERMINE" : "NON_COMMENCE";
    }

    return {
      assignmentId: a.id,
      titre: a.template.titre,
      periode: a.template.periode,
      dueAt,
      nbSlotsRequis,
      nbSlotsDéposés,
      statutGlobal: statut,
      type,
    };
  });

  // 4) Affichage
  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px" }}>
        Mes journaux
      </h1>

      <div style={{ display: "grid", gap: "16px" }}>
        {items.map((j) => (
          <article
            key={j.assignmentId}
            style={{
              border: "1px solid rgba(211, 42, 42, 1)",
              borderRadius: "16px",
              padding: "16px",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 600 }}>
                  {j.titre}
                </h2>
                <p style={{ color: "#666" }}>
                  Période {j.periode} • Échéance {formatDate(j.dueAt)}
                </p>
                <p style={{ fontSize: "12px", color: "#888" }}>{j.type}</p>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  borderRadius: "999px",
                  border: "1px solid #ccc",
                  padding: "4px 10px",
                }}
              >
                {j.nbSlotsDéposés}/{j.nbSlotsRequis} requis •{" "}
                {j.statutGlobal}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "8px",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  background: "#f7f7f7",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#777" }}>assignmentId</div>
                <div style={{ fontWeight: 500 }}>{j.assignmentId}</div>
              </div>
              <div
                style={{
                  background: "#f7f7f7",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#777" }}>période</div>
                <div style={{ fontWeight: 500 }}>{j.periode}</div>
              </div>
              <div
                style={{
                  background: "#f7f7f7",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#777" }}>nbSlotsRequis</div>
                <div style={{ fontWeight: 500 }}>{j.nbSlotsRequis}</div>
              </div>
              <div
                style={{
                  background: "#f7f7f7",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#777" }}>nbSlotsDéposés</div>
                <div style={{ fontWeight: 500 }}>{j.nbSlotsDéposés}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
