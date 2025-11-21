"use server";
import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { rolePermissions } from "./permissions";
import { prisma } from "@/lib/prisma";

export const getSession = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        return null;
    }
    return session;
}

export const getUser = async () => {
    const session = await getSession();
    if (!session) {
        return null;
    }
    return session?.user || null;


}
//US-02-1 Mise en place du middleware requireRole
/**
 * Vérifie si l'utilisateur de la session a la permission d'effectuer une action.
 * Lance une erreur `Response` (403 Forbidden) si l'autorisation est refusée.
 * @param {object} session - L'objet session de l'utilisateur.
 * @param {string} action - L'action à vérifier (ex: "journal:create").
 */
export async function requireRole(session, action) {
    const role = session?.user?.role;

    if (!role) {
        // Cas où la session existe mais qu'on n'a pas de rôle défini
        throw new Response(JSON.stringify({ error: "Forbidden: no role" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    const allowedActions = rolePermissions[role] || [];

    if (!allowedActions.includes(action)) {
        throw new Response(
            JSON.stringify({
                error: "Forbidden: insufficient permissions",
                detail: { role, action },
            }),
            {
                status: 403,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

/**
 * Vérifie que l'utilisateur de la session est le propriétaire d'une ressource.
 * Lance une erreur 403 si l'utilisateur n'est pas le propriétaire.
 * @param {object} session - L'objet session de l'utilisateur.
 * @param {string} resourceId - L'ID de la ressource à vérifier.
 * @param {string} resourceType - Le type de ressource (ex: "journal").
 */


export async function requireOwnership(session, resourceId, resourceType) {
    const userId = session.user.id;
    const ma = await prisma.ma.findUnique({
        where: { userId },
        select: { id: true }
    });

    /*
        //US 02-2  Middleware requireOwnership() pour un Journal
    */
    // vérifier si l'apprenti est bien le propriétaire du journal
    if (resourceType === 'journal') {
        const assignmentId = typeof resourceId === "string" ? Number(resourceId) : resourceId;
        if (!Number.isInteger(assignmentId)) {
            throw new Response(JSON.stringify({ error: "id invalide" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        journal = await prisma.journalAssignment.findUnique({
            where: { id: assignmentId },
            select: { apprentiId: true, userId: true },
        });
        if (!journal || journal.apprentiId !== userId) {
            throw new Response(
                JSON.stringify({
                    error: "Interdit: vous n'êtes pas propriétaire de cette ressource.",
                    detail: { userId, resourceId, resourceType },
                }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

    }

    // Vérifier si le MA est bien rattaché à l'apprenti du journal
    if (resourceType === "comment") {
        const assignmentId = typeof resourceId === "string" ? Number(resourceId) : resourceId;
        if (!Number.isInteger(assignmentId)) {
            throw new Response(JSON.stringify({ error: "id invalide" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const maRow = await prisma.ma.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        if (!maRow) {
            throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const canAccess = await prisma.journalAssignment.findFirst({
            where: { id: assignmentId, apprenti: { idMA: maRow.id } },
            select: { id: true },
        });
        if (!canAccess) {
            throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        return;
    }
    // Ajoutez d'autres types de ressources ici si nécessaire


}