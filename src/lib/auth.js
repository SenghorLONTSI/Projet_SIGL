// src/lib/auth.js
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";      // <-- assure-toi que prisma.js est dans le même dossier
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
        input: false, // l'utilisateur ne peut pas changer son rôle lui-même
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
});

/**
 * requireApprenti
 * - récupère la session via Better Auth
 * - vérifie que l'utilisateur a bien le rôle "APPRENTI"
 * - renvoie session.user (id, email, role, etc.)
 * - lève une erreur si non connecté ou mauvais rôle
 */
export async function requireApprenti() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("NOT_AUTHENTICATED");
  }

  if (session.user.role !== "APPRENTI") {
    throw new Error("NOT_APPRENTI");
  }

  return session.user;
}
