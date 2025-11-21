// app/api/journal/[id]/route.js

import { getSession, requireRole, requireOwnership } from "@/lib/auth-server";
import { ACTIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { use } from "react";
/**
 * Mettre à jour un journal
 */
export async function PUT(request, { params }) {
    try {
        const journalId = params.id;
        const body = await request.json();
        console.log(body);

        // 1. Auth obligatoire
        const session = await getSession();
        if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // 2. Vérifier le rôle (APPRENTI)
        requireRole(session, ACTIONS.JOURNAL_UPDATE);

        // 3. Vérifier la propriété (ownership)
        await requireOwnership(session, journalId, 'journal');

        // 4. Mettre à jour le journal dans la base de données
        const updatedJournal = await prisma.journal.update({
            where: { id: journalId },
            data: body,
        });

        return Response.json(updatedJournal);

    } catch (err) {
        if (err instanceof Response) return err;
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

/**
 * Supprimer un journal
 */
export async function DELETE(request, { params }) {
    try {
        const journalId = params.id;

        // 1. Auth obligatoire
        const session = await getSession();
        if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // 2. Vérifier le rôle (APPRENTI)
        authorize(session, ACTIONS.JOURNAL_DELETE);

        // 3. Vérifier la propriété (ownership)
        await requireOwnership(session, journalId, 'journal');

        // 4. Supprimer le journal
        await prisma.journal.delete({ where: { id: journalId } });

        return new Response(null, { status: 204 }); // 204 No Content
    } catch (err) {
        if (err instanceof Response) return err;
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

//Récuperer les journaux
export async function GET(request, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const journalId = await (params).id;
        const journal = await prisma.journalAssignment.findMany({
            where: { apprentiId: journalId }
        });

        if (!journal) {
            return new Response(JSON.stringify({ error: "Journal not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(journal), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}