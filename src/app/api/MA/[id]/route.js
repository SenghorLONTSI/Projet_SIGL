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
        JSON.stringify({ error: "ID maitre d'apprentissage requis" }),
        { status: 400 }
      );
    }

    const ma = await prisma.ma.findUnique({
      where: { userId: id },
      include: { user: true, apprenti: true },
    });

    if (!ma) {
      return new Response(
        JSON.stringify({ error: "Maitre d'apprentissage non trouve" }),
        { status: 404 }
      );
    }

    const { apprenti, ...rest } = ma;
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
        JSON.stringify({ error: "ID maitre d'apprentissage requis" }),
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

    const ma = await prisma.ma.findUnique({
      where: { userId: id },
      select: { id: true },
    });

    if (!ma) {
      return new Response(
        JSON.stringify({ error: "Maitre d'apprentissage non trouve" }),
        { status: 404 }
      );
    }

    const currentApprentis = await prisma.apprenti.findMany({
      where: { idMA: ma.id },
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
        data: { idMA: null },
      });
    }

    if (toAdd.length) {
      await prisma.apprenti.updateMany({
        where: { userId: { in: toAdd } },
        data: { idMA: ma.id },
      });
    }

    const updatedApprentis = await prisma.apprenti.findMany({
      where: { idMA: ma.id },
    });

    return new Response(JSON.stringify({ updatedApprentis }), {
      status: 200,
    });
  } catch (err) {
    console.error("Erreur lors de la mise a jour des apprentis du MA:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export const runtime = "nodejs";
