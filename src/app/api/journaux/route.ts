import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";

type Statut = "NON_COMMENCE" | "EN_COURS" | "TERMINE";

function formatISO(d?: Date | null) {
  return d ? new Date(d).toISOString() : null;
}

export async function GET() {
  try {
    // RBAC: apprenti uniquement
    const { apprentiId } = await requireApprenti();

    // Charge les assignments de cet apprenti (+ template, slots, docs)
    const assignments = await prisma.journalAssignment.findMany({
      where: { apprentiId },
      include: {
        template: {
          include: {
            slots: {
              include: {
                documents: {
                  // adapte la règle si besoin (par ex: seulement SUBMITTED)
                  where: { OR: [{ status: "SUBMITTED" }, { status: "UPLOADED" }] },
                  select: { id: true }
                }
              }
            }
          }
        },
        // documents rattachés directement à l’affectation (journal sans slots)
        documents: {
          where: { OR: [{ status: "SUBMITTED" }, { status: "UPLOADED" }] },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Transforme en DTO conforme à l'US-03A
    const data = assignments.map(a => {
      const slots = a.template.slots ?? [];
      const required = slots.filter(s => s.isRequired);

      const nbSlotsRequis = required.length;
      const nbSlotsDéposés = required.filter(s => s.documents.length > 0).length;

      // dueAt = max(dueAt des slots requis) sinon deadline du template
      const dueCandidates = required.map(s => s.dueAt).filter(Boolean) as Date[];
      const dueAt =
        dueCandidates.length > 0
          ? new Date(Math.max(...dueCandidates.map(d => (d as Date).getTime())))
          : a.template.deadline ?? null;

      // Statut global
      let statut: Statut = "NON_COMMENCE";
      if (nbSlotsRequis > 0) {
        if (nbSlotsDéposés === nbSlotsRequis) statut = "TERMINE";
        else if (nbSlotsDéposés > 0) statut = "EN_COURS";
      } else {
        // Cas journal SANS slots : 1 dépôt global attendu → terminé si ≥1 document sur l’affectation
        statut = a.documents.length > 0 ? "TERMINE" : "NON_COMMENCE";
      }

      return {
        assignmentId: a.id,
        titre: a.template.titre,
        periode: a.template.periode,
        dueAt: formatISO(dueAt),
        nbSlotsRequis,
        nbSlotsDéposés,
        statutGlobal: statut
      };
    });

    return NextResponse.json({ items: data });
  } catch (err: any) {
    // Gestion erreurs d’auth/RBAC simple
    if (err?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
