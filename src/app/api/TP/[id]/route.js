import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = await params || {};
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID tuteur pedagogique requis" }),
        { status: 400 }
      );
    }

    const tp = await prisma.tp.findUnique({
      where: { userId: id },
      include: { user: true, apprenti: true },
    });

    if (!tp) {
      return new Response(
        JSON.stringify({ error: "Tuteur pedagogique non trouve" }),
        { status: 404 }
      );
    }

    const { apprenti, ...rest } = tp;
    return new Response(
      JSON.stringify({ ...rest, apprentis: apprenti }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { id } = await params || {};
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID tuteur pedagogique requis" }),
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const apprentiUserIds = Array.isArray(body?.apprentiUserIds)
      ? body.apprentiUserIds
      : null;

    if (!apprentiUserIds) {
      return new Response(
        JSON.stringify({ error: "apprentiUserIds doit etre un tableau" }),
        { status: 400 }
      );
    }

    const tp = await prisma.tp.findUnique({
      where: { userId: id },
      select: { id: true },
    });

    if (!tp) {
      return new Response(
        JSON.stringify({ error: "Tuteur pedagogique non trouve" }),
        { status: 404 }
      );
    }

    const currentApprentis = await prisma.apprenti.findMany({
      where: { idTP: tp.id },
      select: { userId: true },
    });

    const currentIds = currentApprentis.map((app) => app.userId);
    const toRemove = currentIds.filter(
      (userId) => !apprentiUserIds.includes(userId)
    );
    const toAdd = apprentiUserIds.filter(
      (userId) => !currentIds.includes(userId)
    );

    if (toRemove.length) {
      await prisma.apprenti.updateMany({
        where: { userId: { in: toRemove } },
        data: { idTP: null },
      });
    }

    if (toAdd.length) {
      await prisma.apprenti.updateMany({
        where: { userId: { in: toAdd } },
        data: { idTP: tp.id },
      });
    }

    const updatedApprentis = await prisma.apprenti.findMany({
      where: { idTP: tp.id },
    });

    return new Response(JSON.stringify({ updatedApprentis }), {
      status: 200,
    });
  } catch (err) {
    console.error("Erreur lors de la mise a jour des apprentis du TP:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export const runtime = "nodejs";
