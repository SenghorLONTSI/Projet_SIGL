import { getSession, requireRole } from "@/lib/auth-server";
import { ACTIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return json({ error: "Unauthorized" }, 401);
        requireRole(session, ACTIONS.REVIEW_CREATE);

        const assignmentId = Number(params.id);
        if (!Number.isInteger(assignmentId)) return json({ error: "id invalide" }, 400);

        const { note, commentaire } = await request.json();
        if (note != null && !Number.isInteger(note)) return json({ error: "note doit être un entier" }, 400);

        const ma = await prisma.ma.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        if (!ma) return json({ error: "Forbidden" }, 403);

        const canAccess = await prisma.journalAssignment.findFirst({
            where: { id: assignmentId, apprenti: { idMA: ma.id } },
            select: { id: true },
        });
        if (!canAccess) return json({ error: "Forbidden" }, 403);

        const review = await prisma.review.create({
            data: {
                assignmentId,
                maId: session.user.id,
                note: note ?? null,
                commentaire: commentaire ?? null,
            },
        });

        return new Response(JSON.stringify(review), { status: 200 });
    } catch (err) {
        console.error(err);
        return json({ error: err?.code === "P2002" ? "Notation déjà enregistrée" : "Internal Server Error" }, 500);
    }
}

export async function GET(_request, { params }) {
    try {
        const session = await getSession();
        if (!session) return json({ error: "Unauthorized" }, 401);
        const paramsAwait = await (params);

        const assignmentId = Number(paramsAwait?.id);
        if (!Number.isInteger(assignmentId)) return json({ error: "id invalide" }, 400);

        // Autoriser MA lié OU l'apprenti propriétaire
        const userId = session.user.id;

        const ma = await prisma.ma.findUnique({
            where: { userId },
            select: { id: true },
        });

        let allowed = false;
        if (ma) {
            const link = await prisma.journalAssignment.findFirst({
                where: { id: assignmentId, apprenti: { idMA: ma.id } },
                select: { id: true },
            });
            allowed = !!link;
        } else {
            const apprenti = await prisma.apprenti.findUnique({
                where: { userId },
                select: { id: true },
            });
            if (apprenti) {
                const own = await prisma.journalAssignment.findFirst({
                    where: { id: assignmentId, apprentiId: apprenti.id },
                    select: { id: true },
                });
                allowed = !!own;
            }
        }

        if (!allowed) return json({ error: "Forbidden" }, 403);

        const reviews = await prisma.review.findMany({
            where: { assignmentId },
            orderBy: { createdAt: "desc" },
        });

        return json(reviews, 200);
    } catch (err) {
        console.error(err);
        return json({ error: "Internal Server Error" }, 500);
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getSession();
        if (!session) return json({ error: "Unauthorized" }, 401);
        requireRole(session, ACTIONS.REVIEW_UPDATE);

        const assignmentId = Number(params.id);
        if (!Number.isInteger(assignmentId)) return json({ error: "id invalide" }, 400);

        const { note, commentaire } = await request.json();
        if (note != null && !Number.isInteger(note)) return json({ error: "note doit être un entier" }, 400);

        const ma = await prisma.ma.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        if (!ma) return json({ error: "Forbidden" }, 403);

        const canAccess = await prisma.journalAssignment.findFirst({
            where: { id: assignmentId, apprenti: { idMA: ma.id } },
            select: { id: true },
        });
        if (!canAccess) return json({ error: "Forbidden" }, 403);

        const existing = await prisma.review.findUnique({
            where: { assignmentId },
            select: { assignmentId: true, maId: true },
        });
        if (!existing) return json({ error: "Aucune revue à mettre à jour" }, 404);
        if (existing.maId !== session.user.id) return json({ error: "Forbidden" }, 403);

        const updated = await prisma.review.update({
            where: { assignmentId },
            data: {
                note: note ?? null,
                commentaire: commentaire ?? null,
            },
        });

        return new Response(JSON.stringify(updated), { status: 200 });
    } catch (err) {
        console.error(err);
        return json({ error: "Internal Server Error" }, 500);
    }
}