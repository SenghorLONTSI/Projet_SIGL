export const runtime = "nodejs";

// src/app/api/MA/liste_apprentis/route.ts
import { NextResponse } from "next/server";
import { getSession, getUser, requireRole } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
  }

  // 1️⃣ On récupère le MA lié à ce user
  const ma = await prisma.ma.findUnique({
    where: { userId: user.id },
  });

  //verifier le rôle MA
  requireRole(session, "apprenti:assignment:view");

  if (!ma) {
    return NextResponse.json(
      { error: "Vous n'êtes pas enregistré en tant que MA." },
      { status: 403 }
    );
  }

  // 2️⃣ On récupère les apprentis liés à ce MA, avec leur TP + user du TP
  const apprentis = await prisma.apprenti.findMany({
    where: { idMA: ma.id },
    include: {
      user: true, // user de l'apprenti
      tp: {
        include: {
          user: true, // user du TP (pour l'email)
        },
      },
    },
  });

  return NextResponse.json({ apprentis });
}

