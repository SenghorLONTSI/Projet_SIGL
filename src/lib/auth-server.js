
import { headers } from "next/headers";
import { auth } from "../lib/auth";

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

export const Actions = {
    JOURNAL_CREATE: "journal:create",
    JOURNAL_UPDATE: "journal:update",
    REVIEW_CREATE: "review:create",
    REVIEW_UPDATE: "review:update",
};

const rolePermissions = {
    APPRENTI: [
        Actions.JOURNAL_CREATE,
        Actions.JOURNAL_UPDATE,
    ],
    MA: [
        Actions.REVIEW_CREATE,
        Actions.REVIEW_UPDATE,
    ],
    TP: [],
    CA: [],
    JURY: [],
};

// Vérifie si l'utilisateur a la permission pour une action donnée
export function requireRole(session, action) {
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