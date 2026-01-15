import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// GET - Récupérer les événements
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const apprentiId = searchParams.get("apprentiId");

    let whereClause = {};

    // Si apprenti, ne voir que ses événements
    if (session.user.role === "APPRENTI") {
      whereClause.apprentiId = session.user.id;
    }
    // Si MA et apprentiId fourni, voir les événements de cet apprenti
    else if (session.user.role === "MA" && apprentiId) {
      whereClause.apprentiId = apprentiId;
    }
    // Si MA sans apprentiId, voir tous les événements de ses apprentis
    else if (session.user.role === "MA") {
      const ma = await prisma.ma.findUnique({
        where: { userId: session.user.id },
        include: { apprenti: { select: { id: true } } },
      });

      if (ma) {
        whereClause.apprentiId = {
          in: ma.apprenti.map(a => a.id),
        };
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        apprenti: {
          include: {
            user: {
              select: {
                name: true,
                subName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}

// POST - Créer un événement
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, type, startDate, endDate, location, apprentiId } = data;

    // Validation
    if (!title || !type || !startDate) {
      return NextResponse.json(
        { error: "Titre, type et date de début sont requis" },
        { status: 400 }
      );
    }

    let targetApprentiId = apprentiId;
    let maId = null;

    // Si apprenti crée l'événement
    if (session.user.role === "APPRENTI") {
      targetApprentiId = session.user.id;
    }
    // Si MA crée l'événement
    else if (session.user.role === "MA") {
      if (!apprentiId) {
        return NextResponse.json(
          { error: "ID de l'apprenti requis" },
          { status: 400 }
        );
      }

      // Vérifier que le MA a accès à cet apprenti
      const ma = await prisma.ma.findUnique({
        where: { userId: session.user.id },
        include: {
          apprenti: {
            where: { id: apprentiId },
          },
        },
      });

      if (!ma || ma.apprenti.length === 0) {
        return NextResponse.json(
          { error: "Apprenti non trouvé ou non autorisé" },
          { status: 403 }
        );
      }

      maId = ma.id;
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location,
        apprentiId: targetApprentiId,
        maId,
      },
      include: {
        apprenti: {
          include: {
            user: {
              select: {
                name: true,
                subName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un événement
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "ID de l'événement requis" },
        { status: 400 }
      );
    }

    // Vérifier les permissions
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        apprenti: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les droits de suppression
    const canDelete =
      session.user.role === "MA" ||
      (session.user.role === "APPRENTI" && event.apprentiId === session.user.id);

    if (!canDelete) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cet événement" },
        { status: 403 }
      );
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}