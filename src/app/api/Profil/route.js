// src/app/api/profil/cv/route.js
export const runtime = "nodejs"; // pour pouvoir utiliser Buffer

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getUser } from "@/lib/auth-server";

// POST = upload / remplacement du CV
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
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

    const form = await request.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier envoyé" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Seuls les fichiers PDF sont acceptés" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    const size = file.size ?? buffer.length;

    // On insère un nouveau Document de type CV
    const doc = await prisma.document.create({
      data: {
        apprentiId: apprenti.id,
        kind: "CV",
        fileName: file.name,
        mimeType: file.type,
        size,
        url: dataUrl,
      },
    });

    return NextResponse.json({ ok: true, cvName: doc.fileName });
  } catch (e) {
    console.error("Erreur upload CV:", e);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'upload du CV" },
      { status: 500 }
    );
  }
}

// GET = récupérer le dernier CV de l'apprenti
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

    return NextResponse.json({
      cvName: doc?.fileName ?? null,
      documentId: doc?.id ?? null,
    });
  } catch (e) {
    console.error("Erreur GET CV:", e);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du CV" },
      { status: 500 }
    );
  }
}
