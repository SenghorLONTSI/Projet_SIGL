{/*"use server";

import { prisma } from "@/lib/prisma";
//import { Role } from "@prisma/client";
import type { Role } from "@/generated/prisma";


// les données nécessaires pour créer un User + sa ligne liée
type CreateUserWithRoleInput = {
  email: string;
  name: string;
  subName?: string | null;
  image?: string | null;
  role: Role;        // "APPRENTI" | "MA" | "TP" | ...
  idMA?: string;     // optionnel, pour les apprentis
  idTP?: string;     // optionnel, pour les apprentis
};

export async function createUserWithRole(input: CreateUserWithRoleInput) {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ Création du User
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        subName: input.subName ?? null,
        image: input.image ?? null,
        role: input.role,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 2️⃣ En fonction du rôle, on crée la ligne associée

    if (user.role === "APPRENTI") {
      await tx.apprenti.create({
        data: {
          id: user.id,           // on réutilise l'id du user
          userId: user.id,
          name: user.name,
          subName: user.subName,
          // idMA et idTP sont optionnels dans le schéma -> on ne les met que s'ils existent
          ...(input.idMA && { idMA: input.idMA }),
          ...(input.idTP && { idTP: input.idTP }),
        },
      });
    }

    if (user.role === "MA") {
      await tx.ma.create({
        data: {
          id: user.id,
          userId: user.id,
          name: user.name,
          subName: user.subName,
        },
      });
    }

    if (user.role === "TP") {
      await tx.tp.create({
        data: {
          id: user.id,
          userId: user.id,
          name: user.name,
          subName: user.subName,
        },
      });
    }

    // 3️⃣ On renvoie le user (tu peux aussi renvoyer les relations si tu veux)
    return user;
  });
}*/}
