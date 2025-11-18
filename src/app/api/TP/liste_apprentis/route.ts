// src/app/api/TP/liste_apprentis/route.ts
import { NextResponse } from "next/server";
import { getSession, getUser } from "@/lib/auth-server";
// ⚠️ adapte l'import selon ton setup : soit "@/lib/prisma", soit "@/generated/prisma"
import { prisma } from "@/lib/prisma"; 
// ou éventuellement :
// import { PrismaClient } from "@/generated/prisma";
// const prisma = new PrismaClient();

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
  }

  // 1️⃣ On récupère le TP lié à ce user
  const tp = await prisma.tp.findUnique({
    where: { userId: user.id },
  });

  if (!tp) {
    return NextResponse.json(
      { error: "Vous n'êtes pas enregistré en tant que TP." },
      { status: 403 }
    );
  }

  // 2️⃣ On récupère les apprentis liés à ce TP, avec leurs MA + user du MA
  const apprentis = await prisma.apprenti.findMany({
    where: { idTP: tp.id },
    include: {
      user: true,   // user de l'apprenti
      ma: {
        include: {
          user: true, // user du MA (pour l'email)
        },
      },
    },
  });

  return NextResponse.json({ apprentis });
}
