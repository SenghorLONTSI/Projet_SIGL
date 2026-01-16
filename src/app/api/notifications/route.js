import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les notifications non lues de l'utilisateur
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        apprenti: {
          include: { user: true },
        },
      },
    });

    // Compter les notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return Response.json({ notifications, unreadCount });
  } catch (error) {
    console.error("❌ Erreur notifications:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    // Marquer la notification comme lue
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return Response.json({ notification });
  } catch (error) {
    console.error("❌ Erreur mise à jour notification:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression notification:", error);
    return Response.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
