import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await requireApprenti();

    const { searchParams } = new URL(req.url);
    const journalAssignmentId = Number(searchParams.get("journalAssignmentId"));

    if (!journalAssignmentId || Number.isNaN(journalAssignmentId)) {
      return NextResponse.json(
        { ok: false, error: "journalAssignmentId manquant" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findFirst({
      where: { journalAssignmentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, document: doc || null });
  } catch (e) {
    console.error("LATEST DOC ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur (latest)" },
      { status: 500 }
    );
  }
}
