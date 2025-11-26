// src/app/api/journals/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireApprenti } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// GET /api/journals/:id
export async function GET(_request, { params }) {
  try {
    // 1) Vérifier l'apprenti connecté
    let user;
    try {
      user = await requireApprenti();
    } catch (e) {
      return NextResponse.json(
        { error: "Non authentifié ou non apprenti" },
        { status: 401 }
      );
    }

    const assignmentId = Number(params.id);
    if (Number.isNaN(assignmentId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    // 2) Récupérer l'affectation + template + slot + documents
    const assignment = await prisma.journalAssignment.findFirst({
      where: {
        id: assignmentId,
        apprentiId: user.id, // sécurité : doit appartenir à l'apprenti connecté
      },
      include: {
        template: {
          include: {
            slot: true,
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Journal introuvable" },
        { status: 404 }
      );
    }

    const slot = assignment.template?.slot || null;

    const response = {
      id: assignment.id,
      statut: assignment.statut,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,

      template: {
        id: assignment.template?.id,
        code: assignment.template?.code,
        titre: assignment.template?.Titre,
        periode: assignment.template?.periode,
        description: assignment.template?.description,
        deadline: assignment.template?.deadline,
      },

      slot: slot
        ? {
            id: slot.id,
            titre: slot.titre,
            instruction: slot.instruction,
            mimeAuthorized: slot.mimeAuthorized,
            maxSize: slot.maxSize,
            dueAt: slot.dueAt,
            isRequired: slot.isrequired,
            statut: slot.statut,
            lastSubmissionAt: slot.lastsubmissionAt,
            nbFiles: slot.nbFiles,
          }
        : null,

      documents: assignment.documents.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        size: doc.size,
        url: doc.url,
        status: doc.status,
        createdAt: doc.createdAt,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/journals/[id] :", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
