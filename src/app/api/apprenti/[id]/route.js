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
            where: { userId: id },
            include: { user: true, ma: true, tp: true },
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

export async function PATCH(request, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { id } = await params; // id ici correspond au userId de l'apprenti
        const body = await request.json();
        const data = {};

        // Gestion du Maître d'Apprentissage (MA)

        if (Object.prototype.hasOwnProperty.call(body, "maUserId")) {
            data.idMA = body.maUserId || null; // null ou "" => retire le MA
        }

        // Si le front envoie explicitement idTP (même null), on le traite
        if (Object.prototype.hasOwnProperty.call(body, "tpUserId")) {
            data.idTP = body.tpUserId || null; // null ou "" => retire le TP

            // Mise à jour de l'apprenti
            const updatedApprenti = await prisma.apprenti.update({
                where: { userId: id },
                data,
                include: { ma: true, tp: true },
            });

            return new Response(JSON.stringify(updatedApprenti), { status: 200 });
        }
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'apprenti:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
