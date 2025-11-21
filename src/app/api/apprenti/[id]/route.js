//TODO: Récupérer les informations de l'apprenti par ID
// app/api/apprenti/[id]/route.js

import { getSession, requireRole } from "@/lib/auth-server";
import { ACTIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { use } from "react";

export async function POST(request) {
    try {
        // 1) Auth obligatoire
        const session = await getSession();
        if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // 2) Vérifier que ce rôle a le droit de créer un journal
        // requireRole(session, ACTIONS.JOURNAL_CREATE);

        // 3) Ici tu es sûr :
        //    - user authentifié
        //    - role = APPRENTI (avec nos règles actuelles)
        //    - Prochaine étape : créer le journal avec apprenti_id = session.user.id

        // TODO: Insérer le journal dans la base de données...

        const body = await request.json().catch(() => ({}));
        const templateId = body?.templateId;
        if (typeof templateId !== "number") {
            return new Response(JSON.stringify({ error: "templateId (number) is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        const apprenti = await prisma.apprenti.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        if (!apprenti) {
            return new Response(JSON.stringify({ error: "Apprenti non trouvé pour cet utilisateur" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        const assignment = await prisma.journalAssignment.create({
            data: { templateId, apprentiId: apprenti.id },
        });
        return new Response(JSON.stringify(assignment, { message: "Journal créé" }), { status: 201, headers: { "Content-Type": "application/json" } });


    } catch (err) {
        if (err instanceof Response) return err; // `authorize` renvoie déjà la bonne réponse
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function GET(_request, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { id } = await (params);
        if (!id) {
            return new Response(JSON.stringify({ error: "Apprenti ID is required" }), { status: 400 });
        }

        const apprenti = await prisma.apprenti.findUnique({
            where: { id: (id) },
            include: { user: true },
        });
        if (!apprenti) {
            return new Response(JSON.stringify({ error: "Apprenti not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(apprenti), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Errorrr" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
