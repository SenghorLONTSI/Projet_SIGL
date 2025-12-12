// src/app/api/TP/liste_apprentis/route.js
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id)
      return Response.json({ error: "Non authentifié" }, { status: 401 });

    // Charger le TP
    const tp = await prisma.tp.findUnique({
      where: { userId: session.user.id },
    });

    if (!tp)
      return Response.json({ error: "Aucun TP trouvé" }, { status: 404 });

    // Charger les apprentis liés au TP
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
      orderBy: { name: "asc" },
    });

    return Response.json({ apprentis });
  } catch (err) {
    console.error("Erreur API TP:", err);
    return Response.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
