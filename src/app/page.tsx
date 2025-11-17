// src/app/journaux/page.tsx

type Statut = "NON_COMMENCE" | "EN_COURS" | "TERMINE";

type JournalItem = {
  assignmentId: number;
  titre: string;
  periode: string;
  dueAt: string;
  nbSlotsRequis: number;
  nbSlotsDéposés: number;
  statutGlobal: Statut;
};

// 🔹 FAUX journaux juste pour le front (pas de base de données)
const journauxMock: JournalItem[] = [
  {
    assignmentId: 1,
    titre: "Journal de stage Q1",
    periode: "2025-Q1",
    dueAt: "15/04/2025",
    nbSlotsRequis: 4,
    nbSlotsDéposés: 2,
    statutGlobal: "EN_COURS",
  },
  {
    assignmentId: 2,
    titre: "Rapport final de projet",
    periode: "2025-Q2",
    dueAt: "30/06/2025",
    nbSlotsRequis: 0,
    nbSlotsDéposés: 0,
    statutGlobal: "NON_COMMENCE",
  },
];

export default function JournauxPage() {
  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px" }}>
        Mes journaux (demo front)
      </h1>

      {journauxMock.length === 0 ? (
        <p>Aucun journal assigné.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {journauxMock.map((j) => (
            <article
              key={j.assignmentId}
              style={{
                border: "1px solid #ddd",
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
                    Période {j.periode} • Échéance {j.dueAt}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    borderRadius: "999px",
                    border: "1px solid #ccc",
                    padding: "4px 10px",
                  }}
                >
                  {j.nbSlotsDéposés}/{j.nbSlotsRequis} requis • {j.statutGlobal}
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
                <div style={{ background: "#f7f7f7", padding: "8px", borderRadius: "8px" }}>
                  <div style={{ color: "#777" }}>assignmentId</div>
                  <div style={{ fontWeight: 500 }}>{j.assignmentId}</div>
                </div>
                <div style={{ background: "#f7f7f7", padding: "8px", borderRadius: "8px" }}>
                  <div style={{ color: "#777" }}>période</div>
                  <div style={{ fontWeight: 500 }}>{j.periode}</div>
                </div>
                <div style={{ background: "#f7f7f7", padding: "8px", borderRadius: "8px" }}>
                  <div style={{ color: "#777" }}>nbSlotsRequis</div>
                  <div style={{ fontWeight: 500 }}>{j.nbSlotsRequis}</div>
                </div>
                <div style={{ background: "#f7f7f7", padding: "8px", borderRadius: "8px" }}>
                  <div style={{ color: "#777" }}>nbSlotsDéposés</div>
                  <div style={{ fontWeight: 500 }}>{j.nbSlotsDéposés}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
