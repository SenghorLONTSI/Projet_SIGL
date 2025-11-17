// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma"; // <- ../lib/prisma si ton fichier est ailleurs
import { headers } from "next/headers";

// Instance Better Auth
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false, // l'utilisateur ne peut pas changer son rôle
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
});

/**
 * Récupère la session via Better Auth
 * et vérifie que l'utilisateur est un APPRENTI.
 * - lève une erreur si pas connecté ou mauvais rôle
 * - renvoie l'objet user (session.user) sinon
 */
export async function requireApprenti() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("NOT_AUTHENTICATED");
  }

  // on suppose que le rôle "APPRENTI" sera mis sur l'utilisateur
  if (session.user.role !== "APPRENTI") {
    throw new Error("NOT_APPRENTI");
  }

  // ici tu peux juste renvoyer le user Better-Auth
  return session.user;
}
