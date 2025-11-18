/**
 * @fileoverview Fichier central pour la gestion des permissions.
 * Définit les rôles, les actions et les permissions associées.
 */

/**
 * Énumération des rôles disponibles dans l'application.
 * L'utilisation d'un objet permet l'autocomplétion et évite les erreurs de frappe.
 */
export const ROLES = {
    APPRENTI: "APPRENTI",
    MA: "MA", // Maître d'Apprentissage
    TP: "TP", // Tuteur Pédagogique
    CA: "CA", // Chargé d'Affaires
    JURY: "JURY",
    USER: "USER", // Rôle par défaut
};

/**
 * Énumération des actions possibles sur les ressources de l'API.
 */
export const ACTIONS = {
    JOURNAL_CREATE: "journal:create",
    JOURNAL_UPDATE: "journal:update",
    JOURNAL_DELETE: "journal:delete",
    JOURNAL_VIEW: "journal:view",
    APPRENTI_ASS_VIEW: "apprenti:assignment:view",
    REVIEW_CREATE: "review:create",
    REVIEW_UPDATE: "review:update",
    REVIEW_COMMENT: "review:comment",
    REVIEW_NOTE: "review:note",
};

/**
 * Matrice des permissions par rôle.
 * Fait le lien entre un rôle et les actions qu'il est autorisé à effectuer.
 * @type {Record<string, string[]>}
 */
export const rolePermissions = {
    [ROLES.APPRENTI]: [
        ACTIONS.JOURNAL_CREATE,
        ACTIONS.JOURNAL_UPDATE,
        ACTIONS.JOURNAL_DELETE,
    ],
    [ROLES.MA]: [
        ACTIONS.REVIEW_CREATE,
        ACTIONS.REVIEW_UPDATE,
        ACTIONS.REVIEW_COMMENT,
        ACTIONS.REVIEW_NOTE,
        ACTIONS.APPRENTI_ASS_VIEW
    ],
    [ROLES.TP]: [],
    [ROLES.CA]: [],
    [ROLES.JURY]: [],
    [ROLES.USER]: [],
};