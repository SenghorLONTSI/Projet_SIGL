"use server";

import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { rolePermissions } from "./permissions";
import { prisma } from "@/lib/prisma";

/**
 * Convertit correctement les headers Next.js en objet simple
 */
function convertHeaders(h) {
    const obj = {};
    for (const [key, value] of h.entries()) {
        obj[key] = value;
    }
    return obj;
}

/**
 * Récupère la session BetterAuth en passant les headers correctement.
 */
export const getSession = async () => {
    try {
        const rawHeaders = await headers();
        const session = await auth.api.getSession({
            headers: convertHeaders(rawHeaders),
        });

        return session || null;
    } catch (err) {
        console.error("❌ getSession ERROR:", err);
        return null;
    }
};

export const getUser = async () => {
    const session = await getSession();
    return session?.user || null;
};

/**
 * Vérifie que l'utilisateur possède la permission
 */
export async function requireRole(session, action) {
    const role = session?.user?.role;

    if (!role) {
        throw new Response(JSON.stringify({
            error: "Forbidden: no role"
        }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    const allowedActions = rolePermissions[role] || [];
    if (!allowedActions.includes(action)) {
        throw new Response(JSON.stringify({
            error: "Forbidden: insufficient permissions",
            detail: { role, action },
        }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/**
 * Vérifie la propriété ou l'accès à une ressource
 */
export async function requireOwnership(session, resourceId, resourceType) {
    const userId = session.user.id;

    // Cas 1 : Apprenti → Vérification propriétaire du journal
    if (resourceType === "journal") {
        const assignmentId =
            typeof resourceId === "string" ? Number(resourceId) : resourceId;

        if (!Number.isInteger(assignmentId)) {
            throw new Response(JSON.stringify({ error: "id invalide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const journal = await prisma.journalAssignment.findUnique({
            where: { id: assignmentId },
            select: { apprentiId: true },
        });

        if (!journal || journal.apprentiId !== userId) {
            throw new Response(JSON.stringify({
                error: "Interdit: vous n'êtes pas propriétaire de cette ressource.",
            }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    // Cas 2 : MA → Vérifie si le journal appartient à un apprenti suivi
    if (resourceType === "comment") {
        const assignmentId =
            typeof resourceId === "string" ? Number(resourceId) : resourceId;

        if (!Number.isInteger(assignmentId)) {
            throw new Response(JSON.stringify({ error: "id invalide" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const maRow = await prisma.ma.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!maRow) {
            throw new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        const canAccess = await prisma.journalAssignment.findFirst({
            where: { id: assignmentId, apprenti: { idMA: maRow.id } },
        });

        if (!canAccess) {
            throw new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
}
