import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";
import { getUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireApprenti();
    const user = await getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const apprenti = await prisma.apprenti.findUnique({
      where: { userId: user.id },
    });
    if (!apprenti) return NextResponse.json({ ok: false }, { status: 401 });

    const items = await prisma.entretien.findMany({
      where: { apprentiId: apprenti.id },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("GET /api/entretiens", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await requireApprenti();
    const user = await getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const apprenti = await prisma.apprenti.findUnique({
      where: { userId: user.id },
    });
    if (!apprenti) return NextResponse.json({ ok: false }, { status: 401 });

    const body = await req.json();
    const startsAt = body?.startsAt ? new Date(body.startsAt) : null;

    const theme = (body?.theme || "").toString().slice(0, 250);
    const withMA = !!body?.withMA;
    const withTP = !!body?.withTP;
    const withCA = !!body?.withCA;

    if (!startsAt || Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ ok: false, error: "Date/heure invalide" }, { status: 400 });
    }
    if (!withMA && !withTP && !withCA) {
      return NextResponse.json({ ok: false, error: "Participants manquants" }, { status: 400 });
    }

    const created = await prisma.entretien.create({
      data: {
        apprentiId: apprenti.id,
        createdByUserId: user.id,
        startsAt,
        theme: theme || null,
        withMA,
        withTP,
        withCA,
        status: "PLANNED",
      },
    });

    return NextResponse.json({ ok: true, entretien: created });
  } catch (e) {
    console.error("POST /api/entretiens", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
