import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET(req) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return Response.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let events = [];

    if (userRole === "APPRENTI") {
      // Apprenti : voir ses propres événements
      events = await prisma.event.findMany({
        where: {
          userId: userId,
        },
        include: {
          apprenti: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  subName: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              subName: true,
            },
          },
        },
        orderBy: { startDate: "asc" },
      });
    } else if (userRole === "TP" || userRole === "MA") {
      // TP/MA : voir les événements de leurs apprentis
      const apprentices = await prisma.apprenti.findMany({
        where: {
          [userRole === "TP" ? "idTP" : "idMA"]: {
            in: await prisma[userRole === "TP" ? "tp" : "ma"]
              .findUnique({
                where: { userId },
                select: { id: true },
              })
              .then(record => record ? [record.id] : []),
          },
        },
        select: { id: true },
      });

      const apprenticeIds = apprentices.map(a => a.id);

      events = await prisma.event.findMany({
        where: {
          OR: [
            { userId: userId }, // Ses propres événements
            { apprentiId: { in: apprenticeIds } }, // Événements de ses apprentis
          ],
        },
        include: {
          apprenti: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  subName: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              subName: true,
            },
          },
        },
        orderBy: { startDate: "asc" },
      });
    }

    return Response.json(events);
  } catch (error) {
    console.error("❌ Erreur GET /api/calendar:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    console.log("📥 POST /api/calendar - Début");
    
    const session = await getSession();
    console.log("👤 Session:", session?.user?.id, "Role:", session?.user?.role);

    if (!session?.user) {
      return Response.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("📦 Body reçu:", body);

    const { title, description, type, eventType, startDate, endDate, apprentiId, location } = body;

    // Validation
    if (!title || !startDate || !endDate) {
      console.warn("⚠️ Validation échouée - données manquantes");
      return Response.json(
        { error: "Titre, date de début et date de fin sont obligatoires" },
        { status: 400 }
      );
    }

    console.log("🔧 Création Event avec Prisma...");

    let finalApprenticeId = apprentiId;

    // Si l'utilisateur est un apprenti, lier l'événement à lui-même
    if (session.user.role === "APPRENTI") {
      const apprenti = await prisma.apprenti.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      finalApprenticeId = apprenti?.id || null;
    }
    
    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        eventType: type || eventType || "REUNION",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        userId: session.user.id,
        apprentiId: finalApprenticeId,
      },
      include: {
        apprenti: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                subName: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            subName: true,
          },
        },
      },
    });

    console.log("✅ Event créé:", event.id);
    return Response.json(event, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST /api/calendar:", error.message);
    console.error("Stack:", error.stack);
    return Response.json(
      { error: error.message || "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return Response.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return Response.json(
        { error: "ID d'événement manquant" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement appartient à l'utilisateur
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== session.user.id) {
      return Response.json(
        { error: "Événement non trouvé ou accès refusé" },
        { status: 404 }
      );
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id: eventId },
    });

    return Response.json(
      { message: "Événement supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur DELETE /api/calendar:", error);
    return Response.json(
      { error: "Erreur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}
