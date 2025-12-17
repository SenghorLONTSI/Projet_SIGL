// src/app/api/TP/liste_apprentis/route.ts
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth-server";
import { ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    // 🔒 Authentification
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 🔐 Autorisation (TP uniquement)
    requireRole(session, ACTIONS.TP_LISTE_APPRENTIS_VIEW);

    // 🔍 Charger le TP lié à l’utilisateur
    const tp = await prisma.tp.findUnique({
      where: { userId: session.user.id },
    });

    if (!tp) {
      return NextResponse.json(
        { error: "Aucun TP trouvé pour cet utilisateur" },
        { status: 404 }
      );
    }

    // 📋 Charger les apprentis
    const apprentis = await prisma.apprenti.findMany({
      where: { tpId: tp.id },
      include: {
        user: true,
        ma: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        user: { name: "asc" },
      },
    });

    return NextResponse.json({ apprentis });
  } catch (error) {
    console.error("Erreur API TP/liste_apprentis :", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
