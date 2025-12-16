// src/app/api/profil/cv/file/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const apprenti = await prisma.apprenti.findUnique({
      where: { userId: user.id },
    });

    if (!apprenti) {
      return NextResponse.json(
        { error: "Apprenti introuvable" },
        { status: 404 }
      );
    }

    const doc = await prisma.document.findFirst({
      where: {
        apprentiId: apprenti.id,
        kind: "CV",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!doc || !doc.url) {
      return NextResponse.json(
        { error: "Aucun CV trouvé" },
        { status: 404 }
      );
    }

    const parts = doc.url.split(",");
    if (parts.length !== 2) {
      return NextResponse.json(
        { error: "CV stocké dans un format invalide" },
        { status: 500 }
      );
    }

    const base64 = parts[1];
    const buffer = Buffer.from(base64, "base64");

    const fileName = doc.fileName || "cv.pdf";
    const mimeType = doc.mimeType || "application/pdf";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error("Erreur envoi PDF:", e);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi du PDF" },
      { status: 500 }
    );
  }
}
