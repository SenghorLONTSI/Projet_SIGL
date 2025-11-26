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
    HOME_APPRENTI_VIEW: "home:apprenti:view",
    HOME_MA_VIEW: "home:ma:view",
    HOME_TP_VIEW: "home:tp:view",
    HOME_CA_VIEW: "home:ca:view",
    HOME_JURY_VIEW: "home:jury:view",
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
        ACTIONS.HOME_APPRENTI_VIEW,
        ACTIONS.JOURNAL_CREATE,
        ACTIONS.JOURNAL_UPDATE,
        ACTIONS.JOURNAL_DELETE,
    ],
    [ROLES.MA]: [
        ACTIONS.HOME_MA_VIEW,
        ACTIONS.REVIEW_CREATE,
        ACTIONS.REVIEW_UPDATE,
        ACTIONS.REVIEW_COMMENT,
        ACTIONS.REVIEW_NOTE,
        ACTIONS.APPRENTI_ASS_VIEW
    ],
    [ROLES.TP]: [
        ACTIONS.HOME_TP_VIEW
    ],
    [ROLES.CA]: [
        ACTIONS.HOME_CA_VIEW
    ],
    [ROLES.JURY]: [
        ACTIONS.HOME_JURY_VIEW
    ],
    [ROLES.USER]: [],
};